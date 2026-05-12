import type { DocumentChunk } from '../entities';

export interface IChunkRepository {
  createMany(chunks: Omit<DocumentChunk, 'id' | 'createdAt' | 'similarity'>[]): Promise<void>;
  searchSimilar(embedding: number[], limit: number): Promise<DocumentChunk[]>;
  deleteByDocumentId(documentId: string): Promise<void>;
  countByDocumentId(documentId: string): Promise<number>;
}
