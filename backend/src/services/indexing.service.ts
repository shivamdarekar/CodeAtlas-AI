import { promises as fs } from "fs";

import type { IndexedRepository, RepositoryChunk, RepositoryIndexSummary, RepositoryMetadata } from "../types";
import { ApiError } from "../utils/api-error";
import { chunkRepositoryFile } from "../indexing/chunker/code-chunker";
import { scanRepositoryFiles } from "../indexing/scanner/repository-scanner";
import { upsertRepositoryChunks } from "../vectorstore/pinecone.service";

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

	return {
		...repository,
		indexing,
	};
}
