import { embedQuery } from "../indexing/embeddings/embedding.service";
import type { ChatSource, ChatMode } from "../types";
import { queryRepositoryChunks, fetchChunksBySymbols } from "../vectorstore/pinecone.service";

export interface RetrievedContext {
  formattedContext: string;
  sources: ChatSource[];
  isEmpty: boolean;
}

export async function retrieveRelevantChunks(
  namespace: string,
  query: string,
  mode: ChatMode = "chat"
): Promise<RetrievedContext> {
  // For flow tracing and diagrams, we want a tighter, more precise entry point search
  const topK = (mode === "flow" || mode === "diagram") ? 3 : Number(process.env.TOP_K_RESULTS ?? 10);
  const similarityThreshold = Number(process.env.RETRIEVAL_THRESHOLD ?? 0.65);

  // 1. Create Query Embedding
  const queryEmbedding = await embedQuery(query);

  // 2. Search Pinecone for entry points
  const matches = await queryRepositoryChunks(namespace, queryEmbedding, topK);

  // 3. Filter Results by Score
  let relevantChunks = matches.filter((match) => {
    return match.score !== undefined && match.score > similarityThreshold;
  });

  // 4. Multi-hop Flow Tracing
  if ((mode === "flow" || mode === "diagram") && relevantChunks.length > 0) {
    const symbolsToFetch = new Set<string>();
    
    // Extract function calls and dependencies from entry points
    for (const chunk of relevantChunks) {
      const calls = chunk.metadata?.functionCalls as string[] | undefined;
      if (calls && Array.isArray(calls)) {
        calls.forEach(c => symbolsToFetch.add(c));
      }
      const deps = chunk.metadata?.componentDependencies as string[] | undefined;
      if (deps && Array.isArray(deps)) {
        deps.forEach(c => symbolsToFetch.add(c));
      }
    }

    if (symbolsToFetch.size > 0) {
      console.log(`[retrieval] Flow mode active. Fetching related symbols: ${Array.from(symbolsToFetch).join(", ")}`);
      const relatedMatches = await fetchChunksBySymbols(namespace, Array.from(symbolsToFetch));
      
      // Deduplicate by ID
      const existingIds = new Set(relevantChunks.map(c => c.id));
      for (const match of relatedMatches) {
        if (!existingIds.has(match.id)) {
          existingIds.add(match.id);
          relevantChunks.push(match);
        }
      }
    }
  }

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

    const callsStr = metadata.functionCalls && Array.isArray(metadata.functionCalls) && metadata.functionCalls.length > 0
      ? `\nCALLS: ${metadata.functionCalls.join(", ")}` : "";
      
    const depsStr = metadata.componentDependencies && Array.isArray(metadata.componentDependencies) && metadata.componentDependencies.length > 0
      ? `\nDEPS: ${metadata.componentDependencies.join(", ")}` : "";
      
    const hooksStr = metadata.hooksUsed && Array.isArray(metadata.hooksUsed) && metadata.hooksUsed.length > 0
      ? `\nHOOKS: ${metadata.hooksUsed.join(", ")}` : "";
      
    const apiStr = metadata.apiCalls && Array.isArray(metadata.apiCalls) && metadata.apiCalls.length > 0
      ? `\nAPI CALLS: ${metadata.apiCalls.join(", ")}` : "";

    const contextStr = `
FILE: ${metadata.filePath}
TYPE: ${metadata.chunkType || metadata.kind}
SYMBOL: ${metadata.symbolName || "N/A"}${callsStr}${depsStr}${hooksStr}${apiStr}
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
