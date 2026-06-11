import { z } from "zod";

export const chatRequestSchema = z.object({
  query: z.string().trim().min(1, "Query cannot be empty"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
