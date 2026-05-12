'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { CitationCard } from './CitationCard';
import type { Citation } from '@/domain/entities';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul]|<\/[hul])(.+)$/gm, (match) =>
      match.startsWith('<') ? match : match
    );
}

export function MessageBubble({ role, content, citations = [], isStreaming }: MessageBubbleProps) {
  const [showCitations, setShowCitations] = useState(false);
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 message-appear ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        isUser
          ? 'bg-accent text-white'
          : 'bg-surface-3 text-slate-300 border border-border'
      }`}>
        {isUser ? 'U' : 'AI'}
      </div>

      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-accent text-white rounded-tr-sm'
            : 'bg-surface-1 text-slate-200 border border-border rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
          ) : (
            <div
              className="prose-chat text-sm"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          )}

          {isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-accent-light ml-0.5 animate-pulse-slow rounded-sm" />
          )}
        </div>

        {!isUser && citations.length > 0 && !isStreaming && (
          <div className="w-full">
            <button
              onClick={() => setShowCitations(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-2"
            >
              <BookOpen size={12} />
              <span>{citations.length} source{citations.length !== 1 ? 's' : ''}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${showCitations ? 'rotate-180' : ''}`}
              />
            </button>

            {showCitations && (
              <div className="flex flex-col gap-1.5">
                {citations.map((c, i) => (
                  <CitationCard key={c.chunkId} citation={c} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
