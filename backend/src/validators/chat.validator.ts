import { z } from "zod";

export const chatRequestSchema = z.object({
  query: z.string().trim().min(1, "Query cannot be empty"),
  mode: z.enum(["chat", "overview", "flow", "diagram"]).optional().default("chat"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
