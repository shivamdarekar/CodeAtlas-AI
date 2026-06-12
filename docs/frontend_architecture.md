# CodeAtlas — Frontend Implementation Guide
*Complete reference for building the frontend against the real backend.*

---

## Table of Contents
1. [What Already Exists](#1-what-already-exists)
2. [Full Tech Stack](#2-full-tech-stack)
3. [Final Folder Structure](#3-final-folder-structure)
4. [Backend API Contract](#4-backend-api-contract)
5. [TypeScript Types](#5-typescript-types)
6. [Axios API Client](#6-axios-api-client)
7. [Zustand Store — Complete Design](#7-zustand-store--complete-design)
8. [Pages & Routing](#8-pages--routing)
9. [The Chat Interface — 4 Mode Rendering](#9-the-chat-interface--4-mode-rendering)
10. [Mermaid.js Renderer](#10-mermaidjs-renderer)
11. [React Flow — Codebase Graph Canvas](#11-react-flow--codebase-graph-canvas)
12. [UI Design System](#12-ui-design-system)
13. [Component Build Order](#13-component-build-order)

---

## 1. What Already Exists

The landing page is fully built. Do not touch these files:

| File | Status |
|---|---|
| `src/app/page.tsx` | ✅ Done — Landing page shell |
| `src/app/layout.tsx` | ✅ Done — Fonts, Toaster, TooltipProvider |
| `src/components/HeroSection.tsx` | ✅ Done — Hero with 3D particle canvas |
| `src/components/FeatureCards.tsx` | ✅ Done — Bento grid feature cards |
| `src/components/HowItWorks.tsx` | ✅ Done — Interactive terminal stepper |
| `src/layout/Navbar.tsx` | ✅ Done — Floating pill navbar |
| `src/layout/Footer.tsx` | ✅ Done |
| `src/effects/HeroNodeGraph.tsx` | ✅ Done — Three.js particle field |
| `src/store/use-app-store.ts` | ⚠️ Partial — needs expanding |
| `src/lib/api.ts` | ❌ Empty — needs full implementation |
| `src/types/index.ts` | ❌ Empty — needs all types |

**All shadcn/ui primitives are installed** in `src/components/ui/`:
`button`, `input`, `textarea`, `badge`, `card`, `dialog`, `sheet`, `tabs`,
`select`, `scroll-area`, `skeleton`, `sonner`, `tooltip`, `separator`, `avatar`, `dropdown-menu`

---

## 2. Full Tech Stack

| Package | Version | Purpose |
|---|---|---|
| `next` | ^16 | App Router, file-based routing |
| `react` | ^19 | UI framework |
| `typescript` | ^6 | Type safety |
| `tailwindcss` | ^4 | Utility CSS |
| `zustand` | ^5 | Global state (no boilerplate) |
| `axios` | ^1.17 | HTTP client with interceptors |
| `react-markdown` | ^10 | Render LLM markdown responses |
| `react-syntax-highlighter` | ^16 | Code block highlighting in chat |
| `mermaid` | ^11 | Render LLM-generated diagrams as SVG |
| `reactflow` | ^11 | Interactive node graph for codebase canvas |
| `framer-motion` | ^12 | Animations (already used in landing) |
| `@react-three/fiber` | ^9 | 3D canvas (used in HeroNodeGraph) |
| `lucide-react` | ^1.17 | Icons |
| `sonner` | ^2 | Toast notifications |
| `react-hook-form` | ^7 | Form handling for repo URL input |
| `zod` | ^4 | Form validation schemas |

---

## 3. Final Folder Structure

```
src/
├── app/
│   ├── page.tsx                      # / — Landing page (done)
│   ├── layout.tsx                    # Root layout (done)
│   ├── globals.css                   # Global styles (done)
│   └── [namespace]/
│       └── chat/
│           └── page.tsx              # /[namespace]/chat — Main chat app
│
├── components/
│   ├── ui/                           # shadcn/ui primitives (done)
│   ├── chat/
│   │   ├── ChatWindow.tsx            # Scrollable message list
│   │   ├── ChatMessage.tsx           # Single message bubble (markdown/mermaid aware)
│   │   ├── ChatInput.tsx             # Input bar with mode selector
│   │   └── ModeSelector.tsx          # Tabs: chat / overview / flow / diagram
│   ├── diagrams/
│   │   ├── MermaidRenderer.tsx       # Renders mermaid code blocks as SVG
│   │   └── CodebaseGraph.tsx         # React Flow canvas
│   ├── repository/
│   │   ├── RepoIndexForm.tsx         # GitHub URL form on landing / analyze page
│   │   └── RepoStatusCard.tsx        # Shows indexing progress
│   ├── HeroSection.tsx               # (done)
│   ├── FeatureCards.tsx              # (done)
│   └── HowItWorks.tsx                # (done)
│
├── effects/
│   └── HeroNodeGraph.tsx             # (done)
│
├── layout/
│   ├── Navbar.tsx                    # (done)
│   ├── Footer.tsx                    # (done)
│   ├── ChatSidebar.tsx               # Sidebar: repo info, mode, clear chat
│   └── AppShell.tsx                  # Layout wrapper for chat page
│
├── lib/
│   ├── api.ts                        # Axios client + all API calls
│   └── utils.ts                      # cn() helper (done)
│
├── store/
│   └── use-app-store.ts              # Zustand global state (expand existing)
│
└── types/
    └── index.ts                      # All TypeScript interfaces
```

---

## 4. Backend API Contract

The backend runs on `http://localhost:5000`. These are the exact real endpoints.

### POST `/api/v1/repo/analyze`
Index a GitHub repository.

**Request:**
```json
{ "repoUrl": "https://github.com/user/repo", "branch": "main" }
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Repository indexed successfully.",
  "data": {
    "repoId": "b45c9245-f22e-4755-b1a8-c9903f3f041b",
    "namespace": "b45c9245-f22e-4755-b1a8-c9903f3f041b",
    "owner": "user",
    "repoName": "To-do-list",
    "sourceUrl": "https://github.com/user/repo",
    "branch": "main",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "indexing": {
      "repoId": "...",
      "namespace": "...",
      "scannedFiles": 12,
      "indexedChunks": 87,
      "skippedFiles": 2
    }
  }
}
```

**The `namespace` field is what you store in Zustand.** Every subsequent chat call uses it.

---

### POST `/api/v1/repo/:namespace/chat`
Send a query to the indexed repo.

**Request:**
```json
{
  "query": "How does login work?",
  "mode": "chat"
}
```

**`mode` options:** `"chat"` | `"overview"` | `"flow"` | `"diagram"`

**Response:**
```json
{
  "statusCode": 200,
  "message": "Chat response generated successfully.",
  "data": {
    "answer": "## Authentication Flow\n\nThe login uses...",
    "mode": "chat",
    "chunksUsed": 4
  }
}
```

The `answer` field is always a **markdown string**. For `diagram` mode it will contain a ` ```mermaid ``` ` code block.

---

### GET `/api/v1/repo/:namespace/summary`
Get the repo overview JSON (used to build the React Flow graph).

**Response:**
```json
{
  "data": {
    "repoId": "...",
    "repoName": "To-do-list",
    "pages": ["app/page.tsx"],
    "components": ["components/Button.tsx", "components/TaskList.tsx"],
    "hooks": ["hooks/useTasks.ts"],
    "services": ["services/api.ts"],
    "apiRoutes": ["app/api/tasks/route.ts"],
    "stats": { "totalFiles": 12, "totalChunks": 87 }
  }
}
```

This JSON feeds directly into the React Flow canvas.

---

## 5. TypeScript Types

Fill `src/types/index.ts` with these:

```typescript
// ── API Wrapper ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// ── Repository ───────────────────────────────────────────────────────────────
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
  pages: string[];
  components: string[];
  hooks: string[];
  services: string[];
  apiRoutes: string[];
  stats: { totalFiles: number; totalChunks: number };
}

// ── Chat ─────────────────────────────────────────────────────────────────────
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
  mode: ChatMode;
  chunksUsed: number;
}

// ── React Flow ────────────────────────────────────────────────────────────────
export type GraphNodeType = "page" | "component" | "hook" | "service" | "apiRoute";

export interface GraphNodeData {
  label: string;
  filePath: string;
  type: GraphNodeType;
}
```

---

## 6. Axios API Client

`src/lib/api.ts` — complete implementation:

```typescript
import axios from "axios";
import type { ApiResponse, IndexedRepository, RepoSummary, ChatMode, ChatResponse } from "@/types";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 120_000, // indexing can take up to 2 minutes
});

export const api = {
  // Index a new repository
  indexRepository: (repoUrl: string, branch?: string) =>
    client.post<ApiResponse<IndexedRepository>>("/repo/analyze", { repoUrl, branch }),

  // Get the summary JSON for React Flow canvas
  getRepoSummary: (namespace: string) =>
    client.get<ApiResponse<RepoSummary>>(`/repo/${namespace}/summary`),

  // Send a chat message
  chat: (namespace: string, query: string, mode: ChatMode) =>
    client.post<ApiResponse<ChatResponse>>(`/repo/${namespace}/chat`, { query, mode }),
};
```

Add `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` to `.env.local`.

---

## 7. Zustand Store — Complete Design

Expand the existing `src/store/use-app-store.ts`. The current store only has `activeRepoId`, `isSidebarOpen`, and basic chat history. Replace it with the full store:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ChatMode, IndexedRepository, RepoSummary } from "@/types";

interface AppState {
  // ── Active Repository ──────────────────────────────────────────────────────
  activeRepo: IndexedRepository | null;
  repoSummary: RepoSummary | null;
  isIndexing: boolean;

  // ── Chat ───────────────────────────────────────────────────────────────────
  messages: ChatMessage[];
  isStreaming: boolean;       // LLM is generating a response
  activeMode: ChatMode;

  // ── UI ────────────────────────────────────────────────────────────────────
  isSidebarOpen: boolean;
  activeView: "chat" | "canvas"; // toggle between chat and React Flow canvas

  // ── Actions ───────────────────────────────────────────────────────────────
  setActiveRepo: (repo: IndexedRepository) => void;
  setRepoSummary: (summary: RepoSummary) => void;
  setIndexing: (v: boolean) => void;
  clearRepo: () => void;

  addMessage: (msg: Omit<ChatMessage, "id" | "timestamp">) => void;
  clearMessages: () => void;
  setStreaming: (v: boolean) => void;
  setMode: (mode: ChatMode) => void;

  setSidebarOpen: (v: boolean) => void;
  setActiveView: (view: "chat" | "canvas") => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeRepo: null,
      repoSummary: null,
      isIndexing: false,
      messages: [],
      isStreaming: false,
      activeMode: "chat",
      isSidebarOpen: true,
      activeView: "chat",

      setActiveRepo: (repo) => set({ activeRepo: repo }),
      setRepoSummary: (summary) => set({ repoSummary: summary }),
      setIndexing: (v) => set({ isIndexing: v }),
      clearRepo: () => set({ activeRepo: null, repoSummary: null, messages: [] }),

      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { ...msg, id: crypto.randomUUID(), timestamp: new Date() },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      setStreaming: (v) => set({ isStreaming: v }),
      setMode: (mode) => set({ activeMode: mode }),

      setSidebarOpen: (v) => set({ isSidebarOpen: v }),
      setActiveView: (view) => set({ activeView: view }),
    }),
    {
      name: "codeatlas-store",
      // Only persist the active repo so user doesn't lose context on refresh
      partialize: (state) => ({ activeRepo: state.activeRepo }),
    }
  )
);
```

**Why `persist` middleware?** When a user refreshes the page, the `activeRepo` (with its `namespace`) survives. Without this, they'd have to re-index the repo on every page load.

**How to use in components:**
```typescript
// Read
const { activeRepo, messages, activeMode } = useAppStore();

// Write
const { addMessage, setMode, setStreaming } = useAppStore();
setMode("flow");
addMessage({ role: "user", content: "How does auth work?", mode: "flow" });
```

---

## 8. Pages & Routing

### Route: `/` — Landing Page
Already built. The `Analyze repository` button links to `/analyze`.

### Route: `/analyze` — Repository Indexer
A single-purpose page with the `RepoIndexForm`. After successful indexing:
1. Store the result in Zustand: `setActiveRepo(data)`
2. Navigate to `/{namespace}/chat`

```typescript
// app/analyze/page.tsx
"use client";
import { RepoIndexForm } from "@/components/repository/RepoIndexForm";

export default function AnalyzePage() {
  return (
    <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
      <RepoIndexForm />
    </div>
  );
}
```

### Route: `/[namespace]/chat` — Main App
The core application shell. The `namespace` in the URL IS the Pinecone namespace. This means users can bookmark or share a URL to a specific indexed repo.

```typescript
// app/[namespace]/chat/page.tsx
import { AppShell } from "@/layout/AppShell";

export default function ChatPage({ params }: { params: { namespace: string } }) {
  return <AppShell namespace={params.namespace} />;
}
```

`AppShell` renders:
- `ChatSidebar` on the left
- `ChatWindow` or `CodebaseGraph` on the right (based on `activeView`)

---

## 9. The Chat Interface — 4 Mode Rendering

### ChatInput with Mode Selector
The input bar at the bottom has a mode toggle. Map modes to readable labels:

```typescript
const MODE_CONFIG: Record<ChatMode, { label: string; description: string; icon: LucideIcon }> = {
  chat:     { label: "Chat",     description: "Q&A about the codebase",       icon: MessageSquare },
  overview: { label: "Overview", description: "Full architecture report",      icon: LayoutDashboard },
  flow:     { label: "Flow",     description: "Trace execution paths",         icon: GitBranch },
  diagram:  { label: "Diagram",  description: "Generate architecture diagram", icon: Share2 },
};
```

### ChatMessage Rendering Strategy

Each `ChatMessage` component checks the mode and renders differently:

| Mode | Rendering |
|---|---|
| `chat` | `react-markdown` + `react-syntax-highlighter` code blocks |
| `overview` | Same as `chat` but full-width, no max-width cap on the bubble |
| `flow` | `react-markdown` — the LLM naturally uses `→` arrows and numbered steps |
| `diagram` | `react-markdown` with a custom `code` component that intercepts ` ```mermaid ``` ` blocks |

### ChatMessage Component Structure

```tsx
// src/components/chat/ChatMessage.tsx
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import MermaidRenderer from "@/components/diagrams/MermaidRenderer";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#1C1917] border border-[#8A5F41]/30 px-4 py-3 text-sm text-[#F3E4C9]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className={`${message.mode === "overview" ? "w-full" : "max-w-[90%]"} prose prose-invert prose-sm`}>
        <ReactMarkdown
          components={{
            code({ className, children }) {
              const language = /language-(\w+)/.exec(className ?? "")?.[1];

              // Intercept mermaid blocks and render as diagram
              if (language === "mermaid") {
                return <MermaidRenderer chart={String(children)} />;
              }

              return (
                <SyntaxHighlighter style={oneDark} language={language ?? "text"} PreTag="div">
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
```

### Sending a Chat Message (Full Flow)

```typescript
// Inside ChatInput.tsx or the page
async function handleSubmit(query: string) {
  const { activeRepo, activeMode, addMessage, setStreaming } = useAppStore.getState();
  if (!activeRepo) return;

  // 1. Add user message immediately
  addMessage({ role: "user", content: query, mode: activeMode });
  setStreaming(true);

  try {
    const { data } = await api.chat(activeRepo.namespace, query, activeMode);
    // 2. Add assistant message
    addMessage({
      role: "assistant",
      content: data.data.answer,
      mode: data.data.mode,
      chunksUsed: data.data.chunksUsed,
    });
  } catch (err) {
    toast.error("Failed to get a response. Please try again.");
  } finally {
    setStreaming(false);
  }
}
```

---

## 10. Mermaid.js Renderer

`src/components/diagrams/MermaidRenderer.tsx`

The `diagram` mode returns a markdown response containing:
````
```mermaid
graph TD
  A[ImageCompressor] --> B[handleCompress]
  B --> C[/api/image-compress]
```
````

The `ChatMessage` component's custom `code` renderer passes the content to this component:

```tsx
"use client";
import { useEffect, useRef, useId } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    background: "#0C0A09",
    primaryColor: "#1C1917",
    primaryTextColor: "#F3E4C9",
    primaryBorderColor: "#8A5F41",
    lineColor: "#CCD67F",
  },
});

export default function MermaidRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, ""); // mermaid IDs can't have colons

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch(() => {
        // If mermaid fails to parse, show raw text
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre>${chart}</pre>`;
        }
      });
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-[#8A5F41]/20 bg-[#121110] p-4 my-4"
    />
  );
}
```

**Important:** `mermaid` must only run in the browser. The `"use client"` directive handles this. Do not import mermaid in any server component.

---

## 11. React Flow — Codebase Graph Canvas

`src/components/diagrams/CodebaseGraph.tsx`

The canvas view is triggered when the user clicks the "Canvas" button in the sidebar (`setActiveView("canvas")`). It fetches `repoSummary` and maps it into React Flow nodes.

### Node Layout Strategy

Use a column-based layout to prevent all nodes from spawning at position `(0,0)`:

```
Column 0 (x=0):     Pages
Column 1 (x=300):   Components
Column 2 (x=600):   Hooks
Column 3 (x=900):   Services
Column 4 (x=1200):  API Routes
```

### Node Color Scheme (matches brand palette)

| Type | Background | Border |
|---|---|---|
| `page` | `#1C1917` | `#CCD67F` |
| `component` | `#1C1917` | `#8A5F41` |
| `hook` | `#1C1917` | `#A77F60` |
| `service` | `#1C1917` | `#F3E4C9` |
| `apiRoute` | `#1C1917` | `#CCD67F` |

### Full Implementation

```tsx
"use client";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import type { RepoSummary, GraphNodeType } from "@/types";

const COLUMN_X: Record<GraphNodeType, number> = {
  page: 0,
  component: 300,
  hook: 600,
  service: 900,
  apiRoute: 1200,
};

const NODE_STYLES: Record<GraphNodeType, React.CSSProperties> = {
  page:     { background: "#1C1917", border: "1px solid #CCD67F", color: "#F3E4C9", borderRadius: 8, fontSize: 11, padding: "6px 12px" },
  component:{ background: "#1C1917", border: "1px solid #8A5F41", color: "#F3E4C9", borderRadius: 8, fontSize: 11, padding: "6px 12px" },
  hook:     { background: "#1C1917", border: "1px solid #A77F60", color: "#F3E4C9", borderRadius: 8, fontSize: 11, padding: "6px 12px" },
  service:  { background: "#1C1917", border: "1px solid #F3E4C9", color: "#F3E4C9", borderRadius: 8, fontSize: 11, padding: "6px 12px" },
  apiRoute: { background: "#1C1917", border: "1px solid #CCD67F", color: "#CCD67F", borderRadius: 8, fontSize: 11, padding: "6px 12px" },
};

function buildNodes(summary: RepoSummary): Node[] {
  const nodes: Node[] = [];
  const entries: [GraphNodeType, string[]][] = [
    ["page",     summary.pages],
    ["component",summary.components],
    ["hook",     summary.hooks],
    ["service",  summary.services],
    ["apiRoute", summary.apiRoutes],
  ];

  for (const [type, paths] of entries) {
    paths.forEach((filePath, i) => {
      const label = filePath.split("/").pop() ?? filePath;
      nodes.push({
        id: `${type}-${i}`,
        data: { label },
        position: { x: COLUMN_X[type], y: i * 80 },
        style: NODE_STYLES[type],
      });
    });
  }

  return nodes;
}

export default function CodebaseGraph({ summary }: { summary: RepoSummary }) {
  const nodes = buildNodes(summary);
  const edges: Edge[] = []; // Edges can be added later using imports[] metadata

  return (
    <div className="h-full w-full bg-[#0C0A09]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#2C2825" gap={24} size={1} />
        <Controls className="bg-[#1C1917] border-[#8A5F41]/30" />
        <MiniMap
          nodeColor={(n) => {
            const type = n.id.split("-")[0] as GraphNodeType;
            return NODE_STYLES[type]?.border?.toString().replace("1px solid ", "") ?? "#8A5F41";
          }}
          style={{ background: "#121110", border: "1px solid #2C2825" }}
        />
      </ReactFlow>
    </div>
  );
}
```

**Future enhancement**: Use the `imports[]` and `componentDependencies[]` fields from the Pinecone metadata (available in the summary) to draw edges between nodes — showing which components depend on which.

---

## 12. UI Design System

The landing page has established the design language. Carry it into all new pages.

### Color Tokens

```
Background:   #0C0A09  (near black)
Surface:      #1C1917  (dark brown-black)
Border:       #8A5F41  (muted amber)
Text Primary: #F3E4C9  (warm cream)
Text Muted:   #A77F60  (muted amber)
Accent:       #CCD67F  (yellow-green)
```

### Typography
- Display headings: `font-[family-name:var(--font-display)]` (Outfit)
- Body: `font-sans` (Geist)
- Code/mono: `font-mono` (Geist Mono)

### Common Patterns from Landing (reuse these)

**Glass card:**
```
bg-[#1C1917]/40 backdrop-blur-xl border border-[#8A5F41]/20 rounded-2xl
```

**Pill badge:**
```
font-mono text-[11px] uppercase tracking-widest text-[#A77F60] border border-[#8A5F41]/30 rounded-full px-3 py-1
```

**Primary button (already in `<Button>`):**
```
bg-[#CCD67F] text-[#0C0A09] rounded-full hover:bg-[#CCD67F]/90
```

**Input field:**
```
bg-[#121110] border-[#8A5F41]/30 text-[#F3E4C9] placeholder:text-[#A77F60]/50
focus:border-[#CCD67F]/50 focus:ring-0
```

### Chat Bubble Styles

```
User:      bg-[#1C1917] border border-[#8A5F41]/30 rounded-2xl rounded-br-sm
Assistant: no background, full-width prose content
```

---

## 13. Component Build Order

Build in this order to avoid dependency issues:

**Phase 1 — Foundation**
1. `src/types/index.ts` — all interfaces
2. `src/lib/api.ts` — axios client
3. `src/store/use-app-store.ts` — expand Zustand store

**Phase 2 — Repository Indexing**
4. `src/components/repository/RepoIndexForm.tsx` — URL form with react-hook-form + zod
5. `src/app/analyze/page.tsx` — analyze page using the form

**Phase 3 — Chat UI**
6. `src/components/diagrams/MermaidRenderer.tsx` — needed by ChatMessage
7. `src/components/chat/ChatMessage.tsx` — markdown + mermaid aware
8. `src/components/chat/ModeSelector.tsx` — 4 mode tabs
9. `src/components/chat/ChatInput.tsx` — input bar
10. `src/components/chat/ChatWindow.tsx` — scrollable message list

**Phase 4 — Layout**
11. `src/layout/ChatSidebar.tsx` — repo info, mode, view toggle, clear
12. `src/layout/AppShell.tsx` — sidebar + main content area

**Phase 5 — Canvas**
13. `src/components/diagrams/CodebaseGraph.tsx` — React Flow canvas
14. Wire canvas into `AppShell` behind the `activeView === "canvas"` toggle

**Phase 6 — Route**
15. `src/app/[namespace]/chat/page.tsx` — final chat page

---

## Key Implementation Notes

**`reactflow` requires `"use client"`** — it uses browser APIs. Never render it in a server component.

**`mermaid` requires `"use client"`** — same reason. Import it only inside client components.

**The `namespace` is the Pinecone namespace** — it equals `repoId`. It's a UUID like `b45c9245-f22e-4755-b1a8-c9903f3f041b`. Store it from the index response and use it in every chat call.

**The `overview` mode bypasses vector search** — it reads from `summary.json` on disk. It's fast (< 1s). Use it to power the initial repo summary card in the sidebar.

**Indexing takes 30 seconds to 3 minutes** depending on repo size. Show a proper loading state with progress messaging. The API will not respond until fully done — it's not a streaming endpoint.

**The chat API response time** is 2–8 seconds (embedding + Pinecone query + Groq inference). Show a typing indicator (`isStreaming` in Zustand) while waiting.
