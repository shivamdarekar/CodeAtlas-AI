export interface ApiResponseShape<TData> {
	statusCode: number;
	message: string;
	data: TData;
}

export interface RepositoryIntakeInput {
	repoUrl: string;
	branch?: string;
}

export interface RepositoryMetadata {
	repoId: string;
	namespace: string;
	owner: string;
	repoName: string;
	cloneUrl: string;
	sourceUrl: string;
	localPath: string;
	branch?: string;
	createdAt: string;
}

export type RepositoryFileKind = "code" | "documentation" | "data";

export interface RepositoryFile {
	absolutePath: string;
	relativePath: string;
	extension: string;
	language: string;
	kind: RepositoryFileKind;
	size: number;
}

export type RepositoryChunkKind =
	| "function"
	| "class"
	| "method"
	| "component"
	| "module"
	| "documentation"
	| "config"
	| "data";

export interface RepositoryChunk {
	id: string;
	repoId: string;
	repoName: string;
	namespace: string;
	filePath: string;
	fileName: string;
	extension: string;
	language: string;
	kind: RepositoryChunkKind;
	chunkType: RepositoryChunkKind;
	symbolName?: string;
	chunkIndex: number;
	startLine: number;
	endLine: number;
	content: string;
	contentLength: number;
	imports: string[];
	exports?: string[];
	functionCalls?: string[];
	componentDependencies?: string[];
	hooksUsed?: string[];
	apiCalls?: string[];
	directory: string;
}

export interface RepositoryIndexSummary {
	repoId: string;
	namespace: string;
	scannedFiles: number;
	indexedChunks: number;
	skippedFiles: number;
}

export interface IndexedRepository extends RepositoryMetadata {
	indexing: RepositoryIndexSummary;
}

export interface ChatSource {
	filePath: string;
	symbolName: string;
	score: number;
}

export type ChatMode = "chat" | "overview" | "flow" | "diagram";

export interface ChatResponse {
	answer: string;
	sources: ChatSource[];
}

export interface RepositorySummary {
	repoId: string;
	repoName: string;
	namespace: string;
	pages: string[];
	components: string[];
	services: string[];
	hooks: string[];
	apiRoutes: string[];
	stats: {
		files: number;
		components: number;
		functions: number;
	};
}
