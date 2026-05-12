export interface Document {
  id: string;
  name: string;
  size: number;
  chunkCount?: number;
  createdAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName?: string;
  content: string;
  embedding?: number[];
  chunkIndex: number;
  similarity?: number;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Citation {
  chunkId: string;
  documentId: string;
  documentName: string;
  content: string;
  chunkIndex: number;
  similarity: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  createdAt: Date;
}
