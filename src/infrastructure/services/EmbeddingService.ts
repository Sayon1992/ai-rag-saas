import type { IEmbeddingService } from '@/domain/services/IEmbeddingService';

const MODEL = 'voyage-3';
const ENDPOINT = 'https://api.voyageai.com/v1/embeddings';
const BATCH_SIZE = 128;        // Voyage caps inputs at 128 per request
const REQUEST_TIMEOUT_MS = 30_000;

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

async function callVoyage(input: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error('VOYAGE_API_KEY is not set');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input, model: MODEL }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Voyage API error ${res.status}: ${text}`);
    }

    const json = (await res.json()) as VoyageResponse;
    return json.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Voyage API request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export class EmbeddingService implements IEmbeddingService {
  async embed(text: string): Promise<number[]> {
    const [embedding] = await callVoyage([text]);
    return embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await callVoyage(batch);
      results.push(...batchEmbeddings);
    }
    return results;
  }
}
