import { HfInference } from "@huggingface/inference";

const EMBED_BATCH_SIZE = 32;   // texts per single HF API call
const EMBED_CONCURRENCY = 3;   // max concurrent embedding API calls
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

let hfClient: HfInference | null = null;

function getHfClient(): HfInference {
	if (!hfClient) {
		const apiKey = process.env.HUGGINGFACE_API_KEY;
		if (!apiKey) {
			throw new Error("HUGGINGFACE_API_KEY is not configured.");
		}
		hfClient = new HfInference(apiKey);
	}
	return hfClient;
}

function getModelName(): string {
	return process.env.HUGGINGFACE_MODEL ?? "BAAI/bge-small-en-v1.5";
}

async function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Embed a single batch of texts with retry logic for rate limits.
 * Direct HF call — simpler and lighter than LangChain wrapper.
 */
async function embedBatchWithRetry(texts: string[]): Promise<number[][]> {
	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			const result = await getHfClient().featureExtraction({
				model: getModelName(),
				inputs: texts,
			});
			return result as unknown as number[][];
		} catch (err: any) {
			const isRateLimit =
				err?.status === 429 || String(err?.message).includes("429");
			if (attempt === MAX_RETRIES || !isRateLimit) throw err;
			await sleep(RETRY_BASE_DELAY_MS * attempt);
		}
	}

	throw new Error("embedBatchWithRetry: exhausted retries");
}

/**
 * Embed an array of texts with batching and concurrency control.
 *
 * - Splits `texts` into batches of EMBED_BATCH_SIZE (32)
 * - Runs up to EMBED_CONCURRENCY (3) batches in parallel
 * - Returns embeddings in the same order as input texts
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
	if (texts.length === 0) return [];

	// Split into batches
	const batches: string[][] = [];
	for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
		batches.push(texts.slice(i, i + EMBED_BATCH_SIZE));
	}

	console.log(
		`[embeddings] ${texts.length} texts → ${batches.length} batches ` +
		`(size=${EMBED_BATCH_SIZE}, concurrency=${EMBED_CONCURRENCY})`
	);

	// Process batches with concurrency limit
	const results: number[][][] = new Array(batches.length);
	let nextBatch = 0;

	async function worker(): Promise<void> {
		while (nextBatch < batches.length) {
			const batchIndex = nextBatch++;
			const batch = batches[batchIndex];
			console.log(`[embeddings] batch ${batchIndex + 1}/${batches.length} (${batch.length} texts)`);
			results[batchIndex] = await embedBatchWithRetry(batch);
		}
	}

	// Spawn concurrent workers
	const workers: Promise<void>[] = [];
	for (let w = 0; w < Math.min(EMBED_CONCURRENCY, batches.length); w++) {
		workers.push(worker());
	}
	await Promise.all(workers);

	// Flatten results in order
	return results.flat();
}

/**
 * Embed a single query text (for retrieval/search).
 */
export async function embedQuery(text: string): Promise<number[]> {
	const result = await getHfClient().featureExtraction({
		model: getModelName(),
		inputs: text,
	});
	return result as unknown as number[];
}
