import type { IEmbeddingService } from '@/domain/services/IEmbeddingService';

const MODEL = 'voyage-3';
const ENDPOINT = 'https://api.voyageai.com/v1/embeddings';

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

async function callVoyage(input: string[]): Promise<number[][]> {
  const apiKey = process.env.VOYAGE_API_KEY;
  if (!apiKey) throw new Error('VOYAGE_API_KEY is not set');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input, model: MODEL }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Voyage API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as VoyageResponse;
  return json.data.sort((a, b) => a.index - b.index).map(d => d.embedding);
}

export class AnthropicEmbeddingService implements IEmbeddingService {
  async embed(text: string): Promise<number[]> {
    const [embedding] = await callVoyage([text]);
    return embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    return callVoyage(texts);
  }
}
