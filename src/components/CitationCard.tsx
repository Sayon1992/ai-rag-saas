'use client';

import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import type { Citation } from '@/domain/entities';

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export function CitationCard({ citation, index }: CitationCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface-3 transition-colors text-left"
      >
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-semibold">
          {index + 1}
        </span>
        <FileText size={13} className="text-slate-400 flex-shrink-0" />
        <span className="text-slate-300 truncate flex-1">{citation.documentName}</span>
        <span className="text-slate-500 text-xs flex-shrink-0">§{citation.chunkIndex + 1}</span>
        <span className="text-slate-500 text-xs flex-shrink-0">
          {Math.round(citation.similarity * 100)}% match
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-500 flex-shrink-0 transition-transform duration-150 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {expanded && (
        <div className="px-3 py-3 bg-surface text-slate-400 text-xs leading-relaxed border-t border-border whitespace-pre-wrap">
          {citation.content}
        </div>
      )}
    </div>
  );
}
