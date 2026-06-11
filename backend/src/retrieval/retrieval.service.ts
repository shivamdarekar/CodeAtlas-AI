import { embedQuery } from "../indexing/embeddings/embedding.service";
import type { ChatSource } from "../types";
import { queryRepositoryChunks } from "../vectorstore/pinecone.service";

export interface RetrievedContext {
  formattedContext: string;
  sources: ChatSource[];
  isEmpty: boolean;
}

export async function retrieveRelevantChunks(
  namespace: string,
  query: string
): Promise<RetrievedContext> {
  const topK = Number(process.env.TOP_K_RESULTS ?? 10);
  const similarityThreshold = Number(process.env.RETRIEVAL_THRESHOLD ?? 0.65);

  // 1. Create Query Embedding
  const queryEmbedding = await embedQuery(query);

  // 2. Search Pinecone
  const matches = await queryRepositoryChunks(namespace, queryEmbedding, topK);

  // 3. Filter Results by Score
  const relevantChunks = matches.filter((match) => {
    return match.score !== undefined && match.score > similarityThreshold;
  });

  if (relevantChunks.length === 0) {
    return {
      formattedContext: "",
      sources: [],
      isEmpty: true,
    };
  }

  // 4. Build Context String and Extract Sources
  const sources: ChatSource[] = [];
  const contextChunks: string[] = [];

  for (const chunk of relevantChunks) {
    const metadata = chunk.metadata as any;
    if (!metadata) continue;

    sources.push({
      filePath: metadata.filePath,
      symbolName: metadata.symbolName || "",
      score: chunk.score ?? 0,
    });

    const contextStr = `
FILE: ${metadata.filePath}
TYPE: ${metadata.chunkType || metadata.kind}
SYMBOL: ${metadata.symbolName || "N/A"}
LINES: ${metadata.startLine}-${metadata.endLine}
CODE:
${metadata.content}
`.trim();

    contextChunks.push(contextStr);
  }

  return {
    formattedContext: contextChunks.join("\n\n---\n\n"),
    sources,
    isEmpty: false,
  };
}
