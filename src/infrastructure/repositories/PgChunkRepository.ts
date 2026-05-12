import { db } from '../db/client';
import type { IChunkRepository } from '@/domain/repositories/IChunkRepository';
import type { DocumentChunk } from '@/domain/entities';

export class PgChunkRepository implements IChunkRepository {
  async createMany(chunks: Omit<DocumentChunk, 'id' | 'createdAt' | 'similarity'>[]): Promise<void> {
    if (chunks.length === 0) return;

    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const chunk of chunks) {
        const embeddingStr = `[${chunk.embedding!.join(',')}]`;
        await client.query(
          `INSERT INTO document_chunks (document_id, content, embedding, chunk_index)
           VALUES ($1, $2, $3::vector, $4)`,
          [chunk.documentId, chunk.content, embeddingStr, chunk.chunkIndex]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async searchSimilar(embedding: number[], limit: number): Promise<DocumentChunk[]> {
    const embeddingStr = `[${embedding.join(',')}]`;
    const { rows } = await db.query<{
      id: string;
      document_id: string;
      document_name: string;
      content: string;
      chunk_index: number;
      created_at: Date;
      similarity: number;
    }>(`
      SELECT
        dc.id,
        dc.document_id,
        d.name AS document_name,
        dc.content,
        dc.chunk_index,
        dc.created_at,
        1 - (dc.embedding <=> $1::vector) AS similarity
      FROM document_chunks dc
      JOIN documents d ON d.id = dc.document_id
      ORDER BY dc.embedding <=> $1::vector
      LIMIT $2
    `, [embeddingStr, limit]);

    return rows.map(r => ({
      id: r.id,
      documentId: r.document_id,
      documentName: r.document_name,
      content: r.content,
      chunkIndex: r.chunk_index,
      similarity: r.similarity,
      createdAt: r.created_at,
    }));
  }

  async deleteByDocumentId(documentId: string): Promise<void> {
    await db.query('DELETE FROM document_chunks WHERE document_id = $1', [documentId]);
  }

  async countByDocumentId(documentId: string): Promise<number> {
    const { rows } = await db.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM document_chunks WHERE document_id = $1',
      [documentId]
    );
    return parseInt(rows[0].count, 10);
  }
}
