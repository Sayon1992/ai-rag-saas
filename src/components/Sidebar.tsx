"use client";

import { useState } from "react";
import { Plus, MessageSquare, FileText, Trash2, Bot } from "lucide-react";
import { DocumentUpload } from "./DocumentUpload";
import { DocumentList } from "./DocumentList";
import type { Document, Conversation } from "@/domain/entities";

interface SidebarProps {
  documents: Document[];
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onDocumentUploaded: (doc: Document) => void;
  onDocumentDeleted: (id: string) => void;
}

type Tab = "chat" | "docs";

export function Sidebar({
  documents,
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onDocumentUploaded,
  onDocumentDeleted,
}: SidebarProps) {
  const [tab, setTab] = useState<Tab>("chat");

  return (
    <aside className="flex flex-col h-full w-72 bg-surface-1 border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">
            SaaS Support
          </p>
          <p className="text-xs text-slate-500">AI-powered help desk</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mx-3 mt-3">
        {(
          [
            ["chat", "Chats", MessageSquare],
            ["docs", "Docs", FileText],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors flex-1 justify-center ${
              tab === id
                ? "border-accent text-accent"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === "chat" ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={onNewConversation}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              New conversation
            </button>

            <div className="space-y-0.5 mt-1">
              {conversations.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">
                  No conversations yet
                </p>
              )}
              {conversations?.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                    activeConversationId === conv.id
                      ? "bg-surface-3 text-white"
                      : "text-slate-400 hover:bg-surface-2 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare size={13} className="flex-shrink-0" />
                  <span className="text-xs flex-1 truncate">
                    {conv.title ?? "New conversation"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <DocumentUpload onUploadSuccess={onDocumentUploaded} />
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 px-1">
                {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                in knowledge base
              </p>
              <DocumentList
                documents={documents}
                onDelete={onDocumentDeleted}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
