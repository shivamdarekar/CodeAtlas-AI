import { promises as fs } from "fs";
import { createReadStream } from "fs";
import { randomUUID } from "crypto";
import path from "path";

import unzipper from "unzipper";
import { rimraf } from "rimraf";

import { ApiError } from "../utils/api-error";
import { buildRepositoryNamespace } from "../vectorstore/pinecone.service";
import type { IndexedRepository, RepositoryMetadata } from "../types";
import { indexRepositoryWithProgress } from "./indexing.service";
import type { ProgressEmitter } from "./repository.service";

/**
 * Extracts a ZIP file to a target directory.
 * Handles the common case where the ZIP has a single top-level folder
 * (e.g. my-repo-main/) — in that case we use that folder as localPath.
 */
async function extractZip(zipPath: string, extractTo: string): Promise<string> {
  await fs.mkdir(extractTo, { recursive: true });

  await createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: extractTo }))
    .promise();

  // Check if there's exactly one top-level directory (GitHub zips add a wrapper folder)
  const entries = await fs.readdir(extractTo);
  if (entries.length === 1) {
    const single = path.join(extractTo, entries[0]);
    const stat = await fs.stat(single);
    if (stat.isDirectory()) {
      return single; // use the inner folder directly
    }
  }

  return extractTo;
}

export async function analyzeZipWithProgress(
  zipPath: string,
  originalName: string,
  emit: ProgressEmitter
): Promise<IndexedRepository> {
  const repoId = randomUUID();
  const namespace = buildRepositoryNamespace(repoId);
  const workspaceRoot = path.resolve(process.cwd(), "tmp", "repos");
  const extractBase = path.join(workspaceRoot, repoId);

  // Derive a clean repo name from the filename (e.g. "my-project-main.zip" → "my-project")
  const repoName = originalName
    .replace(/\.zip$/i, "")
    .replace(/-main$|-master$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-") || "uploaded-repo";

  emit("progress", { step: "clone", label: "Extracting ZIP", pct: 5 });

  let localPath: string;
  try {
    localPath = await extractZip(zipPath, extractBase);
  } catch (err) {
    throw new ApiError(400, "Failed to extract ZIP. Make sure the file is a valid ZIP archive.");
  }

  emit("progress", { step: "clone", label: "ZIP extracted", pct: 15 });

  const repositoryMetadata: RepositoryMetadata = {
    repoId,
    namespace,
    owner: "local",
    repoName,
    cloneUrl: "",
    sourceUrl: "",
    localPath,
    createdAt: new Date().toISOString(),
  };

  try {
    return await indexRepositoryWithProgress(repositoryMetadata, emit);
  } finally {
    // Clean up extracted folder and original ZIP
    try { await rimraf(extractBase, { preserveRoot: false }); } catch {}
    try { await fs.unlink(zipPath); } catch {}
  }
}
