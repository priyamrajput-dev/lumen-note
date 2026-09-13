# 🌟 Lumen Note

> **Synthesize Knowledge. Think at the Speed of Light.**  
> Lumen Note is a next-generation multi-modal AI research studio and interactive study workspace. Ingest PDFs, web articles, YouTube lectures, and markdown notes into unified workspaces, chat with verifiable citations & real-time web search, generate interactive 3D flashcards, quizzes, and mind maps, and retain personalized cross-session memory with Mem0.

---

[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express 5](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=flat-square)](https://www.pinecone.io/)
[![Inngest](https://img.shields.io/badge/Inngest-Workflows-000000?style=flat-square&logo=inngest&logoColor=white)](https://www.inngest.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-Google_OAuth-black?style=flat-square)](https://better-auth.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Multi-Modal Source Ingestion](#1-multi-modal-source-ingestion)
  - [2. Intelligent RAG Chat Studio](#2-intelligent-rag-chat-studio)
  - [3. Interactive Learning Artifacts](#3-interactive-learning-artifacts)
  - [4. Mem0 Persistent Personal Memory](#4-mem0-persistent-personal-memory)
  - [5. Resilient Event-Driven Pipelines](#5-resilient-event-driven-pipelines)
  - [6. Workspaces & Enterprise Security](#6-workspaces--enterprise-security)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Backend Configuration & Setup](#2-backend-configuration--setup)
  - [3. Frontend Configuration & Setup](#3-frontend-configuration--setup)
  - [4. Running Background Tasks (Inngest)](#4-running-background-tasks-inngest)
- [Environment Variables Guide](#-environment-variables-guide)
- [API Overview](#-api-overview)
- [License](#-license)

---

## 💡 Overview

Modern research involves juggling disconnected PDFs, lecture recordings, articles, and personal notes. Traditional note-taking tools are passive, while generic AI chatbots lack deep grounding in your actual source materials.

**Lumen Note** bridges this gap:
1. **Curate:** Aggregate diverse multi-modal media into isolated workspaces.
2. **Interrogate:** Ask complex questions grounded in your documents with verified citations and automatic web fallback.
3. **Internalize:** Turn raw source text into interactive study materials — dynamic mind maps, self-grading quizzes, 3D flip flashcards, key takeaways, and structured reports.
4. **Remember:** Maintain cross-conversation memory of your background, preferences, and goals across sessions.

---

## ✨ Key Features

### 1. Multi-Modal Source Ingestion
Ingest information from across the web and your local files:
- **PDF Documents:** Upload research papers and books with page-level tracking and text extraction (via `unpdf` & Cloudinary).
- **Live Websites & Articles:** Deep-scrape full web pages into clean markdown (powered by `Firecrawl`).
- **YouTube Lectures:** Extract full timestamped transcripts directly from video URLs (powered by `youtube-transcript`).
- **Raw Text & Markdown Notes:** Direct paste or upload of notes and drafts.
- **Automated Chunking & Embedding:** Splits documents into semantic chunks with token counts and indexes them in Pinecone.

### 2. Intelligent RAG Chat Studio
- **Streamed Multi-Turn Dialogue:** Low-latency streaming responses via Vercel AI SDK (`ai` and `@ai-sdk/openai`).
- **Verifiable In-line Citations:** Every answer cites exact source documents, chunk snippets, page numbers, and vector similarity scores.
- **Real-Time Web Search:** Seamlessly calls Tavily search when queries demand current information outside the workspace.
- **Model Flexibility:** Toggle between models like `gpt-4o` and `gpt-4o-mini` per workspace.
- **Rolling Context Summarization:** Long conversations are automatically condensed into summaries to stay within LLM context windows without losing key insights.

### 3. Interactive Learning Artifacts
Transform static documents into active learning tools:
- **🗂️ 3D Study Flashcards:** Interactive front/back flip cards with keyboard navigation and progress tracking.
- **📝 Self-Grading Quizzes:** Multiple-choice quizzes with real-time answer checking, detailed rationales, and final score summaries.
- **🧠 Dynamic Mind Maps:** Visual concept maps rendered with nodes and interconnected branches, complete with zoom and pan controls.
- **📌 Key Takeaways:** High-yield, bulleted takeaways extracted from all ready workspace sources.
- **📄 Research Reports & Summaries:** Structured long-form reports with dedicated sections and comprehensive markdown summaries.

### 4. Mem0 Persistent Personal Memory
- **Autonomous Memory Extraction:** Learns user preferences, background, and goals automatically from conversation interactions.
- **Dedicated Memory Manager:** View, search, manually create, edit, and delete memories at `/memories`.
- **Context Injection:** Injects relevant memories into future chat prompts for hyper-personalized assistance.

### 5. Resilient Event-Driven Pipelines
- **Asynchronous Inngest Workflows:** Heavy operations (source extraction, chunking, Pinecone vector indexing, conversation summarization, artifact generation) run through reliable, step-based Inngest functions with automatic retries.

### 6. Workspaces & Enterprise Security
- **Multi-Workspace Isolation:** Organize projects into dedicated workspaces with custom icons, descriptions, and default LLM preferences.
- **Better Auth Integration:** Secure authentication powered by Better Auth supporting Google OAuth.
- **Strict Data Scoping:** All documents, chunks, vectors, conversations, and memories are strictly isolated per user and workspace.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([User / Browser])

    subgraph Frontend ["Client (React 19 + Vite + Tailwind v4)"]
        UI[Workspace Dashboard / Chat Studio / Artifacts / Memories]
        TQ[TanStack React Query + Better Auth Client]
    end

    subgraph Backend ["Server (Express 5 + TypeScript)"]
        API[REST & Streaming API]
        Auth[Better Auth Module]
        RAG[RAG Retrieval & Tavily Web Search]
        DB_Layer[Drizzle ORM]
    end

    subgraph Workers ["Async Background Workers (Inngest)"]
        IngestJob[Process Source: Extract & Chunk]
        IndexJob[Embed & Index to Pinecone]
        SummJob[Summarize Conversation]
        ArtifactJob[Generate Flashcards, Quizzes, Mindmaps]
    end

    subgraph External ["Cloud & AI Infrastructure"]
        Postgres[(PostgreSQL Database)]
        Pinecone[(Pinecone Vector DB)]
        OpenAI[OpenAI Embeddings & GPT Models]
        Firecrawl[Firecrawl Web Scraper]
        Cloudinary[Cloudinary PDF Storage]
        Mem0[Mem0 Memory Service]
        Tavily[Tavily Search API]
    end

    User <--> UI
    UI <--> TQ
    TQ <--> API

    API --> DB_Layer
    API --> Auth
    API --> RAG
    API --> Workers

    DB_Layer <--> Postgres
    RAG <--> Pinecone
    RAG <--> OpenAI
    RAG <--> Tavily
    RAG <--> Mem0

    Workers --> Firecrawl
    Workers --> Cloudinary
    Workers --> OpenAI
    Workers --> Pinecone
    Workers --> Postgres
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Phosphor Icons, Radix / Base UI, TanStack React Query v5, Zustand, React Router v7, Recharts |
| **Backend** | Node.js, Express 5, TypeScript (`tsx`), Drizzle ORM, PostgreSQL (`pg`), Zod validation |
| **Authentication** | Better Auth (with Google OAuth and Session Cookies) |
| **AI & LLM Framework** | Vercel AI SDK (`ai`, `@ai-sdk/openai`), OpenAI API (`text-embedding-3-small`, `gpt-4o`, `gpt-4o-mini`) |
| **Vector Database** | Pinecone Vector Database |
| **Background Jobs** | Inngest (multi-step serverless event workflows & retries) |
| **Memory Layer** | Mem0 AI Platform |
| **Web Search & Scraping** | Tavily AI Search API, Firecrawl API |
| **Media & File Handling** | Cloudinary, Multer, `unpdf`, `youtube-transcript` |

---

## 📂 Project Structure

```text
lumen-note/
├── client/                     # React 19 frontend application
│   ├── src/
│   │   ├── api/                # API clients (workspaces, sources, chat, artifacts, memories, auth)
│   │   ├── components/
│   │   │   ├── artifacts/      # FlashcardDeck, QuizView, MindmapView, ArtifactModal
│   │   │   ├── chat/           # ChatStudio, CitationsPopover
│   │   │   ├── sources/        # AddSourceModal, SourcesPanel, SourcePreviewDrawer
│   │   │   ├── workspaces/     # WorkspaceCard, CreateWorkspaceModal, WorkspaceSettings
│   │   │   └── ui/             # Reusable UI primitives (dialog, button, dropdown, etc.)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx     # Hero and marketing page
│   │   │   ├── DashboardPage.tsx   # Workspaces list & management
│   │   │   ├── WorkspacePage.tsx   # Workspace workspace tabs (Chat, Sources, Artifacts)
│   │   │   └── MemoriesPage.tsx    # Mem0 memory search and management
│   │   ├── stores/             # Zustand state stores
│   │   └── types/              # Frontend TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── server/                     # Express 5 backend application
│   ├── drizzle/                # Generated SQL migrations
│   ├── src/
│   │   ├── common/             # Global configs, environment parser, error handlers
│   │   ├── db/                 # Drizzle schemas (workspace, source, conversation, artifact, auth)
│   │   ├── inngest/            # Inngest function handlers (processSource, summarize, artifacts)
│   │   ├── lib/                # Third-party integrations (Pinecone, OpenAI, Tavily, Mem0, Firecrawl)
│   │   ├── modules/
│   │   │   ├── workspace/      # Workspace CRUD routes, controllers & services
│   │   │   ├── source/         # Source uploading, chunking, processing services
│   │   │   ├── conversation/   # Chat streaming, RAG context retrieval, message history
│   │   │   ├── artifact/       # Artifact generation (Flashcards, Quizzes, Mindmaps, Reports)
│   │   │   └── memory/         # Mem0 memory API endpoints
│   │   ├── app.ts              # Express application setup & middleware
│   │   └── server.ts           # Server bootstrap
│   ├── drizzle.config.ts
│   └── package.json
│
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or higher (recommended) or `npm`
- **PostgreSQL**: Local instance (e.g. Postgres.app, Homebrew, Docker) or cloud (Supabase, Neon)
- **API Keys**:
  - [OpenAI API](https://platform.openai.com/) (Required for LLM and vector embeddings)
  - [Pinecone](https://www.pinecone.io/) (Required for vector storage and semantic search)
  - [Google Cloud Console](https://console.cloud.google.com/) (Required for Google OAuth login)
  - [Inngest](https://www.inngest.com/) (Free local dev server or cloud)
  - [Mem0](https://mem0.ai/) (Optional, for persistent memory features)
  - [Tavily](https://tavily.com/) (Optional, for real-time web search)
  - [Firecrawl](https://www.firecrawl.dev/) (Optional, for website crawling)
  - [Cloudinary](https://cloudinary.com/) (Optional, for PDF cloud uploads)

---

### 1. Clone Repository

```bash
git clone https://github.com/your-username/lumen-note.git
cd lumen-note
```

---

### 2. Backend Configuration & Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create `.env` file:**
   Create `server/.env` based on the configuration guide below:
   ```env
   PORT=8080
   CLIENT_URL=http://localhost:3000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/lumennote
   BETTER_AUTH_SECRET=your_better_auth_secret_key_here
   BETTER_AUTH_URL=http://localhost:3000

   CLIENT_ID=your_google_oauth_client_id
   CLIENT_SECRET=your_google_oauth_client_secret

   OPENAI_API_KEY=sk-...
   PINECONE_API_KEY=...
   PINECONE_INDEX=lumennote

   # Optional integrations
   TAVILY_API_KEY=tvly-...
   MEM0_API_KEY=m0-...
   FIRECRAWL_API_KEY=fc-...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start the development server:**
   ```bash
   pnpm dev
   ```
   The backend API will run on `http://localhost:8080`.

---

### 3. Frontend Configuration & Setup

1. **Open a new terminal and navigate to client:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_URL=/api
   ```

4. **Start Vite development server:**
   ```bash
   pnpm dev
   ```
   The frontend app will run on `http://localhost:3000`.

---

### 4. Running Background Tasks (Inngest)

Lumen Note utilizes [Inngest](https://www.inngest.com/) for reliable background job execution (extracting documents, chunking text, generating embeddings, summarization, and artifacts).

In a separate terminal, launch the local Inngest Dev Server:

```bash
npx inngest-cli@latest dev -u http://localhost:8080/api/inngest
```

This starts the Inngest local dashboard at `http://localhost:8288` where you can inspect events, view multi-step execution logs, and monitor retries.

---

## 🔑 Environment Variables Guide

### Server (`server/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `PORT` | Yes | Port for Express server (defaults to `8080`) |
| `CLIENT_URL` | Yes | Base frontend origin for CORS (e.g. `http://localhost:3000`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ character string for token hashing |
| `BETTER_AUTH_URL` | Yes | Base URL where client authenticates (`http://localhost:3000`) |
| `CLIENT_ID` | Yes | Google Cloud OAuth Client ID |
| `CLIENT_SECRET` | Yes | Google Cloud OAuth Client Secret |
| `OPENAI_API_KEY` | Yes | OpenAI API Key for embeddings and chat generation |
| `PINECONE_API_KEY` | Yes | Pinecone API key |
| `PINECONE_INDEX` | No | Pinecone index name (defaults to `lumennote`) |
| `INNGEST_EVENT_KEY` | No | Required for production Inngest cloud events |
| `INNGEST_SIGNING_KEY` | No | Required for production Inngest signature verification |
| `MEM0_API_KEY` | No | API key for Mem0 persistent user memory |
| `TAVILY_API_KEY` | No | API key for live Tavily web search fallback |
| `FIRECRAWL_API_KEY` | No | API key for scraping web URLs to markdown |
| `CLOUDINARY_*` | No | Cloudinary credentials for hosting uploaded PDF assets |

### Client (`client/.env`)

| Variable | Required | Description |
| :--- | :---: | :--- |
| `VITE_API_URL` | Yes | Base path or URL for backend API requests (e.g. `/api`) |

---

## 📡 API Overview

| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/*` | `ALL` | Better Auth endpoints (session, Google OAuth, callback) |
| `/api/workspaces` | `GET`, `POST` | List and create workspaces |
| `/api/workspaces/:id` | `GET`, `PATCH`, `DELETE` | Retrieve, update, or remove workspace |
| `/api/workspaces/:id/sources` | `GET`, `POST` | Retrieve workspace sources or upload new sources (PDF/Web/YouTube/Text) |
| `/api/workspaces/:id/sources/:sourceId` | `GET`, `DELETE` | View source details, extraction text, or delete source |
| `/api/workspaces/:id/chat` | `POST` | Stream chat responses with RAG retrieval, citations, and Tavily web tool |
| `/api/workspaces/:id/chat/conversations` | `GET`, `POST` | List and create conversation sessions |
| `/api/workspaces/:id/chat/conversations/:convoId/messages` | `GET` | Fetch conversation message history |
| `/api/workspaces/:id/artifacts` | `GET`, `POST` | List artifacts or trigger generation (Flashcards, Quizzes, Mindmaps, Summaries, Reports) |
| `/api/workspaces/:id/artifacts/:artifactId` | `GET`, `DELETE` | Fetch artifact content or delete an artifact |
| `/api/memories` | `GET`, `POST` | Fetch user memories or manually add a new memory record |
| `/api/memories/:memoryId` | `PUT`, `DELETE` | Update or delete personal memory |
| `/api/inngest` | `ALL` | Inngest webhook route for background pipelines |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
