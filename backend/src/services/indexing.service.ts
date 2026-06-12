import { promises as fs } from "fs";

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

export async function indexRepository(
	repository: RepositoryMetadata
): Promise<IndexedRepository> {
	const files = await scanRepositoryFiles(repository.localPath);
	const scannedFiles = files.length;
	let skippedFiles = 0;

	const context = {
		repoId: repository.repoId,
		repoName: repository.repoName,
		namespace: repository.namespace,
	};

	console.log(`[indexing] processing ${scannedFiles} files (concurrency=${FILE_READ_CONCURRENCY})`);

	// Read and chunk files concurrently with a pool of FILE_READ_CONCURRENCY workers
	const chunks: RepositoryChunk[] = [];
	let nextFile = 0;

	async function worker(): Promise<void> {
		while (nextFile < files.length) {
			const fileIndex = nextFile++;
			const file = files[fileIndex];
			const result = await processFile(file, context);
			if (result === null) {
				skippedFiles++;
			} else {
				chunks.push(...result);
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

	console.log(`[indexing] ${chunks.length} chunks from ${scannedFiles - skippedFiles} files → upserting to Pinecone`);

	await upsertRepositoryChunks(repository.namespace, chunks);

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

	await saveRepositorySummary(repository.namespace, summary);
	// ------------------------------------------------

	return {
		...repository,
		indexing,
	};
}
