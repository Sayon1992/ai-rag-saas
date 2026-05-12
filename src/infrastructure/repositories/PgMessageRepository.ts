import { db } from '../db/client';
import type { IMessageRepository } from '@/domain/repositories/IMessageRepository';
import type { Message, Citation } from '@/domain/entities';

export class PgMessageRepository implements IMessageRepository {
  async findByConversationId(conversationId: string): Promise<Message[]> {
    const { rows } = await db.query<{
      id: string; conversation_id: string; role: string;
      content: string; citations: Citation[]; created_at: Date;
    }>(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );

    return rows.map(r => ({
      id: r.id,
      conversationId: r.conversation_id,
      role: r.role as 'user' | 'assistant',
      content: r.content,
      citations: r.citations ?? [],
      createdAt: r.created_at,
    }));
  }

  async findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]> {
    const { rows } = await db.query<{
      id: string; conversation_id: string; role: string;
      content: string; citations: Citation[]; created_at: Date;
    }>(`
      SELECT * FROM (
        SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT $2
      ) sub ORDER BY created_at ASC
    `, [conversationId, limit]);

    return rows.map(r => ({
      id: r.id,
      conversationId: r.conversation_id,
      role: r.role as 'user' | 'assistant',
      content: r.content,
      citations: r.citations ?? [],
      createdAt: r.created_at,
    }));
  }

  async create(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const { rows } = await db.query<{
      id: string; conversation_id: string; role: string;
      content: string; citations: Citation[]; created_at: Date;
    }>(
      `INSERT INTO messages (conversation_id, role, content, citations)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.conversationId, data.role, data.content, JSON.stringify(data.citations)]
    );

    return {
      id: rows[0].id,
      conversationId: rows[0].conversation_id,
      role: rows[0].role as 'user' | 'assistant',
      content: rows[0].content,
      citations: rows[0].citations ?? [],
      createdAt: rows[0].created_at,
    };
  }
}
