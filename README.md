# AI Support Chat

Intelligent support chat for any SaaS — powered by your own documentation.

## Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Frontend       | Next.js 16 + React 19 + TypeScript                         |
| AI / Streaming | Vercel AI SDK v4 + Claude Sonnet 4.6                       |
| Embeddings     | Voyage-3 via Anthropic API (1024-dim)                      |
| Vector search  | PostgreSQL + pgvector (HNSW index)                         |
| Architecture   | Clean Architecture (Domain / Application / Infrastructure) |

## Features

- **PDF upload** — drag-and-drop, chunked, embedded, stored
- **Semantic search** — cosine similarity via pgvector HNSW
- **Streaming answers** — real-time token streaming with Vercel AI SDK
- **Citations** — every answer links back to the exact source sections
- **Conversation memory** — last 10 messages of context per session

## Quick Start

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 17+ with [pgvector](https://github.com/pgvector/pgvector) extension
- Anthropic API key

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:password@localhost:5432/ai_support_chat
```

### 4. Create the database

```bash
createdb ai_support_chat
npm run db:migrate
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

1. **Upload** — PDF is parsed, chunked (1 500 chars / 200 overlap), each chunk embedded with voyage-3, stored in `document_chunks` with a `vector(1024)` column.

2. **Chat** — user message is embedded, top-5 similar chunks are retrieved via `<=>` cosine distance, injected into the Claude system prompt, and the response is streamed back.

3. **Citations** — retrieved chunks are sent as structured `data` events alongside the text stream; the UI renders them as collapsible source cards under each assistant message.

4. **Memory** — last 10 messages of the active conversation are fetched and passed as `messages[]` to Claude, giving full conversational context.
