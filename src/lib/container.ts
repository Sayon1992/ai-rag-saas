import { PgDocumentRepository } from '@/infrastructure/repositories/PgDocumentRepository';
import { PgChunkRepository } from '@/infrastructure/repositories/PgChunkRepository';
import { PgConversationRepository } from '@/infrastructure/repositories/PgConversationRepository';
import { PgMessageRepository } from '@/infrastructure/repositories/PgMessageRepository';
import { EmbeddingService } from '@/infrastructure/services/EmbeddingService';

export const documentRepo = new PgDocumentRepository();
export const chunkRepo = new PgChunkRepository();
export const conversationRepo = new PgConversationRepository();
export const messageRepo = new PgMessageRepository();
export const embeddingService = new EmbeddingService();
