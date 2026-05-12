import { PgDocumentRepository } from '@/infrastructure/repositories/PgDocumentRepository';
import { PgChunkRepository } from '@/infrastructure/repositories/PgChunkRepository';
import { PgConversationRepository } from '@/infrastructure/repositories/PgConversationRepository';
import { PgMessageRepository } from '@/infrastructure/repositories/PgMessageRepository';
import { AnthropicEmbeddingService } from '@/infrastructure/services/AnthropicEmbeddingService';

// Singleton instances — repositories are stateless so sharing is safe
export const documentRepo = new PgDocumentRepository();
export const chunkRepo = new PgChunkRepository();
export const conversationRepo = new PgConversationRepository();
export const messageRepo = new PgMessageRepository();
export const embeddingService = new AnthropicEmbeddingService();
