import type { Request, Response } from "express";

import { askQuestion } from "../services/chat.service";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { chatRequestSchema } from "../validators/chat.validator";

export const chatController = asyncHandler(
  async (request: Request, response: Response) => {
    const namespace = request.params.namespace as string;
    const payload = chatRequestSchema.parse(request.body);

    const result = await askQuestion(namespace, payload.query, payload.mode);

    return response.status(200).json(
      new ApiResponse(200, "Chat response generated successfully.", result)
    );
  }
);
