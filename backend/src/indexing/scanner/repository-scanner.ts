import { promises as fs } from "fs";
import path from "path";

import type { RepositoryFile } from "../../types";
import {
	getRepositoryFileDescriptor,
	shouldIgnoreDirectory,
} from "../../utils/file-utils";

async function walkRepository(
	currentPath: string,
	rootPath: string,
	files: RepositoryFile[]
): Promise<void> {
	const entries = await fs.readdir(currentPath, { withFileTypes: true });

	for (const entry of entries) {
		if (shouldIgnoreDirectory(entry.name)) {
			continue;
		}

		const absolutePath = path.join(currentPath, entry.name);

		if (entry.isDirectory()) {
			await walkRepository(absolutePath, rootPath, files);
			continue;
		}

		if (!entry.isFile()) {
			continue;
		}

		const descriptor = getRepositoryFileDescriptor(absolutePath);
		if (!descriptor) {
			continue;
		}

		const stats = await fs.stat(absolutePath);
		files.push({
			absolutePath,
			relativePath: path.relative(rootPath, absolutePath),
			extension: path.extname(absolutePath).toLowerCase(),
			language: descriptor.language,
			kind: descriptor.kind,
			size: stats.size,
		});
	}
}

export async function scanRepositoryFiles(
	rootPath: string
): Promise<RepositoryFile[]> {
	const files: RepositoryFile[] = [];
	await walkRepository(rootPath, rootPath, files);
	return files.sort((left, right) =>
		left.relativePath.localeCompare(right.relativePath)
	);
}
