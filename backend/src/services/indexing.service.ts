import { promises as fs } from "fs";
import simpleGit from "simple-git";

import type { IndexedRepository, RepositoryChunk, RepositoryIndexSummary, RepositoryMetadata, RepositorySummary } from "../types";
import { ApiError } from "../utils/api-error";
import { chunkRepositoryFile } from "../indexing/chunker/code-chunker";
import { scanRepositoryFiles } from "../indexing/scanner/repository-scanner";
import { upsertRepositoryChunks } from "../vectorstore/pinecone.service";
import { saveRepositorySummary } from "./summary.service";

const FILE_READ_CONCURRENCY = 10; // max concurrent file reads

/**
 * Process a single file: read → chunk.
 * Returns null on failure (logged and counted as skipped).
 */
async function processFile(
	file: { absolutePath: string; relativePath: string; [key: string]: any },
	context: { repoId: string; repoName: string; namespace: string }
): Promise<RepositoryChunk[] | null> {
	try {
		const content = await fs.readFile(file.absolutePath, "utf8");
		return chunkRepositoryFile(context, file as any, content);
	} catch (err) {
		console.error(`[indexing] failed to chunk file: ${file.relativePath}`, err);
		return null;
	}
}

import type { ProgressEmitter } from "./repository.service";

export async function indexRepository(
	repository: RepositoryMetadata
): Promise<IndexedRepository> {
	return indexRepositoryWithProgress(repository, () => {});
}

export async function indexRepositoryWithProgress(
	repository: RepositoryMetadata,
	emit: ProgressEmitter
): Promise<IndexedRepository> {
	const files = await scanRepositoryFiles(repository.localPath);
	const scannedFiles = files.length;
	let skippedFiles = 0;

	const context = {
		repoId: repository.repoId,
		repoName: repository.repoName,
		namespace: repository.namespace,
	};

	emit("progress", { step: "scan", label: `Scanning files`, detail: `${scannedFiles} files found`, pct: 20 });

	// Read and chunk files concurrently
	const chunks: RepositoryChunk[] = [];
	let nextFile = 0;
	let processedFiles = 0;

	async function worker(): Promise<void> {
		while (nextFile < files.length) {
			const fileIndex = nextFile++;
			const file = files[fileIndex];
			const result = await processFile(file, context);
			processedFiles++;
			if (result === null) {
				skippedFiles++;
			} else {
				chunks.push(...result);
			}
			// Emit chunking progress every 10 files
			if (processedFiles % 10 === 0 || processedFiles === scannedFiles) {
				const pct = 20 + Math.round((processedFiles / scannedFiles) * 30);
				emit("progress", {
					step: "chunk",
					label: "AST parsing & chunking",
					detail: `${processedFiles}/${scannedFiles} files · ${chunks.length} chunks`,
					pct,
				});
			}
		}
	}

	const workers: Promise<void>[] = [];
	for (let w = 0; w < Math.min(FILE_READ_CONCURRENCY, files.length); w++) {
		workers.push(worker());
	}
	await Promise.all(workers);

	if (chunks.length === 0) {
		throw new ApiError(400, "No supported files were found to index in this repository.");
	}

	emit("progress", { step: "embed", label: "Generating embeddings", detail: `${chunks.length} chunks`, pct: 55 });

	await upsertRepositoryChunks(repository.namespace, chunks);

	emit("progress", { step: "upsert", label: "Storing vectors in Pinecone", detail: `${chunks.length} vectors`, pct: 85 });

	const indexing: RepositoryIndexSummary = {
		repoId: repository.repoId,
		namespace: repository.namespace,
		scannedFiles,
		indexedChunks: chunks.length,
		skippedFiles,
	};

	// --- Phase 3: Build & Save Repository Summary ---
	const summary: RepositorySummary = {
		repoId: repository.repoId,
		repoName: repository.repoName,
		namespace: repository.namespace,
		pages: [],
		components: [],
		services: [],
		hooks: [],
		apiRoutes: [],
		stats: {
			files: scannedFiles - skippedFiles,
			components: 0,
			functions: 0,
		},
	};

	// Very simple heuristic-based categorization from file paths and chunk metadata
	const uniqueComponents = new Set<string>();
	const uniqueFunctions = new Set<string>();

	for (const chunk of chunks) {
		const relativePath = chunk.filePath.replace(/\\/g, "/");
		const pathLower = relativePath.toLowerCase();

		// Categorize files based on folder paths
		// Match app router pages (app/.../page.tsx) or pages router (pages/...)
		if (pathLower.startsWith("app/") || pathLower.includes("/app/") || pathLower.startsWith("pages/") || pathLower.includes("/pages/")) {
			if (pathLower.endsWith("page.tsx") || pathLower.endsWith("page.jsx") || pathLower.includes("/pages/")) {
				if (!summary.pages.includes(relativePath)) summary.pages.push(relativePath);
			}
		}
		// Match components
		if (pathLower.startsWith("components/") || pathLower.includes("/components/")) {
			if (!summary.components.includes(relativePath)) summary.components.push(relativePath);
		}
		// Match services
		if (pathLower.startsWith("services/") || pathLower.includes("/services/")) {
			if (!summary.services.includes(relativePath)) summary.services.push(relativePath);
		}
		// Match hooks
		if (pathLower.startsWith("hooks/") || pathLower.includes("/hooks/") || pathLower.includes("/lib/use") || chunk.symbolName?.startsWith("use")) {
			if (!summary.hooks.includes(relativePath)) summary.hooks.push(relativePath);
		}
		// Match API routes
		if (pathLower.includes("/api/") || pathLower.startsWith("api/") || pathLower.includes("/controllers/") || pathLower.startsWith("controllers/") || pathLower.includes("/routes/") || pathLower.startsWith("routes/")) {
			if (!summary.apiRoutes.includes(relativePath)) summary.apiRoutes.push(relativePath);
		}

		// Count stats
		if (chunk.kind === "component" && chunk.symbolName) {
			uniqueComponents.add(chunk.symbolName);
		}
		if ((chunk.kind === "function" || chunk.kind === "method") && chunk.symbolName) {
			uniqueFunctions.add(chunk.symbolName);
		}
	}

	summary.stats.components = uniqueComponents.size;
	summary.stats.functions = uniqueFunctions.size;

	// Capture git log while repo is still on disk (silently skip if not a git repo / ZIP)
	try {
		const git = simpleGit(repository.localPath);
		const log = await git.log({ maxCount: 20 });
		summary.commits = log.all.map((c) => ({
			hash: c.hash.slice(0, 7),
			message: c.message.trim(),
			author: c.author_name,
			date: c.date,
		}));
	} catch {
		// Not a git repo (e.g. ZIP upload) — commits stay undefined
	}

	await saveRepositorySummary(repository.namespace, summary);

	emit("progress", { step: "summary", label: "Saving architecture summary", detail: `${uniqueComponents.size} components · ${uniqueFunctions.size} functions`, pct: 98 });

	return {
		...repository,
		indexing,
	};
}
