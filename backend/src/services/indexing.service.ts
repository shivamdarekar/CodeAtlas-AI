import { promises as fs } from "fs";

import type { IndexedRepository, RepositoryChunk, RepositoryIndexSummary, RepositoryMetadata } from "../types";
import { ApiError } from "../utils/api-error";
import { chunkRepositoryFile } from "../indexing/chunker/code-chunker";
import { scanRepositoryFiles } from "../indexing/scanner/repository-scanner";
import { upsertRepositoryChunks } from "../vectorstore/pinecone.service";

export async function indexRepository(
	repository: RepositoryMetadata
): Promise<IndexedRepository> {
	let scannedFiles = 0;
	let skippedFiles = 0;
	const chunks: RepositoryChunk[] = [];

	const files = await scanRepositoryFiles(repository.localPath);
	scannedFiles = files.length;

	for (const file of files) {
		try {
			const content = await fs.readFile(file.absolutePath, "utf8");
			const fileChunks = chunkRepositoryFile(
				{
					repoId: repository.repoId,
					repoName: repository.repoName,
					namespace: repository.namespace,
				},
				file,
				content
			);
			chunks.push(...fileChunks);
		} catch (err) {
			console.error(`[indexing] failed to chunk file: ${file.relativePath}`, err);
			skippedFiles += 1;
		}
	}

	if (chunks.length === 0) {
		throw new ApiError(400, "No supported files were found to index in this repository.");
	}

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
