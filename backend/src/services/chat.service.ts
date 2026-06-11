import { checkNamespaceExists } from "../vectorstore/pinecone.service";
import { retrieveRelevantChunks } from "../retrieval/retrieval.service";
import { generateAnswer } from "../ai/ai.service";
import { ApiError } from "../utils/api-error";
import { loadRepositorySummary } from "./summary.service";
import type { ChatMode, ChatResponse } from "../types";

export async function askQuestion(
  namespace: string,
  query: string,
  mode: ChatMode = "chat"
): Promise<ChatResponse> {
  // 1. Namespace Validation
  const exists = await checkNamespaceExists(namespace);
  if (!exists) {
    throw new ApiError(404, `Repository namespace '${namespace}' not found or empty.`);
  }

  if (mode === "overview") {
    const summary = await loadRepositorySummary(namespace);
    if (!summary) {
      throw new ApiError(404, `Repository summary for '${namespace}' not found. Please re-index the repository.`);
    }

    const answer = await generateAnswer(query, JSON.stringify(summary, null, 2), mode);
    return {
      answer,
      sources: [],
    };
  }

  // 2. Retrieve Context (for chat/flow)
  const retrieval = await retrieveRelevantChunks(namespace, query);

  // 3. Fallback when no chunks found
  if (retrieval.isEmpty) {
    return {
      answer: "I couldn't find relevant code related to this question in the repository.",
      sources: [],
    };
  }

  // 4. AI Service Generation
  const answer = await generateAnswer(query, retrieval.formattedContext, mode);

  // 5. Return structured response
  return {
    answer,
    sources: retrieval.sources,
  };
}
