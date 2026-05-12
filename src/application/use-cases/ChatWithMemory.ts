import type { IChunkRepository } from '@/domain/repositories/IChunkRepository';
import type { IConversationRepository } from '@/domain/repositories/IConversationRepository';
import type { IMessageRepository } from '@/domain/repositories/IMessageRepository';
import type { IEmbeddingService } from '@/domain/services/IEmbeddingService';
import type { Citation, DocumentChunk } from '@/domain/entities';

const TOP_K = 5;
const HISTORY_LIMIT = 10;

interface Deps {
  chunkRepo: IChunkRepository;
  conversationRepo: IConversationRepository;
  messageRepo: IMessageRepository;
  embeddingService: IEmbeddingService;
}

export interface ChatContext {
  conversationId: string;
  userMessage: string;
  relevantChunks: DocumentChunk[];
  citations: Citation[];
  historyMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  systemPrompt: string;
}

export async function buildChatContext(
  conversationId: string,
  userMessage: string,
  deps: Deps
): Promise<ChatContext> {
  const [embedding, history] = await Promise.all([
    deps.embeddingService.embed(userMessage),
    deps.messageRepo.findRecentByConversationId(conversationId, HISTORY_LIMIT),
  ]);

  const relevantChunks = await deps.chunkRepo.searchSimilar(embedding, TOP_K);

  const citations: Citation[] = relevantChunks.map(c => ({
    chunkId: c.id,
    documentId: c.documentId,
    documentName: c.documentName ?? 'Unknown',
    content: c.content,
    chunkIndex: c.chunkIndex,
    similarity: c.similarity ?? 0,
  }));

  const contextBlock = relevantChunks.length > 0
    ? relevantChunks.map((c, i) =>
        `[${i + 1}] From "${c.documentName}" (section ${c.chunkIndex + 1}):\n${c.content}`
      ).join('\n\n---\n\n')
    : 'No relevant documentation found.';

  const systemPrompt = `You are a helpful AI support assistant for a SaaS product. Answer questions clearly and accurately using the provided documentation context.

DOCUMENTATION CONTEXT:
${contextBlock}

INSTRUCTIONS:
- Base your answers primarily on the documentation context above.
- When referencing a specific section, cite it as [1], [2], etc., matching the numbered sources above.
- If the context does not cover the question, say so honestly and provide general guidance.
- Be concise but thorough. Use markdown formatting for clarity.`;

  const historyMessages = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  return {
    conversationId,
    userMessage,
    relevantChunks,
    citations,
    historyMessages,
    systemPrompt,
  };
}

export async function ensureConversation(
  conversationId: string | undefined,
  deps: Pick<Deps, 'conversationRepo'>
): Promise<string> {
  if (conversationId) return conversationId;
  const conversation = await deps.conversationRepo.create();
  return conversation.id;
}

export async function saveMessages(
  conversationId: string,
  userMessage: string,
  assistantContent: string,
  citations: Citation[],
  deps: Pick<Deps, 'messageRepo' | 'conversationRepo'>
): Promise<void> {
  await deps.messageRepo.create({
    conversationId,
    role: 'user',
    content: userMessage,
    citations: [],
  });

  await deps.messageRepo.create({
    conversationId,
    role: 'assistant',
    content: assistantContent,
    citations,
  });

  // Auto-title: first 6 words of first user message
  const title = userMessage.split(' ').slice(0, 6).join(' ');
  await deps.conversationRepo.updateTitle(conversationId, title);
}
