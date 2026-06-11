import { Pinecone } from "@pinecone-database/pinecone";

import { ApiError } from "../utils/api-error";
import { embedTexts } from "../indexing/embeddings/embedding.service";
import type { RepositoryChunk } from "../types";

let pineconeClient: Pinecone | null = null;

const PINECONE_BATCH_SIZE = 100; // max records per single Pinecone upsert call
const PINECONE_CONCURRENCY = 5;  // max concurrent upsert calls

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
    pineconeClient = new Pinecone({ apiKey: getRequiredEnv("PINECONE_API_KEY") });
  }
  return pineconeClient;
}

type PineconeRecord = {
  id: string;
  values: number[];
  metadata: Record<string, any>;
};

function chunkMetadata(chunk: RepositoryChunk): Record<string, any> {
  return {
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
  };
}

/**
 * Upsert Pinecone records with concurrency control.
 */
async function upsertRecordsBatched(
  namespace: ReturnType<ReturnType<Pinecone["index"]>["namespace"]>,
  records: PineconeRecord[]
): Promise<void> {
  // Split into batches of PINECONE_BATCH_SIZE
  const batches: PineconeRecord[][] = [];
  for (let i = 0; i < records.length; i += PINECONE_BATCH_SIZE) {
    batches.push(records.slice(i, i + PINECONE_BATCH_SIZE));
  }

  console.log(
    `[pinecone] upserting ${records.length} records in ${batches.length} batches ` +
    `(size=${PINECONE_BATCH_SIZE}, concurrency=${PINECONE_CONCURRENCY})`
  );

  let nextBatch = 0;

  async function worker(): Promise<void> {
    while (nextBatch < batches.length) {
      const batchIndex = nextBatch++;
      const batch = batches[batchIndex];
      console.log(`[pinecone] upsert batch ${batchIndex + 1}/${batches.length} (${batch.length} records)`);
      // Pinecone v7: upsert takes an array directly
      await namespace.upsert({ records: batch });
    }
  }

  const workers: Promise<void>[] = [];
  for (let w = 0; w < Math.min(PINECONE_CONCURRENCY, batches.length); w++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

/**
 * Embed chunks and upsert to Pinecone in a pipelined fashion.
 *
 * Instead of embedding ALL chunks first and THEN upserting, this function
 * embeds a batch → immediately upserts it → moves to next batch.
 * Embedding and upserting run concurrently via Promise.all.
 */
export async function upsertRepositoryChunks(
  namespace: string,
  chunks: RepositoryChunk[]
): Promise<void> {
  if (chunks.length === 0) return;

  const indexName = getRequiredEnv("PINECONE_INDEX_NAME");
  const index = getPineconeClient().index(indexName).namespace(namespace);

  console.log(`[upsert] processing ${chunks.length} chunks`);

  // Step 1 — embed all chunks (embedding.service handles internal batching + concurrency)
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);

  // Step 2 — build Pinecone records
  const records: PineconeRecord[] = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: embeddings[i],
    metadata: chunkMetadata(chunk),
  }));

  // Step 3 — upsert with concurrency
  await upsertRecordsBatched(index, records);

  console.log(`[upsert] ✅ all ${chunks.length} chunks stored in Pinecone`);
}

/**
 * Check if a namespace exists and has records in Pinecone.
 */
export async function checkNamespaceExists(namespace: string): Promise<boolean> {
  const indexName = getRequiredEnv("PINECONE_INDEX_NAME");
  const index = getPineconeClient().index(indexName);
  const stats = await index.describeIndexStats();

  const namespaces = stats.namespaces;
  if (!namespaces || !namespaces[namespace]) {
    return false;
  }
  
  return namespaces[namespace].recordCount > 0;
}

/**
 * Query Pinecone for the most similar chunks to a given embedding.
 */
export async function queryRepositoryChunks(
  namespace: string,
  queryEmbedding: number[],
  topK: number
) {
  const indexName = getRequiredEnv("PINECONE_INDEX_NAME");
  const index = getPineconeClient().index(indexName).namespace(namespace);

  const results = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return results.matches;
}
