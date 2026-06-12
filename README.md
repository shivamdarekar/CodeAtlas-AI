# CodeAtlas — AI-Powered Codebase Intelligence

> Index any GitHub repository. Trace architecture. Get precise answers with AI.

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
| **Batch Embedding** | Sends 8 texts per HuggingFace API call with retry/backoff — 8× faster than per-chunk embedding |
| **Auto Cleanup** | Cloned repos are deleted from disk after indexing completes |

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
| **simple-git** | Shallow clone (`--depth 1`) of GitHub repositories |
| **Zod** | Runtime request validation |
| **rimraf** | Post-indexing disk cleanup |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16 (App Router)** | React framework with file-based routing |
| **TypeScript** | Type-safe frontend |
| **Tailwind CSS + shadcn/ui** | UI components and styling |
| **Zustand** | Global state — active repo, chat history, mode |
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
│       ├── ai/                   # LLM prompt construction (Groq/LangChain)
│       ├── controllers/          # Express route handlers
│       ├── indexing/
│       │   ├── chunker/          # AST chunker (ts-morph) — functions, classes, components, methods
│       │   ├── embeddings/       # HuggingFace batch embedding service
│       │   └── scanner/          # Repository file walker with ignore filters
│       ├── middlewares/          # Global error handler
│       ├── retrieval/            # Multi-hop retrieval engine
│       ├── routes/               # Express route definitions
│       ├── services/             # Business logic — chat, indexing, summary, repository
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
│       ├── store/                # Zustand global state
│       └── types/                # Frontend TypeScript types
└── docs/
    ├── system_architecture.md    # Full backend deep-dive — AST, multi-hop, embeddings
    └── frontend_architecture.md  # Frontend implementation guide — Zustand, React Flow, Mermaid
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
git clone https://github.com/your-username/codeatlas.git
cd codeatlas
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

### Index a Repository
```
POST /api/v1/repo/analyze
Body: { "repoUrl": "https://github.com/user/repo", "branch": "main" }
```

### Chat with Indexed Repo
```
POST /api/v1/repo/:namespace/chat
Body: { "query": "How does authentication work?", "mode": "chat" }
```

### Get Repository Summary
```
GET /api/v1/repo/:namespace/summary
```

**Available modes:** `chat` · `overview` · `flow` · `diagram`

---

## 📚 Documentation

| Document | Description |
|---|---|
| [System Architecture Guide](./docs/system_architecture.md) | Deep-dive into AST parsing, multi-hop retrieval, embedding pipeline, Pinecone record structure, prompt engineering, and system design interview talking points |
| [Frontend Architecture Guide](./docs/frontend_architecture.md) | Complete frontend build guide — Zustand store design, React Flow canvas, Mermaid renderer, chat mode rendering strategy, component build order |

---

## 📄 License

MIT
