import path from "path";

import {
	Project,
	ScriptKind,
	SyntaxKind,
	type ClassDeclaration,
	type SourceFile,
} from "ts-morph";

import type { RepositoryChunk, RepositoryFile, RepositoryChunkKind } from "../../types";

const MAX_CHUNK_SIZE = 1500;
const MIN_CHUNK_SIZE = 100;
const AST_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const REACT_EXTENSIONS = new Set([".tsx", ".jsx"]);

// Singleton Project — avoids re-initializing the TS compiler for every file
let sharedProject: Project | null = null;
function getSharedProject(): Project {
	if (!sharedProject) {
		sharedProject = new Project({ useInMemoryFileSystem: true });
	}
	return sharedProject;
}

// React wrapper calls that wrap a component (memo, forwardRef, lazy, etc.)
const REACT_WRAPPERS = new Set(["memo", "forwardRef", "lazy", "observer"]);

export interface ChunkContext {
	repoId: string;
	repoName: string;
	namespace: string;
}

interface ChunkSeed {
	kind: RepositoryChunkKind;
	symbolName?: string;
	parentName?: string; // for methods: the class name
	startLine: number;
	endLine: number;
	content: string;
	imports?: string[];
	exports?: string[];
	directory?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function createChunkId(context: ChunkContext, filePath: string, index: number): string {
	return `${context.repoId}:${filePath}:${index}`;
}

function createChunk(
	context: ChunkContext,
	file: RepositoryFile,
	seed: ChunkSeed,
	index: number
): RepositoryChunk {
	const content = seed.content.trim();
	const symbolName = seed.parentName
		? `${seed.parentName}.${seed.symbolName}`
		: seed.symbolName;

	return {
		id: createChunkId(context, file.relativePath, index),
		repoId: context.repoId,
		repoName: context.repoName,
		namespace: context.namespace,
		filePath: file.relativePath,
		fileName: path.basename(file.relativePath),
		extension: file.extension,
		language: file.language,
		kind: seed.kind,
		chunkType: seed.kind,
		symbolName,
		chunkIndex: index,
		startLine: seed.startLine,
		endLine: seed.endLine,
		content,
		contentLength: content.length,
		imports: seed.imports ?? [],
		exports: seed.exports ?? [],
		directory: seed.directory ?? path.dirname(file.relativePath),
	};
}

// ─── Fallback: line-based chunking for non-AST files ────────────────────────

function chunkByLines(
	context: ChunkContext,
	file: RepositoryFile,
	content: string,
	kind: RepositoryChunkKind
): RepositoryChunk[] {
	const lines = content.split(/\r?\n/);
	const chunks: RepositoryChunk[] = [];
	let current: string[] = [];
	let startLine = 1;

	const flush = (endLine: number) => {
		const text = current.join("\n").trim();
		if (text) {
			chunks.push(createChunk(context, file, { kind, startLine, endLine, content: text }, chunks.length));
		}
	};

	for (let i = 0; i < lines.length; i++) {
		const next = current.join("\n").length + lines[i].length + 1;
		if (current.length > 0 && next > MAX_CHUNK_SIZE) {
			flush(i);
			current = [];
			startLine = i + 1;
		}
		if (current.length === 0) startLine = i + 1;
		current.push(lines[i]);
	}

	flush(lines.length);
	return chunks;
}

// ─── AST utilities ──────────────────────────────────────────────────────────

function getScriptKind(extension: string): ScriptKind {
	switch (extension) {
		case ".tsx": return ScriptKind.TSX;
		case ".jsx": return ScriptKind.JSX;
		case ".js":  return ScriptKind.JS;
		default:     return ScriptKind.TS;
	}
}

function extractImports(sourceFile: SourceFile): string[] {
	return sourceFile.getImportDeclarations().map((d) => d.getModuleSpecifierValue());
}

function extractExports(sourceFile: SourceFile): string[] {
	return Array.from(sourceFile.getExportedDeclarations().keys());
}

/**
 * Detect if a name looks like a React component (PascalCase).
 * Combined with file extension check for .tsx/.jsx.
 */
function isComponentName(name: string | undefined, isReactFile: boolean): boolean {
	if (!name || !isReactFile) return false;
	return /^[A-Z][A-Za-z0-9]*$/.test(name);
}

/**
 * Detect arrow/function-expression variables, including wrapped ones:
 *   const Foo = memo(() => ...)
 *   const Foo = forwardRef(...)
 *   const Foo: React.FC = () => ...
 */
function getFunctionVariableInfo(node: any): { name: string | undefined; isWrapped: boolean } | null {
	if (!node.isKind?.(SyntaxKind.VariableStatement)) return null;

	const decls = node.getDeclarationList().getDeclarations();
	if (decls.length !== 1) return null;

	const init = decls[0].getInitializer();
	if (!init) return null;

	// Direct arrow / function expression
	if (
		init.isKind(SyntaxKind.ArrowFunction) ||
		init.isKind(SyntaxKind.FunctionExpression)
	) {
		return { name: decls[0].getName(), isWrapped: false };
	}

	// Wrapped: memo(() => ...), forwardRef(...), etc.
	if (init.isKind(SyntaxKind.CallExpression)) {
		const expr = init.getExpression();
		const calleeName = expr.isKind(SyntaxKind.Identifier)
			? expr.getText()
			: expr.isKind(SyntaxKind.PropertyAccessExpression)
				? expr.getName()
				: null;

		if (calleeName && REACT_WRAPPERS.has(calleeName)) {
			return { name: decls[0].getName(), isWrapped: true };
		}
	}

	return null;
}

// ─── Class → class chunk + method chunks ────────────────────────────────────

function chunkClass(
	context: ChunkContext,
	file: RepositoryFile,
	node: ClassDeclaration,
	contentLines: string[],
	fileImports: string[],
	fileExports: string[],
	chunks: RepositoryChunk[]
): void {
	const className = node.getName() ?? undefined;
	const classStart = node.getStartLineNumber();
	const classEnd = node.getEndLineNumber();
	const classContent = contentLines.slice(classStart - 1, classEnd).join("\n");

	// Emit full class chunk — split if oversized
	if (classContent.length > MAX_CHUNK_SIZE) {
		const subChunks = chunkByLines(context, file, classContent, "class");
		for (const sub of subChunks) {
			sub.chunkIndex = chunks.length;
			sub.id = createChunkId(context, file.relativePath, chunks.length);
			sub.imports = fileImports;
			sub.exports = fileExports;
			chunks.push(sub);
		}
	} else {
		chunks.push(createChunk(context, file, {
			kind: "class",
			symbolName: className,
			startLine: classStart,
			endLine: classEnd,
			content: classContent,
			imports: fileImports,
			exports: fileExports,
		}, chunks.length));
	}

	// Emit each method as its own chunk
	for (const method of node.getMethods()) {
		const methodName = method.getName();
		const start = method.getStartLineNumber();
		const end = method.getEndLineNumber();
		const content = contentLines.slice(start - 1, end).join("\n");

		if (content.trim().length < MIN_CHUNK_SIZE) continue; // skip trivial getters etc.

		chunks.push(createChunk(context, file, {
			kind: "method",
			symbolName: methodName,
			parentName: className,
			startLine: start,
			endLine: end,
			content,
			imports: fileImports,
			exports: fileExports,
		}, chunks.length));
	}
}

// ─── Main AST chunker ───────────────────────────────────────────────────────

function chunkAstFile(
	context: ChunkContext,
	file: RepositoryFile,
	content: string
): RepositoryChunk[] {
	const project = getSharedProject();
	const tempFileName = `temp_${Date.now()}${file.extension}`;
	const sourceFile = project.createSourceFile(
		tempFileName,
		content,
		{ scriptKind: getScriptKind(file.extension), overwrite: true }
	);

	const fileImports = extractImports(sourceFile);
	const fileExports = extractExports(sourceFile);
	const isReactFile = REACT_EXTENSIONS.has(file.extension);
	const contentLines = content.split(/\r?\n/);
	const chunks: RepositoryChunk[] = [];

	// Pending module-level lines to be grouped into one module chunk
	let moduleLines: string[] = [];
	let moduleStart = -1;
	let moduleEnd = -1;

	const flushModule = () => {
		if (moduleLines.length === 0) return;
		const text = moduleLines.join("\n").trim();
		if (text.length >= MIN_CHUNK_SIZE) {
			chunks.push(createChunk(context, file, {
				kind: "module",
				startLine: moduleStart,
				endLine: moduleEnd,
				content: text,
				imports: fileImports,
				exports: fileExports,
			}, chunks.length));
		} else if (chunks.length > 0) {
			// Merge tiny module chunk into the previous chunk's content
			const prev = chunks[chunks.length - 1];
			prev.content = (prev.content + "\n" + text).trim();
			prev.contentLength = prev.content.length;
			prev.endLine = moduleEnd;
		}
		// If still nothing to merge into (first chunk, too small), discard —
		// it's just imports which are captured in the imports[] metadata field.
		moduleLines = [];
		moduleStart = -1;
		moduleEnd = -1;
	};

	const flushNamed = (seed: ChunkSeed) => {
		flushModule();
		const text = seed.content.trim();
		if (text.length > MAX_CHUNK_SIZE) {
			// Oversized: split by lines, attach file-level metadata
			const subChunks = chunkByLines(context, file, text, seed.kind);
			for (const sub of subChunks) {
				sub.chunkIndex = chunks.length;
				sub.id = createChunkId(context, file.relativePath, chunks.length);
				sub.imports = fileImports;
				sub.exports = fileExports;
				chunks.push(sub);
			}
			return;
		}
		chunks.push(createChunk(context, file, {
			...seed,
			imports: fileImports,
			exports: fileExports,
		}, chunks.length));
	};

	for (const node of sourceFile.getStatements()) {
		// ── Class declarations → class chunk + method chunks ────────────────
		if (node.isKind(SyntaxKind.ClassDeclaration)) {
			chunkClass(context, file, node, contentLines, fileImports, fileExports, chunks);
			continue;
		}

		// ── Named function declarations ──────────────────────────────────────
		if (node.isKind(SyntaxKind.FunctionDeclaration)) {
			const name = node.getName() ?? undefined;
			const { startLine, endLine } = { startLine: node.getStartLineNumber(), endLine: node.getEndLineNumber() };
			const nodeContent = contentLines.slice(startLine - 1, endLine).join("\n");
			const kind: RepositoryChunkKind = isComponentName(name, isReactFile) ? "component" : "function";
			flushNamed({ kind, symbolName: name, startLine, endLine, content: nodeContent });
			continue;
		}

		// ── Variable declarations (arrow fn, wrapped components) ────────────
		const varInfo = getFunctionVariableInfo(node);
		if (varInfo) {
			const startLine = node.getStartLineNumber();
			const endLine = node.getEndLineNumber();
			const nodeContent = contentLines.slice(startLine - 1, endLine).join("\n");
			const kind: RepositoryChunkKind =
				isComponentName(varInfo.name, isReactFile) || varInfo.isWrapped
					? "component"
					: "function";
			flushNamed({ kind, symbolName: varInfo.name, startLine, endLine, content: nodeContent });
			continue;
		}

		// ── Everything else → accumulate into module chunk ───────────────────
		const startLine = node.getStartLineNumber();
		const endLine = node.getEndLineNumber();
		if (moduleStart === -1) moduleStart = startLine;
		moduleEnd = endLine;
		moduleLines.push(contentLines.slice(startLine - 1, endLine).join("\n"));
	}

	flushModule();

	if (chunks.length === 0) {
		chunks.push(createChunk(context, file, {
			kind: "module",
			startLine: 1,
			endLine: contentLines.length,
			content,
			imports: fileImports,
			exports: fileExports,
		}, 0));
	}

	return chunks;
}

// ─── Public entry point ─────────────────────────────────────────────────────

export function chunkRepositoryFile(
	context: ChunkContext,
	file: RepositoryFile,
	content: string
): RepositoryChunk[] {
	if (AST_EXTENSIONS.has(file.extension)) {
		try {
			return chunkAstFile(context, file, content);
		} catch {
			// fall through on parse error
		}
	}

	const kind: RepositoryChunkKind =
		file.kind === "documentation" ? "documentation" :
		file.kind === "data" ? "data" : "module";

	return chunkByLines(context, file, content, kind);
}
