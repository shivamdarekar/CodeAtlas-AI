import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";

import { analyzeRepository, analyzeRepositoryWithProgress } from "../services/repository.service";
import { analyzeZipWithProgress } from "../services/zip.service";
import { listRepositorySummaries, loadRepositorySummary } from "../services/summary.service";
import { generateAnswer } from "../ai/ai.service";
import { ApiResponse } from "../utils/api-response";
import { ApiError } from "../utils/api-error";
import { asyncHandler } from "../utils/async-handler";
import { repositoryIntakeSchema } from "../validators/repository.validator";

// ── Multer setup — store ZIP to tmp/uploads/ ─────────────────────────────────
const uploadDir = path.resolve(process.cwd(), "tmp", "uploads");

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

export const zipUpload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/zip" || file.originalname.endsWith(".zip")) {
      cb(null, true);
    } else {
      cb(new Error("Only .zip files are supported."));
    }
  },
});

export const listRepositoriesController = asyncHandler(
  async (_request: Request, response: Response) => {
    const summaries = await listRepositorySummaries();
    return response.status(200).json(
      new ApiResponse(200, "Repository summaries fetched successfully.", summaries)
    );
  }
);

export const analyzeRepositoryController = asyncHandler(
  async (request: Request, response: Response) => {
    const payload = repositoryIntakeSchema.parse(request.body);
    const repository = await analyzeRepository(payload);
    return response.status(201).json(
      new ApiResponse(201, "Repository cloned and indexed successfully.", repository)
    );
  }
);

// SSE — GitHub URL stream
export async function analyzeRepositoryStreamController(
  request: Request,
  response: Response
): Promise<void> {
  const parseResult = repositoryIntakeSchema.safeParse(request.body);
  if (!parseResult.success) {
    response.status(400).json(new ApiResponse(400, "Validation failed", parseResult.error.issues));
    return;
  }

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.flushHeaders();

  const send = (event: string, data: object) => {
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const repository = await analyzeRepositoryWithProgress(parseResult.data, send);
    send("done", { repository });
  } catch (err: any) {
    send("error", { message: err?.message ?? "Indexing failed" });
  } finally {
    response.end();
  }
}

// SSE — ZIP upload stream
export async function analyzeZipStreamController(
  request: Request,
  response: Response
): Promise<void> {
  const file = request.file;
  if (!file) {
    response.status(400).json(new ApiResponse(400, "No ZIP file uploaded.", null));
    return;
  }

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("X-Accel-Buffering", "no");
  response.flushHeaders();

  const send = (event: string, data: object) => {
    response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const repository = await analyzeZipWithProgress(file.path, file.originalname, send);
    send("done", { repository });
  } catch (err: any) {
    send("error", { message: err?.message ?? "ZIP indexing failed" });
  } finally {
    response.end();
  }
}

export const getRepositorySummaryController = asyncHandler(
  async (request: Request, response: Response) => {
    const { namespace } = request.params;
    const summary = await loadRepositorySummary(String(namespace));
    if (!summary) {
      throw new ApiError(404, "Repository summary not found");
    }
    return response.status(200).json(
      new ApiResponse(200, "Repository summary fetched successfully.", summary)
    );
  }
);

export const getCommitSummaryController = asyncHandler(
  async (request: Request, response: Response) => {
    const { namespace } = request.params;
    const summary = await loadRepositorySummary(String(namespace));

    if (!summary) {
      throw new ApiError(404, "Repository summary not found");
    }
    if (!summary.commits || summary.commits.length === 0) {
      throw new ApiError(404, "No commit history found. This repository may have been uploaded as a ZIP.");
    }

    const commitLines = summary.commits
      .map((c) => `${c.hash} ${c.date.slice(0, 10)} ${c.author}: ${c.message}`)
      .join("\n");

    const prompt = `Summarize these recent git commits from the repository "${summary.repoName}" in a clear, concise markdown format.

FORMATTING RULES:
- Use ## Recent Development Summary as the heading
- Group related commits into bullet points by theme (features, fixes, refactors)
- Keep each bullet point short and clear
- Use inline code for file names or technical terms

COMMITS:
${commitLines}`;

    const answer = await generateAnswer(prompt, "", "chat");

    return response.status(200).json(
      new ApiResponse(200, "Commit summary generated.", { answer, commits: summary.commits })
    );
  }
);
