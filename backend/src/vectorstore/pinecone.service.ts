import { HfInference } from "@huggingface/inference";
import type { FeatureExtractionOutput } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";

import { ApiError } from "../utils/api-error";
import type { RepositoryChunk } from "../types";

let pineconeClient: Pinecone | null = null;
let hfClient: HfInference | null = null;

export function buildRepositoryNamespace(repoId: string): string {
  return repoId;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new ApiError(500, `${name} is not configured.`);
  }

  return value;
}

function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({
      apiKey: getRequiredEnv("PINECONE_API_KEY"),
    });
  }

  return pineconeClient;
}

function getHuggingFaceClient(): HfInference {
  if (!hfClient) {
    hfClient = new HfInference(getRequiredEnv("HUGGINGFACE_API_KEY"));
  }

  return hfClient;
}

function normalizeEmbedding(embedding: FeatureExtractionOutput): number[] {
  const firstResult = embedding[0];

  if (Array.isArray(firstResult)) {
    const nestedResult = firstResult[0];
    if (Array.isArray(nestedResult)) {
      return nestedResult as number[];
    }

    return firstResult as number[];
  }

  return embedding as unknown as number[];
}

async function embedText(text: string): Promise<number[]> {
  const hfModel = process.env.HUGGINGFACE_MODEL ?? "BAAI/bge-small-en-v1.5";
  const embedding = await getHuggingFaceClient().featureExtraction({
    model: hfModel,
    inputs: text,
  });

  return normalizeEmbedding(embedding);
}

export async function upsertRepositoryChunks(
  namespace: string,
  chunks: RepositoryChunk[]
): Promise<void> {
  if (chunks.length === 0) {
    return;
  }

  const indexName = getRequiredEnv("PINECONE_INDEX_NAME");
  const index = getPineconeClient().index(indexName).namespace(namespace);
  const batchSize = 8;

  for (let start = 0; start < chunks.length; start += batchSize) {
    const batch = chunks.slice(start, start + batchSize);
    const embeddings = await Promise.all(batch.map((chunk) => embedText(chunk.content)));

    await index.upsert({
      records: batch.map((chunk, batchIndex) => ({
        id: chunk.id,
        values: embeddings[batchIndex],
        metadata: {
          repoId: chunk.repoId,
          repoName: chunk.repoName,
          namespace: chunk.namespace,
          filePath: chunk.filePath,
          fileName: chunk.fileName,
          extension: chunk.extension,
          language: chunk.language,
          kind: chunk.kind,
          chunkType: chunk.chunkType,
          chunkIndex: chunk.chunkIndex,
          startLine: chunk.startLine,
          endLine: chunk.endLine,
          symbolName: chunk.symbolName ?? "",
          content: chunk.content,
          contentLength: chunk.contentLength,
          imports: chunk.imports,
          exports: chunk.exports,
          directory: chunk.directory,
        },
      })),
    });
  }
}
