import type { IDocumentRepository } from '@/domain/repositories/IDocumentRepository';
import type { IChunkRepository } from '@/domain/repositories/IChunkRepository';
import type { IEmbeddingService } from '@/domain/services/IEmbeddingService';
import type { Document } from '@/domain/entities';
import { chunkText } from '@/lib/chunker';

interface Deps {
  documentRepo: IDocumentRepository;
  chunkRepo: IChunkRepository;
  embeddingService: IEmbeddingService;
}

export interface UploadDocumentInput {
  name: string;
  size: number;
  text: string;
}

export async function uploadDocument(
  { name, size, text }: UploadDocumentInput,
  { documentRepo, chunkRepo, embeddingService }: Deps
): Promise<Document> {
  const document = await documentRepo.create({ name, size });

  const chunks = chunkText(text);
  const embeddings = await embeddingService.embedMany(chunks);

  await chunkRepo.createMany(
    chunks.map((content, i) => ({
      documentId: document.id,
      documentName: name,
      content,
      embedding: embeddings[i],
      chunkIndex: i,
    }))
  );

  return { ...document, chunkCount: chunks.length };
}
