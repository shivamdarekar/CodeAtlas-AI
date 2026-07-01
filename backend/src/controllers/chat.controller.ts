import type { Request, Response } from "express";

import { askQuestion, askQuestionStream } from "../services/chat.service";
import { ApiResponse } from "../utils/api-response";
import { asyncHandler } from "../utils/async-handler";
import { initSseResponse, sendSseEvent } from "../utils/sse";
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

export async function chatStreamController(
  request: Request,
  response: Response
): Promise<void> {
  const namespace = request.params.namespace as string;
  const payload = chatRequestSchema.safeParse(request.body);

  if (!payload.success) {
    response.status(400).json(new ApiResponse(400, "Validation failed", payload.error.issues));
    return;
  }

  initSseResponse(response);

  try {
    sendSseEvent(response, "start", {
      mode: payload.data.mode,
      namespace,
    });

    const result = await askQuestionStream(namespace, payload.data.query, payload.data.mode, (token) => {
      sendSseEvent(response, "delta", { chunk: token });
    });

    sendSseEvent(response, "done", result);
  } catch (error: any) {
    sendSseEvent(response, "error", {
      message: error?.message ?? "Chat streaming failed.",
    });
  } finally {
    response.end();
  }
}
