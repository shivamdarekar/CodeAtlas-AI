import type { Request, Response } from "express";

import { analyzeRepository } from "../services/repository.service";
import { listRepositorySummaries } from "../services/summary.service";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { repositoryIntakeSchema } from "../validators/repository.validator";

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
