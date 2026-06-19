# CodeAtlas — AI-Powered Codebase Intelligence

> Index any GitHub repository or ZIP archive. Trace architecture. Get precise answers with AI.

CodeAtlas parses your codebase using a **TypeScript compiler AST** — not text splitting — to build a true dependency graph of your project's functions, components, classes, hooks, and API routes. Then lets you explore it through natural language chat, execution flow traces, and auto-generated visual diagrams.

---

## ✨ What Makes It Different

Most AI code tools split files by character count and hope the right context lands in the top-K vector results. CodeAtlas takes a fundamentally different approach:

| Standard RAG | CodeAtlas |
|---|---|
| Splits code at arbitrary character limits | Parses code with a real TypeScript compiler AST |
| Loses function bodies mid-split | Every chunk is a complete function, class, or component |
| No relationship awareness | Extracts `functionCalls`, `componentDependencies`, `apiCalls` per chunk |
| Single-hop vector search | Multi-hop graph traversal follows dependency chains |
| Hallucinated execution flows | Precise flows backed by real metadata |

---

## 🚀 Features

| Feature | Description |
|---|---|
| **AST-Aware Chunking** | Uses `ts-morph` to extract complete functions, classes, React components, and class methods — never splits mid-block |
| **React Component Detection** | Detects PascalCase functions, `memo()`, `forwardRef()`, and `React.FC` typed variables as `component` chunks |
| **Class + Method Extraction** | A class produces both a full class chunk and individual method chunks (`AuthService.login`, `AuthService.register`) |
| **Multi-Hop Flow Tracing** | Follows dependency metadata across files — fetches the callee's code in a second Pinecone query without re-embedding |
| **4 Analytical Modes** | `chat`, `overview`, `flow`, `diagram` — each with a dedicated retrieval strategy and LLM prompt |
| **Mermaid Diagram Generation** | LLM produces valid Mermaid flowcharts from real AST dependency metadata |
| **React Flow Canvas** | Interactive node graph to visually explore components, pages, hooks, and API routes |
| **Smart Noise Filtering** | Strips JS built-ins (`Math.floor`, `console.log`, `JSON.stringify`) from metadata |
| **Batch Embedding** | Sends texts in batches per HuggingFace API call with retry/backoff |
| **ZIP Upload Support** | Upload any project as a `.zip` archive — no GitHub URL required (up to 200 MB) |
| **Commit Summary** | Fetches last 50 commits during indexing, stores them, and generates an AI-powered grouped summary on demand |
| **SSE Progress Streaming** | Real-time indexing progress streamed to the frontend via Server-Sent Events |
| **Auto Cleanup** | Cloned/extracted repos are deleted from disk after indexing completes |

---

## 🧠 Chat Modes

| Mode | What It Does | Retrieval Strategy |
|---|---|---|
| `chat` | Natural language Q&A about any part of the codebase | Vector similarity search (top-10) |
| `overview` | Full architecture report — pages, components, hooks, APIs | Reads `summary.json` directly, no vector search |
| `flow` | Step-by-step execution trace with dependency hops | Multi-hop AST graph traversal |
| `diagram` | Mermaid.js architecture diagram rendered in the browser | Multi-hop traversal + diagram prompt |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express** | REST API server |
| **TypeScript** | Type-safe development |
| **ts-morph** | TypeScript Compiler API — AST parsing, node extraction |
| **Pinecone (Serverless)** | Vector DB — stores embeddings + full AST metadata per chunk |
| **HuggingFace Inference API** | Batch embedding via `BAAI/bge-small-en-v1.5` (384-dim) |
| **Groq (Llama-3.3-70b)** | LLM inference — fast, deterministic at `temperature: 0.1` |
| **LangChain (`@langchain/groq`)** | LLM prompt orchestration |
| **simple-git** | Depth-50 clone of GitHub repositories — captures commit history |
| **unzipper** | ZIP archive extraction for local project uploads |
| **multer** | Multipart file upload handling for ZIP files |
| **Zod** | Runtime request validation |
| **rimraf** | Post-indexing disk cleanup |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16 (App Router)** | React framework with file-based routing |
| **TypeScript** | Type-safe frontend |
| **Tailwind CSS + shadcn/ui** | UI components and styling |
| **Zustand** | Split stores — `repo-store`, `chat-store`, `ui-store` |
| **Axios** | HTTP client |
| **react-markdown + react-syntax-highlighter** | Markdown and code block rendering for AI responses |
| **Mermaid.js** | Renders LLM-generated diagram blocks as interactive SVGs |
| **React Flow** | Interactive node-based codebase dependency graph |
| **Framer Motion** | Animations |
| **Three.js + @react-three/fiber** | 3D particle canvas on landing page |

