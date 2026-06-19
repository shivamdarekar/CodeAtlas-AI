import axios from "axios";
import type { ApiResponse, IndexedRepository, RepoSummary, ChatMode, ChatResponse } from "@/types";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1",
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

export const api = {
  // Index a new repository
  indexRepository: (repoUrl: string, branch?: string) =>
    client.post<ApiResponse<IndexedRepository>>("/repos/analyze", { repoUrl, branch }),

  // Get the summary JSON for React Flow canvas
  getRepoSummary: (namespace: string) =>
    client.get<ApiResponse<RepoSummary>>(`/repos/${namespace}/summary`),

  // Get LLM-generated commit summary
  getCommitSummary: (namespace: string) =>
    client.get<ApiResponse<{ answer: string; commits: Array<{ hash: string; message: string; author: string; date: string }> }>>(`/repos/${namespace}/commits/summary`),

  // Send a chat message
  chat: (namespace: string, query: string, mode: ChatMode) =>
    client.post<ApiResponse<ChatResponse>>(`/repos/${namespace}/chat`, { query, mode }),
};
