import { NextRequest } from 'next/server';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { chunkRepo, conversationRepo, messageRepo, embeddingService } from '@/lib/container';
import {
  buildChatContext,
  ensureConversation,
  saveMessages,
} from '@/application/use-cases/ChatWithMemory';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = await req.json() as { message: string; conversationId?: string };
  const { message, conversationId: incomingId } = body;

  if (!message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const conversationId = await ensureConversation(incomingId, { conversationRepo });

  const context = await buildChatContext(conversationId, message, {
    chunkRepo,
    conversationRepo,
    messageRepo,
    embeddingService,
  });

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: context.systemPrompt,
    messages: [
      ...context.historyMessages,
      { role: 'user', content: message },
    ],
    onFinish: async ({ text }) => {
      await saveMessages(conversationId, message, text, context.citations, {
        messageRepo,
        conversationRepo,
      });
    },
  });

  // Citations and conversationId travel as response headers (available before stream body).
  return result.toTextStreamResponse({
    headers: {
      'X-Conversation-Id': conversationId,
      'X-Citations': JSON.stringify(context.citations),
    },
  });
}
