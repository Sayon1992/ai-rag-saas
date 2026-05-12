'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import type { Citation, Message } from '@/domain/entities';

interface StreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  initialMessages: Message[];
  onConversationCreated: (id: string) => void;
}

function generateId() {
  return Math.random().toString(36).slice(2);
}

export function ChatInterface({
  conversationId,
  initialMessages,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<StreamMessage[]>(() =>
    initialMessages.map(m => ({ ...m, id: m.id }))
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeConvIdRef = useRef<string | null>(conversationId);

  useEffect(() => {
    activeConvIdRef.current = conversationId;
    setMessages(initialMessages.map(m => ({ ...m, id: m.id })));
  }, [conversationId, initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput('');
    setIsLoading(true);

    const userMsgId = generateId();
    const assistantMsgId = generateId();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: assistantMsgId, role: 'assistant', content: '', isStreaming: true },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: activeConvIdRef.current ?? undefined,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      // Headers are available immediately, before reading the body
      const newConvId = res.headers.get('X-Conversation-Id');
      const rawCitations = res.headers.get('X-Citations');
      const citations: Citation[] = rawCitations ? JSON.parse(rawCitations) : [];

      if (newConvId && newConvId !== activeConvIdRef.current) {
        activeConvIdRef.current = newConvId;
        onConversationCreated(newConvId);
      }

      // Read the plain text stream body
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accText += decoder.decode(value, { stream: true });
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId ? { ...m, content: accText } : m
          )
        );
      }

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, isStreaming: false, citations }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, something went wrong. Please try again.', isStreaming: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [input, isLoading, onConversationCreated]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
              <Sparkles size={28} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">How can I help you?</h2>
              <p className="text-sm text-slate-400 max-w-xs">
                Ask me anything about your product. I&apos;ll search the uploaded documentation and answer with citations.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg mt-2">
              {[
                'How do I get started?',
                'What integrations are available?',
                'How does billing work?',
                'What are the API rate limits?',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="px-3 py-2.5 rounded-xl bg-surface-2 border border-border hover:border-border-light hover:bg-surface-3 text-sm text-slate-300 text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(m => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              citations={m.citations}
              isStreaming={m.isStreaming}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-4 py-4 bg-surface-1">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your product…"
              rows={1}
              disabled={isLoading}
              className="w-full resize-none bg-surface-2 border border-border hover:border-border-light focus:border-accent rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors disabled:opacity-50"
              style={{ maxHeight: '160px', overflowY: 'auto' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            {isLoading
              ? <Bot size={16} className="text-white animate-pulse" />
              : <Send size={16} className="text-white" />
            }
          </button>
        </form>
        <p className="text-xs text-slate-600 mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
