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

// Matches backend RepositorySummary exactly — used for both summary endpoint and repo list
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

// Alias for the repo list endpoint (same shape)
export type RepositorySummary = RepoSummary;

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
  mode?: ChatMode;
  chunksUsed?: number;
  sources?: Array<{ filePath: string; symbolName: string; score: number }>;
}

// ── React Flow ────────────────────────────────────────────────────────────────
export type GraphNodeType = "page" | "component" | "hook" | "service" | "apiRoute";

export interface GraphNodeData {
  label: string;
  filePath: string;
  type: GraphNodeType;
}
