import { checkNamespaceExists } from "../vectorstore/pinecone.service";
import { retrieveRelevantChunks } from "../retrieval/retrieval.service";
import { generateAnswer } from "../ai/ai.service";
import { ApiError } from "../utils/api-error";
import type { ChatResponse } from "../types";

export async function askQuestion(
  namespace: string,
  query: string
): Promise<ChatResponse> {
  // 1. Namespace Validation
  const exists = await checkNamespaceExists(namespace);
  if (!exists) {
    throw new ApiError(404, `Repository namespace '${namespace}' not found or empty.`);
  }

  // 2. Retrieve Context
  const retrieval = await retrieveRelevantChunks(namespace, query);

  // 3. Fallback when no chunks found
  if (retrieval.isEmpty) {
    return {
      answer: "I couldn't find relevant code related to this question in the repository.",
      sources: [],
    };
  }

  // 4. AI Service Generation
  const answer = await generateAnswer(query, retrieval.formattedContext);

  // 5. Return structured response
  return {
    answer,
    sources: retrieval.sources,
  };
}
