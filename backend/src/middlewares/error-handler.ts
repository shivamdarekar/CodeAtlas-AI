import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    return response.status(400).json(
      new ApiResponse(400, "Validation failed", {
        issues: error.issues,
      })
    );
  }

  if (error instanceof ApiError) {
    return response.status(error.statusCode).json(
      new ApiResponse(error.statusCode, error.message, {
        details: error.details ?? null,
      })
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  return response.status(500).json(
    new ApiResponse(500, message, {
      details: null,
    })
  );
};
