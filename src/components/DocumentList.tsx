'use client';

import { useState } from 'react';
import { FileText, Trash2, Loader2 } from 'lucide-react';
import type { Document } from '@/domain/entities';

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  if (documents.length === 0) {
    return (
      <p className="text-xs text-slate-500 text-center py-4">
        No documents yet. Upload a PDF to get started.
      </p>
    );
  }

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      onDelete(id);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ul className="space-y-1.5">
      {documents.map(doc => (
        <li
          key={doc.id}
          className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-2 border border-border hover:border-border-light group transition-colors"
        >
          <FileText size={14} className="text-accent flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-200 truncate leading-tight">{doc.name}</p>
            <p className="text-xs text-slate-500">
              {formatSize(doc.size)}
              {doc.chunkCount !== undefined && ` · ${doc.chunkCount} chunks`}
            </p>
          </div>
          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            className="flex-shrink-0 p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            {deleting === doc.id
              ? <Loader2 size={13} className="animate-spin" />
              : <Trash2 size={13} />
            }
          </button>
        </li>
      ))}
    </ul>
  );
}
