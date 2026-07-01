import { checkNamespaceExists } from "../vectorstore/pinecone.service";
import { retrieveRelevantChunks } from "../retrieval/retrieval.service";
import { generateAnswer, generateAnswerStream } from "../ai/ai.service";
import { ApiError } from "../utils/api-error";
import { loadRepositorySummary } from "./summary.service";
import type { ChatMode, ChatResponse, ChatSource } from "../types";

interface ResolvedChatContext {
  context: string;
  sources: ChatSource[];
  fallbackAnswer?: string;
}

async function resolveChatContext(
  namespace: string,
  query: string,
  mode: ChatMode
): Promise<ResolvedChatContext> {
  const exists = await checkNamespaceExists(namespace);
  if (!exists) {
    throw new ApiError(404, `Repository namespace '${namespace}' not found or empty.`);
  }

  if (mode === "overview") {
    const summary = await loadRepositorySummary(namespace);
    if (!summary) {
      throw new ApiError(404, `Repository summary for '${namespace}' not found. Please re-index the repository.`);
    }

    return {
      context: JSON.stringify(summary, null, 2),
      sources: [],
    };
  }

  const retrieval = await retrieveRelevantChunks(namespace, query, mode);

  if (retrieval.isEmpty) {
    return {
      context: "",
      sources: [],
      fallbackAnswer: "I couldn't find relevant code related to this question in the repository.",
    };
  }

  return {
    context: retrieval.formattedContext,
    sources: retrieval.sources,
  };
}

export async function askQuestion(
  namespace: string,
  query: string,
  mode: ChatMode = "chat"
): Promise<ChatResponse> {
  const resolved = await resolveChatContext(namespace, query, mode);

  if (resolved.fallbackAnswer) {
    return {
      answer: resolved.fallbackAnswer,
      sources: resolved.sources,
    };
  }

  const answer = await generateAnswer(query, resolved.context, mode);

  return {
    answer,
    sources: resolved.sources,
  };
}

export async function askQuestionStream(
  namespace: string,
  query: string,
  mode: ChatMode = "chat",
  onToken: (token: string) => void
): Promise<ChatResponse> {
  const resolved = await resolveChatContext(namespace, query, mode);

  if (resolved.fallbackAnswer) {
    onToken(resolved.fallbackAnswer);
    return {
      answer: resolved.fallbackAnswer,
      sources: resolved.sources,
    };
  }

  const answer = await generateAnswerStream(query, resolved.context, mode, onToken);

  return {
    answer,
    sources: resolved.sources,
  };
}
