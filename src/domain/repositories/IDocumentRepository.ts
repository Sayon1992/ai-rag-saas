import type { Document } from '../entities';

export interface IDocumentRepository {
  findAll(): Promise<Document[]>;
  findById(id: string): Promise<Document | null>;
  create(data: Omit<Document, 'id' | 'createdAt' | 'chunkCount'>): Promise<Document>;
  delete(id: string): Promise<void>;
}
