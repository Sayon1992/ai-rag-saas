import type { Conversation } from '../entities';

export interface IConversationRepository {
  findAll(): Promise<Conversation[]>;
  findById(id: string): Promise<Conversation | null>;
  create(): Promise<Conversation>;
  updateTitle(id: string, title: string): Promise<void>;
  delete(id: string): Promise<void>;
}
