import { promises as fs } from "fs";
import path from "path";

import type { RepositorySummary } from "../types";

const SUMMARIES_DIR = path.resolve(process.cwd(), "data", "summaries");

/**
 * Ensures the data/summaries directory exists.
 */
async function ensureDirectoryExists() {
  await fs.mkdir(SUMMARIES_DIR, { recursive: true });
}

function getSummaryFilePath(namespace: string): string {
  return path.join(SUMMARIES_DIR, `${namespace}.json`);
}

/**
 * Saves a repository summary to disk.
 */
export async function saveRepositorySummary(
  namespace: string,
  summary: RepositorySummary
): Promise<void> {
  await ensureDirectoryExists();
  const filePath = getSummaryFilePath(namespace);
  await fs.writeFile(filePath, JSON.stringify(summary, null, 2), "utf-8");
  console.log(`[summary] Saved repository summary to ${filePath}`);
}

/**
 * Loads a repository summary from disk.
 * Returns null if the summary does not exist.
 */
export async function loadRepositorySummary(
  namespace: string
): Promise<RepositorySummary | null> {
  const filePath = getSummaryFilePath(namespace);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as RepositorySummary;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * Lists all saved repository summaries from disk.
 */
export async function listRepositorySummaries(): Promise<RepositorySummary[]> {
  await ensureDirectoryExists();
  const files = await fs.readdir(SUMMARIES_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const summaries: RepositorySummary[] = [];
  for (const file of jsonFiles) {
    try {
      const filePath = path.join(SUMMARIES_DIR, file);
      const data = await fs.readFile(filePath, "utf-8");
      summaries.push(JSON.parse(data) as RepositorySummary);
    } catch {
      // Skip corrupted files
      console.warn(`[summary] Skipping unreadable summary file: ${file}`);
    }
  }

  return summaries;
}
