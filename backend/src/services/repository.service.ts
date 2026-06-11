import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";

import simpleGit from "simple-git";

import { ApiError } from "../utils/api-error";
import { buildRepositoryNamespace } from "../vectorstore/pinecone.service";
import type { IndexedRepository, RepositoryIntakeInput, RepositoryMetadata } from "../types";
import { indexRepository } from "./indexing.service";

interface ParsedGitHubRepository {
  owner: string;
  repoName: string;
  cloneUrl: string;
  sourceUrl: string;
}

function parseGitHubRepositoryUrl(repoUrl: string): ParsedGitHubRepository {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(repoUrl);
  } catch {
    throw new ApiError(400, "Invalid repository URL.");
  }

  if (parsedUrl.hostname !== "github.com") {
    throw new ApiError(400, "Only GitHub repositories are supported for now.");
  }

  const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
  if (pathSegments.length < 2) {
    throw new ApiError(400, "GitHub repository URL must include owner and repo name.");
  }

  const owner = pathSegments[0];
  const repoName = pathSegments[1].replace(/\.git$/i, "");
  const sourceUrl = `https://github.com/${owner}/${repoName}`;
  const cloneUrl = `${sourceUrl}.git`;

  return { owner, repoName, cloneUrl, sourceUrl };
}

export async function analyzeRepository(
  input: RepositoryIntakeInput
): Promise<IndexedRepository> {
  const repository = parseGitHubRepositoryUrl(input.repoUrl);
  const repoId = randomUUID();
  const namespace = buildRepositoryNamespace(repoId);
  const workspaceRoot = path.resolve(process.cwd(), "tmp", "repos");
  const localPath = path.join(workspaceRoot, repoId);

  await fs.mkdir(localPath, { recursive: true });

  const git = simpleGit();

  try {
    const cloneOptions = ["--depth", "1"];
    if (input.branch) {
      cloneOptions.push("--branch", input.branch, "--single-branch");
    }

    await git.clone(repository.cloneUrl, localPath, cloneOptions);
  } catch (error) {
    throw new ApiError(400, "Unable to clone the repository. Verify the URL and branch.", {
      cause: error instanceof Error ? error.message : "Unknown clone failure",
    });
  }

  const repositoryMetadata: RepositoryMetadata = {
    repoId,
    namespace,
    owner: repository.owner,
    repoName: repository.repoName,
    cloneUrl: repository.cloneUrl,
    sourceUrl: repository.sourceUrl,
    localPath,
    branch: input.branch,
    createdAt: new Date().toISOString(),
  };

  try {
    return await indexRepository(repositoryMetadata);
  } finally {
    // Clean up cloned repo to prevent disk from filling up
    fs.rm(localPath, { recursive: true, force: true }).catch((err) =>
      console.error(`[cleanup] failed to remove ${localPath}:`, err)
    );
  }
}
