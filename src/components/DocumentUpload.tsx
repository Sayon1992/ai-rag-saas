'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { Document } from '@/domain/entities';

interface DocumentUploadProps {
  onUploadSuccess: (doc: Document) => void;
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export function DocumentUpload({ onUploadSuccess }: DocumentUploadProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Only PDF files are supported');
      setState('error');
      return;
    }

    setState('uploading');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Upload failed');

      setState('success');
      onUploadSuccess(data as Document);
      setTimeout(() => setState('idle'), 2000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed');
      setState('error');
    }
  }, [onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload(file);
  }, [upload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  }, [upload]);

  const Icon = state === 'uploading' ? Loader2
    : state === 'success' ? CheckCircle
    : state === 'error' ? AlertCircle
    : Upload;

  const iconColor = state === 'success' ? 'text-green-400'
    : state === 'error' ? 'text-red-400'
    : 'text-slate-400 group-hover:text-accent';

  return (
    <div
      onClick={() => state === 'idle' && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      className={`
        group relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
        ${isDragging
          ? 'border-accent bg-accent/5'
          : state === 'idle'
            ? 'border-border hover:border-accent/50 hover:bg-surface-2/50'
            : 'border-border bg-surface-2/30 cursor-default'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <Icon
        size={28}
        className={`mx-auto mb-2 transition-colors duration-200 ${iconColor} ${state === 'uploading' ? 'animate-spin' : ''}`}
      />

      <p className="text-sm text-slate-400">
        {state === 'idle' && 'Drop a PDF here or click to upload'}
        {state === 'uploading' && 'Processing PDF…'}
        {state === 'success' && 'Document uploaded!'}
        {state === 'error' && errorMsg}
      </p>
      {state === 'idle' && (
        <p className="text-xs text-slate-600 mt-1">Max 20 MB</p>
      )}
    </div>
  );
}
