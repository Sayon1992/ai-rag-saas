import { db } from '../db/client';
import type { IDocumentRepository } from '@/domain/repositories/IDocumentRepository';
import type { Document } from '@/domain/entities';

export class PgDocumentRepository implements IDocumentRepository {
  async findAll(): Promise<Document[]> {
    const { rows } = await db.query<{
      id: string; name: string; size: number; chunk_count: string; created_at: Date;
    }>(`
      SELECT d.id, d.name, d.size, d.created_at,
             COUNT(dc.id)::text AS chunk_count
      FROM documents d
      LEFT JOIN document_chunks dc ON dc.document_id = d.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      size: r.size,
      chunkCount: parseInt(r.chunk_count, 10),
      createdAt: r.created_at,
    }));
  }

  async findById(id: string): Promise<Document | null> {
    const { rows } = await db.query<{
      id: string; name: string; size: number; created_at: Date;
    }>('SELECT * FROM documents WHERE id = $1', [id]);

    if (!rows[0]) return null;
    return { ...rows[0], createdAt: rows[0].created_at };
  }

  async create(data: Omit<Document, 'id' | 'createdAt' | 'chunkCount'>): Promise<Document> {
    const { rows } = await db.query<{ id: string; name: string; size: number; created_at: Date }>(
      'INSERT INTO documents (name, size) VALUES ($1, $2) RETURNING *',
      [data.name, data.size]
    );
    return { ...rows[0], createdAt: rows[0].created_at };
  }

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM documents WHERE id = $1', [id]);
  }
}
