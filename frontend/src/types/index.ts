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

// ── Repository Summary (from /api/v1/repos) ──────────────────────────────────
export interface RepositorySummary {
  repoId: string;
  repoName: string;
  namespace: string;
  pages: string[];
  components: string[];
  services: string[];
  hooks: string[];
  apiRoutes: string[];
  stats: {
    files: number;
    components: number;
    functions: number;
  };
}
