import path from "path";

import type { RepositoryFileKind } from "../types";

export const IGNORED_DIRECTORY_NAMES = new Set([
	".git",
	".next",
	".turbo",
	".cache",
	"coverage",
	"dist",
	"build",
	"node_modules",
	"tmp",
]);

export const SUPPORTED_FILE_EXTENSIONS = new Map<
	string,
	{ language: string; kind: RepositoryFileKind }
>([
	[".ts", { language: "typescript", kind: "code" }],
	[".tsx", { language: "tsx", kind: "code" }],
	[".js", { language: "javascript", kind: "code" }],
	[".jsx", { language: "jsx", kind: "code" }],
	[".json", { language: "json", kind: "data" }],
	[".md", { language: "markdown", kind: "documentation" }],
	[".html", { language: "html", kind: "code" }],
	[".css", { language: "css", kind: "code" }],
	[".py", { language: "python", kind: "code" }],
]);

export function getFileExtension(filePath: string): string {
	return path.extname(filePath).toLowerCase();
}

export function shouldIgnoreDirectory(directoryName: string): boolean {
	return IGNORED_DIRECTORY_NAMES.has(directoryName) || directoryName.startsWith(".");
}

export function getRepositoryFileDescriptor(filePath: string) {
	const extension = getFileExtension(filePath);
	return SUPPORTED_FILE_EXTENSIONS.get(extension) ?? null;
}

export function shouldIndexFile(filePath: string): boolean {
	return getRepositoryFileDescriptor(filePath) !== null;
}

export function isCodeFile(filePath: string): boolean {
	return getRepositoryFileDescriptor(filePath)?.kind === "code";
}
