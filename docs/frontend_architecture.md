# CodeAtlas — Frontend Architecture Guide
*Reflects the current built state of the frontend.*

---

## Table of Contents
1. [What Is Built](#1-what-is-built)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Backend API Contract](#4-backend-api-contract)
5. [TypeScript Types](#5-typescript-types)
6. [Axios API Client](#6-axios-api-client)
7. [Zustand Stores — Split Design](#7-zustand-stores--split-design)
8. [Pages & Routing](#8-pages--routing)
9. [Repository Indexing — GitHub + ZIP](#9-repository-indexing--github--zip)
10. [The Chat Interface — 4 Mode Rendering](#10-the-chat-interface--4-mode-rendering)
11. [Commit Summary Feature](#11-commit-summary-feature)
12. [Mermaid.js Renderer](#12-mermaidjs-renderer)
13. [React Flow — Codebase Graph Canvas](#13-react-flow--codebase-graph-canvas)
14. [Chat Sidebar](#14-chat-sidebar)
15. [UI Design System](#15-ui-design-system)

---

## 1. What Is Built

| File | Status | Notes |
|---|---|---|
| `src/app/page.tsx` | ✅ Done | Landing page shell |
| `src/app/layout.tsx` | ✅ Done | Fonts, Toaster, TooltipProvider |
| `src/app/analyze/page.tsx` | ✅ Done | Repo indexing page |
| `src/app/[namespace]/chat/page.tsx` | ✅ Done | Main chat app |
| `src/components/HeroSection.tsx` | ✅ Done | Hero with animated dashboard preview |
| `src/components/FeatureCards.tsx` | ✅ Done | Bento grid feature cards |
| `src/components/HowItWorks.tsx` | ✅ Done | Interactive terminal stepper |
| `src/layout/Navbar.tsx` | ✅ Done | Navbar — Features, Docs (→ GitHub), GitHub link, Get Started button |
| `src/layout/Footer.tsx` | ✅ Done | |
| `src/layout/ChatSidebar.tsx` | ✅ Done | Repo card, views, stats, commit summary, clear |
| `src/layout/AppShell.tsx` | ✅ Done | Sidebar + main area layout |
| `src/components/repository/RepoIndexForm.tsx` | ✅ Done | GitHub URL + ZIP upload with SSE progress |
| `src/components/chat/ChatWindow.tsx` | ✅ Done | Scrollable message list with empty state |
| `src/components/chat/ChatMessage.tsx` | ✅ Done | Markdown + mermaid-aware message renderer |
| `src/components/chat/ChatInput.tsx` | ✅ Done | Input bar |
| `src/components/chat/ModeSelector.tsx` | ✅ Done | 4-mode tab selector |
| `src/components/diagrams/MermaidRenderer.tsx` | ✅ Done | Mermaid SVG renderer |
| `src/components/diagrams/CodebaseGraph.tsx` | ✅ Done | React Flow canvas |
| `src/store/repo-store.ts` | ✅ Done | Active repo + history (persisted) |
| `src/store/chat-store.ts` | ✅ Done | Messages, streaming, mode |
| `src/store/ui-store.ts` | ✅ Done | Sidebar open, active view |
| `src/lib/api.ts` | ✅ Done | Axios client + all API methods |
| `src/types/index.ts` | ✅ Done | All TypeScript interfaces |

---

## 2. Tech Stack

| Package | Purpose |
|---|---|
| `next` ^16 | App Router, `[namespace]/chat` dynamic routes |
| `react` ^19 | UI framework |
| `typescript` ^6 | Type safety |
| `tailwindcss` ^4 | Utility CSS |
| `zustand` ^5 | Split global stores — no Provider, no reducers |
| `axios` ^1.17 | HTTP client with base URL + timeout config |
| `react-hook-form` + `zod` | GitHub URL form validation |
| `react-markdown` | Renders LLM markdown responses |
| `react-syntax-highlighter` | Syntax-highlighted code blocks in chat |
| `mermaid` ^11 | Renders LLM-generated `mermaid` blocks as SVG |
| `reactflow` ^11 | Interactive node graph for codebase canvas |
| `framer-motion` ^12 | Animations (landing page, hero) |
| `lucide-react` | Icons throughout the app |
| `sonner` | Toast notifications |
| `three` + `@react-three/fiber` | 3D particle canvas on landing page |

---

## 3. Folder Structure

```
src/
├── app/
│   ├── page.tsx                      # / — Landing page
│   ├── layout.tsx                    # Root layout — fonts, providers
│   ├── globals.css
│   ├── analyze/
│   │   └── page.tsx                  # /analyze — repo indexing
│   └── [namespace]/
│       └── chat/
│           └── page.tsx              # /[namespace]/chat — main app
│
├── components/
│   ├── ui/                           # shadcn/ui primitives
│   ├── chat/
│   │   ├── ChatWindow.tsx            # Scrollable message list + empty state
│   │   ├── ChatMessage.tsx           # Single message — markdown/mermaid aware
│   │   ├── ChatInput.tsx             # Input bar
│   │   └── ModeSelector.tsx          # chat / overview / flow / diagram tabs
│   ├── diagrams/
│   │   ├── MermaidRenderer.tsx       # Renders mermaid blocks as SVG
│   │   └── CodebaseGraph.tsx         # React Flow canvas
│   ├── repository/
│   │   ├── RepoIndexForm.tsx         # GitHub URL + ZIP upload + SSE progress UI
│   │   └── AnalyzeDashboard.tsx      # Analyze page shell
│   ├── HeroSection.tsx               # Landing hero with animated dashboard
│   ├── FeatureCards.tsx
│   └── HowItWorks.tsx
│
├── effects/
│   └── HeroNodeGraph.tsx             # Three.js particle field
│
├── layout/
│   ├── Navbar.tsx                    # Features / Docs / GitHub / Get Started
│   ├── Footer.tsx
│   ├── ChatSidebar.tsx               # Repo card, views, stats, commit summary, clear
│   ├── AppShell.tsx                  # Sidebar + chat or canvas
│   └── NavbarClient.tsx              # Dynamic import wrapper (SSR-safe)
│
├── lib/
│   ├── api.ts                        # Axios client — all API methods
│   └── utils.ts                      # cn() helper
│
├── store/
│   ├── repo-store.ts                 # activeRepo, repoSummary, history (persisted)
│   ├── chat-store.ts                 # messages, isStreaming, activeMode
│   └── ui-store.ts                   # isSidebarOpen, activeView
│
└── types/
    └── index.ts                      # All TypeScript interfaces
```

---

## 4. Backend API Contract

Base URL: `http://localhost:5000/api/v1` (configured via `NEXT_PUBLIC_API_URL`)

### POST `/repos/analyze/stream` — Index GitHub repo (SSE)
```json
Request:  { "repoUrl": "https://github.com/user/repo", "branch": "main" }
SSE events:
  progress → { "step": "chunk", "label": "AST parsing", "detail": "45/120 files", "pct": 38 }
  done     → { "repository": { ...IndexedRepository } }
  error    → { "message": "Unable to clone..." }
```

### POST `/repos/upload/stream` — Index ZIP (SSE, multipart)
```
Request: multipart/form-data, field: zipFile (.zip, max 200MB)
SSE events: same shape as above
```

### POST `/repos/:namespace/chat`
```json
Request:  { "query": "How does auth work?", "mode": "chat" }
Response: { "data": { "answer": "## Auth Flow\n...", "sources": [...] } }
```
**Modes:** `chat` · `overview` · `flow` · `diagram`

### GET `/repos/:namespace/summary`
```json
Response: { "data": { "repoId", "repoName", "pages", "components", "hooks", "services", "apiRoutes", "stats" } }
```

### GET `/repos/:namespace/commits/summary`
```json
Response: { "data": { "answer": "## Recent Development Summary\n...", "commits": [...] } }
```
Returns 404 if no commits stored (ZIP upload).

### GET `/repos`
```json
Response: { "data": [ ...RepoSummary[] ] }
```

---

## 5. TypeScript Types

`src/types/index.ts` — current full shape:

```typescript
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface IndexedRepository {
  repoId: string;
  namespace: string;
  owner: string;
  repoName: string;
  sourceUrl: string;
  branch?: string;
  createdAt: string;
  indexing: {
    scannedFiles: number;
    indexedChunks: number;
    skippedFiles: number;
  };
}

export interface RepoSummary {
  repoId: string;
  repoName: string;
  namespace: string;
  pages: string[];
  components: string[];
  hooks: string[];
  services: string[];
  apiRoutes: string[];
  stats: { files: number; components: number; functions: number };
}

export type RepositorySummary = RepoSummary; // alias for list endpoint

export type ChatMode = "chat" | "overview" | "flow" | "diagram";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: ChatMode;
  chunksUsed?: number;
  timestamp: Date;
}

export interface ChatResponse {
  answer: string;
  mode?: ChatMode;
  chunksUsed?: number;
  sources?: Array<{ filePath: string; symbolName: string; score: number }>;
}

export type GraphNodeType = "page" | "component" | "hook" | "service" | "apiRoute";

export interface GraphNodeData {
  label: string;
  filePath: string;
  type: GraphNodeType;
}
```

---

## 6. Axios API Client

`src/lib/api.ts`:

```typescript
import axios from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

export const api = {
  indexRepository: (repoUrl: string, branch?: string) =>
    client.post("/repos/analyze", { repoUrl, branch }),

  getRepoSummary: (namespace: string) =>
    client.get(`/repos/${namespace}/summary`),

  getCommitSummary: (namespace: string) =>
    client.get(`/repos/${namespace}/commits/summary`),

  chat: (namespace: string, query: string, mode: ChatMode) =>
    client.post(`/repos/${namespace}/chat`, { query, mode }),
};
```

SSE streams (indexing progress) are opened directly with the native `fetch()` API in `RepoIndexForm` — Axios does not support streaming responses.

---

## 7. Zustand Stores — Split Design

The store is split into three focused files instead of one monolithic store. This keeps each concern isolated and avoids unnecessary re-renders.

### `repo-store.ts` — persisted to localStorage

```typescript
interface RepoState {
  activeRepo: IndexedRepository | null;
  repoSummary: RepoSummary | null;
  isIndexing: boolean;
  repoHistory: IndexedRepository[];   // last 20 indexed repos

  setActiveRepo, setRepoSummary, setIndexing,
  addToHistory, removeFromHistory, clearRepo
}
```

`activeRepo` and `repoHistory` are persisted via Zustand's `persist` middleware (key: `codeatlas-repo-store`). When the user refreshes, their active repo reconnects automatically without re-indexing.

### `chat-store.ts` — not persisted (resets on refresh)

```typescript
interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  activeMode: ChatMode;

  addMessage, clearMessages, setStreaming, setMode
}
```

Chat history intentionally resets on refresh — keeping stale conversations across sessions causes confusion.

### `ui-store.ts` — not persisted

```typescript
interface UiState {
  isSidebarOpen: boolean;
  activeView: 'chat' | 'canvas';

  setSidebarOpen, setActiveView
}
```

**Why split?** A single store means every component that reads any field re-renders when any field changes. With three stores, a component that only reads `activeView` won't re-render when a new chat message arrives.

---

## 8. Pages & Routing

### `/` — Landing Page
Hero section with animated interactive dashboard preview, feature cards, how-it-works stepper, footer. Navbar links: Features (anchor), Docs (→ GitHub architecture guide), GitHub (→ repo), Get Started (→ `/analyze`).

### `/analyze` — Repository Indexer
Single-purpose page with `RepoIndexForm`. Two tabs: GitHub URL and ZIP upload. After successful indexing, stores result in `repo-store` and navigates to `/{namespace}/chat`.

### `/[namespace]/chat` — Main App
The `namespace` URL param IS the Pinecone namespace (UUID). Users can bookmark this URL to return to any indexed repo. `AppShell` renders `ChatSidebar` + either `ChatWindow` or `CodebaseGraph` based on `activeView`.

---

## 9. Repository Indexing — GitHub + ZIP

`src/components/repository/RepoIndexForm.tsx`

Two input modes on a tab toggle:

**GitHub URL tab:**
- `react-hook-form` + Zod validate the URL (`github.com` required)
- Optional branch field (defaults to `main`)
- Submits to `POST /repos/analyze/stream` via native `fetch()`

**ZIP Upload tab:**
- Drag-and-drop zone + click-to-browse
- Accepts `.zip` only, max 200 MB enforced by backend
- Submits to `POST /repos/upload/stream` via `FormData`

**SSE Progress UI:**
Both paths share the same progress renderer. Steps defined:
```
clone → scan → chunk → embed → upsert → summary
```

Each step shows: icon (idle / spinner / check), label, detail text, and percentage. The overall progress bar animates via the `pct` field from the SSE stream.

```typescript
// SSE reader — shared by both GitHub and ZIP submit handlers
async function readSSEStream(res, onProgress, onDone, onError) {
  const reader = res.body.getReader();
  // reads event: / data: pairs, parses JSON, dispatches to handlers
}
```

On `done` event: stores repo in `repo-store`, adds to history, redirects to `/{namespace}/chat` after 600ms.

---

## 10. The Chat Interface — 4 Mode Rendering

### ChatMessage — Rendering Strategy

`src/components/chat/ChatMessage.tsx` uses `react-markdown` with custom component overrides:

| Element | Rendering |
|---|---|
| `h1`–`h4` | Custom sizes: `text-base` → `text-[13px]`, color `#e3e2de` → `#b5cdac` |
| `p`, `ul`, `ol` | `text-[14px] text-[#d4ddc8]` — bright enough to read on dark background |
| `strong` | `text-[#e3e2de]` |
| `code` (inline) | `bg-white/[0.06] text-[#CCD67F]` |
| `code` (block) | `SyntaxHighlighter` with `oneDark` theme |
| `code` (mermaid) | Intercepted → `<MermaidRenderer>` renders SVG inline |
| `blockquote` | Left border `#CCD67F/40`, muted italic |

User messages render as a simple bubble: `bg-white/[0.06] border border-white/[0.08]`.

Overview mode messages remove the `max-w` cap and go full-width for the architecture report.

### Mode Selector

Four modes map to icons and descriptions:
- `chat` → MessageSquare — "Q&A about the codebase"
- `overview` → LayoutDashboard — "Full architecture report"
- `flow` → GitBranch — "Trace execution paths"
- `diagram` → Share2 — "Generate architecture diagram"

### Chat Flow

```typescript
// ChatInput submits:
addMessage({ role: "user", content: query });
setStreaming(true);
const { data } = await api.chat(namespace, query, activeMode);
addMessage({ role: "assistant", content: data.data.answer });
setStreaming(false);
```

Streaming indicator shows three bouncing dots + "Analyzing codebase…" while waiting.

---

## 11. Commit Summary Feature

**Button location:** ChatSidebar → "Actions" section, below the Indexing stats.

**Behavior:**
1. User clicks "Commit Summary"
2. `setActiveView("chat")` — switches to chat view so the response is visible
3. `GET /repos/:namespace/commits/summary` is called
4. LLM response injected as an assistant message via `addMessage`
5. Button shows "Loading..." while in flight, disabled to prevent double-clicks
6. On error (404 = ZIP upload, no commits): injects a fallback message

**What the response looks like:**
```markdown
## Recent Development Summary

**Features:**
- Added image optimization and format conversion
- Implemented ZIP upload support

**Fixes:**
- Fixed JWT token expiry handling
- Resolved Cloudinary upload race condition

**Refactors:**
- Cleaned up auth middleware
- Split Zustand store into focused slices
```

**Only works for GitHub-cloned repos.** ZIP uploads have no git history — the backend returns a 404 which the frontend handles gracefully.

---

## 12. Mermaid.js Renderer

`src/components/diagrams/MermaidRenderer.tsx`

The `diagram` chat mode returns a response containing a ` ```mermaid ``` ` code block. The `ChatMessage` component's custom `code` renderer passes that content here:

```tsx
"use client";
import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, theme: "dark" });

export default function MermaidRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid
      .render(`mermaid-${uniqueId}`, chart)
      .then(({ svg }) => { containerRef.current.innerHTML = svg; })
      .catch(() => { containerRef.current.innerHTML = `<pre>${chart}</pre>`; });
  }, [chart]);

  return <div ref={containerRef} className="overflow-x-auto rounded-xl ..." />;
}
```

**Must be `"use client"`** — Mermaid uses browser DOM APIs, cannot run server-side.

---

## 13. React Flow — Codebase Graph Canvas

`src/components/diagrams/CodebaseGraph.tsx`

Activated when `activeView === "canvas"`. The `repoSummary` JSON (fetched on chat page load) is mapped into React Flow nodes in a column layout:

```
Pages       x=0      yellow-green border
Components  x=300    amber border
Hooks       x=600    muted border
Services    x=900    cream border
API Routes  x=1200   yellow-green border
```

Each category stacks vertically (`y = index × 80`). Node label = filename extracted from the full path.

No edges are drawn currently — edges would require cross-referencing `imports[]` and `componentDependencies[]` from Pinecone metadata, which is a future enhancement.

---

## 14. Chat Sidebar

`src/layout/ChatSidebar.tsx`

Sections top to bottom:

1. **Brand** — "CodeAtlas" wordmark
2. **Repo card** — repo name + owner, `FolderGit2` icon
3. **Views** section — Chat and Codebase Canvas toggle buttons
4. **Indexing** section — Scanned Files and Indexed Chunks stats
5. **Actions** section — "Commit Summary" button
6. **Footer** — "Clear Context" button (clears repo + messages, redirects to `/analyze`)

The sidebar is hidden on mobile (`hidden md:flex`).

**Commit Summary button** calls `handleCommitSummary()` which:
- Sets `activeView` to `"chat"` (so the injected message is visible)
- Calls `api.getCommitSummary(namespace)`
- Injects the LLM answer as an assistant `ChatMessage`

---

## 15. UI Design System

### Color Tokens

```
Background:    #0c0c0b  (near black)
Surface:       #0a0a0a / white/[0.03]
Border:        white/[0.04] – white/[0.08]
Text Primary:  #e3e2de  (warm off-white)
Text Muted:    #8e9289 / #6b6e66
Text Faint:    #4a4d46
Accent:        #CCD67F  (yellow-green — buttons, active states, icons)
Accent Alt:    #98b090  (muted green — done states, secondary)
```

### Typography
- Display headings: `font-[family-name:var(--font-display)]`
- Body / UI: `font-[family-name:var(--font-inter)]`
- Mono: `font-mono`

### Common Patterns

**Sidebar nav button (active):**
```
bg-white/[0.05] text-[#CCD67F] border border-white/[0.06] rounded-lg
```

**Sidebar nav button (inactive):**
```
text-[#8e9289] hover:text-[#e3e2de] hover:bg-white/[0.03] border border-transparent
```

**Stat row:**
```
bg-white/[0.02] border border-white/[0.04] rounded-lg
```

**Input fields:**
```
bg-white/5 border-white/10 text-[#e3e2de] placeholder:text-[#8e9289]
focus-visible:ring-[#98b090]/50
```

**Primary button:**
```
bg-[#98b090] text-[#0a0a0a] hover:bg-[#b5cdac] rounded-xl font-semibold
```

**Chat user bubble:**
```
bg-white/[0.06] border border-white/[0.08] rounded-2xl rounded-tr-md
```

**Chat assistant text:** `text-[#d4ddc8]` — bright enough to read clearly on `#0a0a0a` background