---

## 📂 Project Structure

```
├── backend/
│   └── src/
│       ├── ai/                   # LLM prompt construction (Groq/LangChain) — 4 mode prompts
│       ├── controllers/          # Express route handlers
│       │   ├── chat.controller.ts
│       │   ├── indexing.controller.ts
│       │   └── repository.controller.ts  # includes getCommitSummaryController
│       ├── indexing/
│       │   ├── chunker/          # AST chunker (ts-morph) — functions, classes, components, methods
│       │   ├── embeddings/       # HuggingFace batch embedding service
│       │   └── scanner/          # Repository file walker with ignore filters
│       ├── middlewares/          # Global error handler
│       ├── retrieval/            # Multi-hop retrieval engine
│       ├── routes/               # Express route definitions
│       ├── services/
│       │   ├── chat.service.ts
│       │   ├── indexing.service.ts   # captures git commits during indexing
│       │   ├── repository.service.ts # --depth 50 clone
│       │   ├── summary.service.ts
│       │   └── zip.service.ts        # ZIP extraction + indexing
│       ├── types/                # TypeScript interfaces
│       ├── utils/                # File utilities, API helpers, ignore lists
│       ├── validators/           # Zod request schemas
│       └── vectorstore/          # Pinecone upsert, query, metadata fetch
├── frontend/
│   └── src/
│       ├── app/                  # Next.js pages (/, /analyze, /[namespace]/chat)
│       ├── components/           # Chat UI, diagrams, repository forms
│       ├── effects/              # Three.js canvas effects
│       ├── layout/               # Sidebar, Navbar, AppShell
│       ├── lib/                  # Axios API client
│       ├── store/
│       │   ├── repo-store.ts     # active repo + history (persisted)
│       │   ├── chat-store.ts     # messages, streaming, mode
│       │   └── ui-store.ts       # sidebar, active view
│       └── types/                # Frontend TypeScript types
└── docs/
    ├── CodeAtlas_Architecture_Guide.md   # Full backend deep-dive
    └── frontend_architecture.md          # Frontend implementation guide
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Node.js 18+
- A [Pinecone](https://pinecone.io) account with a serverless index (dimension: `384`, metric: `cosine`)
- A [HuggingFace](https://huggingface.co) account (free Inference API key)
- A [Groq](https://console.groq.com) account (free API key)

---

### 1. Clone the Repository

```bash
git clone https://github.com/shivamdarekar/CodeAtlas-AI.git
cd CodeAtlas-AI
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
# Server
PORT=5000

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# HuggingFace
HUGGINGFACE_API_KEY=your_hf_api_key
HUGGINGFACE_MODEL=BAAI/bge-small-en-v1.5

# Groq
GROQ_API_KEY=your_groq_api_key
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:5000`.

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the frontend:

```bash
npm run dev
```

The app will be running at `http://localhost:3000`.

---

## 🔌 API Reference

### Index a GitHub Repository (streaming)
```
POST /api/v1/repos/analyze/stream
Body: { "repoUrl": "https://github.com/user/repo", "branch": "main" }
```

### Upload a ZIP Archive (streaming)
```
POST /api/v1/repos/upload/stream
Body: multipart/form-data — field: zipFile (.zip, max 200 MB)
```

### Chat with Indexed Repo
```
POST /api/v1/repos/:namespace/chat
Body: { "query": "How does authentication work?", "mode": "chat" }
```

### Get Repository Summary
```
GET /api/v1/repos/:namespace/summary
```

### Get AI Commit Summary
```
GET /api/v1/repos/:namespace/commits/summary
```
Returns an LLM-generated grouped summary of the last 50 commits. Only available for GitHub-cloned repos (not ZIP uploads).

### List All Indexed Repositories
```
GET /api/v1/repos
```

**Available modes:** `chat` · `overview` · `flow` · `diagram`

---

## 📚 Documentation

| Document | Description |
|---|---|
| [System Architecture Guide](./docs/CodeAtlas_Architecture_Guide.md) | Deep-dive into AST parsing, multi-hop retrieval, embedding pipeline, Pinecone record structure, prompt engineering, ZIP upload flow, commit summary feature, and system design interview talking points |
| [Frontend Architecture Guide](./docs/frontend_architecture.md) | Frontend implementation guide — split Zustand stores, React Flow canvas, Mermaid renderer, chat mode rendering strategy, ZIP upload UI, commit summary button |

---

## 📄 License

MIT
