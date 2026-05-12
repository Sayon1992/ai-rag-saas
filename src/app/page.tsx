"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatInterface } from "@/components/ChatInterface";
import type { Document, Conversation, Message } from "@/domain/entities";

interface ConversationState {
  id: string;
  messages: Message[];
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationState | null>(null);

  // Load initial data
  useEffect(() => {
    Promise.all([
      fetch("/api/documents").then((r) => r.json()),
      fetch("/api/conversations").then((r) => r.json()),
    ])
      .then(([docs, convs]) => {
        setDocuments(docs as Document[]);
        setConversations(convs as Conversation[]);
      })
      .catch(console.error);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const { messages } = (await res.json()) as {
      conversation: Conversation;
      messages: Message[];
    };
    setActiveConv({ id, messages });
  }, []);

  const handleNewConversation = useCallback(() => {
    setActiveConv({ id: "", messages: [] });
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      loadConversation(id);
    },
    [loadConversation],
  );

  const handleConversationCreated = useCallback((id: string) => {
    setActiveConv((prev) => (prev ? { ...prev, id } : { id, messages: [] }));
    // Refresh conversation list to show new entry
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((convs) => setConversations(convs as Conversation[]))
      .catch(console.error);
  }, []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConv?.id === id) setActiveConv(null);
    },
    [activeConv],
  );

  const handleDocumentUploaded = useCallback((doc: Document) => {
    setDocuments((prev) => [doc, ...prev]);
  }, []);

  const handleDocumentDeleted = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar
        documents={documents}
        conversations={conversations}
        activeConversationId={activeConv?.id ?? null}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onDocumentUploaded={handleDocumentUploaded}
        onDocumentDeleted={handleDocumentDeleted}
      />

      <main className="flex-1 min-w-0 h-full">
        {activeConv !== null ? (
          <ChatInterface
            key={activeConv.id}
            conversationId={activeConv.id || null}
            initialMessages={activeConv.messages}
            onConversationCreated={handleConversationCreated}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-2">
              <span className="text-3xl">💬</span>
            </div>
            <h1 className="text-2xl font-bold text-white">AI Support Chat</h1>
            <p className="text-slate-400 max-w-md text-sm leading-relaxed">
              Upload your product documentation in the{" "}
              <span className="text-slate-300 text-bold">Docs</span> tab, then
              start a conversation. The AI will answer questions using your docs
              with cited sources.
            </p>
            <button
              onClick={handleNewConversation}
              className="mt-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition-colors"
            >
              Start a conversation
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
