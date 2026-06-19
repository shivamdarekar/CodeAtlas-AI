"use client";

import { useRouter } from "next/navigation";
import { useRepoStore } from "@/store/repo-store";
import { useChatStore } from "@/store/chat-store";
import type { IndexedRepository } from "@/types";
import {
  FolderGit2,
  ArrowUpRight,
  Trash2,
  Clock,
  FileCode2,
  Boxes,
  Database,
} from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function RepoHistoryCard({
  repo,
  isActive,
  onOpen,
  onRemove,
}: {
  repo: IndexedRepository;
  isActive: boolean;
  onOpen: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`group relative flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.03]
        ${isActive
          ? "border-[#CCD67F]/30 bg-[#CCD67F]/[0.03]"
          : "border-white/[0.06] bg-white/[0.02]"
        }`}
      onClick={onOpen}
    >
      {/* Active badge */}
      {isActive && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#CCD67F]/10 text-[#CCD67F] border border-[#CCD67F]/20">
          Active
        </span>
      )}

      {/* Repo name + owner */}
      <div className="flex items-start gap-2.5 pr-12">
        <FolderGit2 className="w-4 h-4 text-[#CCD67F]/60 shrink-0 mt-0.5" strokeWidth={1.5} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#e3e2de] truncate">{repo.repoName}</p>
          <p className="text-xs text-[#4a4d46] truncate">{repo.owner}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px] text-[#6b6e66]">
        <span className="flex items-center gap-1">
          <FileCode2 className="w-3 h-3" strokeWidth={1.5} />
          {repo.indexing.scannedFiles.toLocaleString()} files
        </span>
        <span className="flex items-center gap-1">
          <Boxes className="w-3 h-3" strokeWidth={1.5} />
          {repo.indexing.indexedChunks.toLocaleString()} chunks
        </span>
        {repo.branch && (
          <span className="font-mono text-[#4a4d46]">{repo.branch}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 text-[11px] text-[#4a4d46]">
          <Clock className="w-3 h-3" strokeWidth={1.5} />
          {timeAgo(repo.createdAt)}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-1 rounded-md text-[#4a4d46] hover:text-red-400 hover:bg-red-950/20 transition-colors"
            title="Remove from history"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            className="flex items-center gap-1 text-[11px] text-[#98b090] hover:text-[#b5cdac] transition-colors"
          >
            Open <ArrowUpRight className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnalyzeDashboard() {
  const router = useRouter();
  const { activeRepo, setActiveRepo, repoHistory, removeFromHistory } = useRepoStore();
  const { clearMessages } = useChatStore();

  const handleOpen = (repo: IndexedRepository) => {
    setActiveRepo(repo);
    clearMessages();
    router.push(`/${repo.namespace}/chat`);
  };

  if (repoHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 w-full">
        <Database className="w-8 h-8 text-[#4a4d46]" strokeWidth={1.5} />
        <p className="text-sm text-[#6b6e66] text-center max-w-xs">
          Repositories you index will appear here. Your history is stored locally in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#e3e2de]">Recent Repositories</h3>
          <p className="text-xs text-[#4a4d46] mt-0.5">
            {repoHistory.length} {repoHistory.length === 1 ? "repository" : "repositories"} · stored locally in your browser
          </p>
        </div>
      </div>

      {/* History grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {repoHistory.map((repo) => (
          <RepoHistoryCard
            key={repo.namespace}
            repo={repo}
            isActive={activeRepo?.namespace === repo.namespace}
            onOpen={() => handleOpen(repo)}
            onRemove={() => removeFromHistory(repo.namespace)}
          />
        ))}
      </div>
    </div>
  );
}
