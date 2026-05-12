import { db } from '../db/client';
import type { IConversationRepository } from '@/domain/repositories/IConversationRepository';
import type { Conversation } from '@/domain/entities';

export class PgConversationRepository implements IConversationRepository {
  async findAll(): Promise<Conversation[]> {
    const { rows } = await db.query<{
      id: string; title: string | null; created_at: Date; updated_at: Date;
    }>('SELECT * FROM conversations ORDER BY updated_at DESC');

    return rows.map(r => ({
      id: r.id,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
  }

  async findById(id: string): Promise<Conversation | null> {
    const { rows } = await db.query<{
      id: string; title: string | null; created_at: Date; updated_at: Date;
    }>('SELECT * FROM conversations WHERE id = $1', [id]);

    if (!rows[0]) return null;
    return {
      id: rows[0].id,
      title: rows[0].title,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    };
  }

  async create(): Promise<Conversation> {
    const { rows } = await db.query<{
      id: string; title: string | null; created_at: Date; updated_at: Date;
    }>('INSERT INTO conversations DEFAULT VALUES RETURNING *');

    return {
      id: rows[0].id,
      title: rows[0].title,
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    };
  }

  async updateTitle(id: string, title: string): Promise<void> {
    await db.query(
      'UPDATE conversations SET title = $1, updated_at = NOW() WHERE id = $2',
      [title, id]
    );
  }

  async delete(id: string): Promise<void> {
    await db.query('DELETE FROM conversations WHERE id = $1', [id]);
  }
}
