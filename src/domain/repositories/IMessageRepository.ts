import type { Message, Citation } from '../entities';

export interface IMessageRepository {
  findByConversationId(conversationId: string): Promise<Message[]>;
  create(data: Omit<Message, 'id' | 'createdAt'>): Promise<Message>;
  findRecentByConversationId(conversationId: string, limit: number): Promise<Message[]>;
}

export type { Citation };
