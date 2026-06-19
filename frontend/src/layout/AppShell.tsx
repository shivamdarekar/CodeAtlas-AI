"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRepoStore } from "@/store/repo-store";
import { useUiStore } from "@/store/ui-store";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput, type ChatInputHandle } from "@/components/chat/ChatInput";
import CodebaseGraph from "@/components/diagrams/CodebaseGraph";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GitBranch } from "lucide-react";

export function AppShell({ namespace }: { namespace: string }) {
  const router = useRouter();
  const { activeRepo, repoSummary, setRepoSummary, _hasHydrated } = useRepoStore();
  const { activeView } = useUiStore();
  const chatInputRef = useRef<ChatInputHandle>(null);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!activeRepo || activeRepo.namespace !== namespace) {
      toast.error("Repository context not found. Please analyze again.");
      router.push("/analyze");
      return;
    }

    if (!repoSummary && activeRepo) {
      api.getRepoSummary(namespace).then((res) => {
        if (res.data.statusCode === 200 && res.data.data) {
          setRepoSummary(res.data.data);
        }
      }).catch((err) => {
        console.warn("[AppShell] Could not load repo summary:", err?.response?.data?.message ?? err.message);
      });
    }
  }, [namespace, activeRepo, repoSummary, router, setRepoSummary, _hasHydrated]);

  if (!_hasHydrated) return null;

  if (!activeRepo) return null;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-[#e3e2de] overflow-hidden font-sans">
      <ChatSidebar />

      <div className="flex-1 flex flex-col relative h-full">
        {/* Top bar */}
        <div className="shrink-0 h-12 flex items-center justify-between px-5 border-b border-white/[0.04] bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-xs text-[#6b6e66]">
            <GitBranch className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[#8e9289] font-medium">{activeRepo.owner}/{activeRepo.repoName}</span>
            {activeRepo.branch && (
              <>
                <span className="text-[#4a4d46]">/</span>
                <span className="text-[#6b6e66] font-mono text-[11px]">{activeRepo.branch}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#4a4d46] font-mono">
              {activeRepo.indexing.indexedChunks.toLocaleString()} chunks indexed
            </span>
          </div>
        </div>

        {/* Main content */}
        {activeView === "chat" ? (
          <>
            <ChatWindow onSuggestion={(text) => chatInputRef.current?.fill(text)} />
            <div className="shrink-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-2 z-10">
              <ChatInput ref={chatInputRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 w-full h-full">
            {repoSummary ? (
              <CodebaseGraph summary={repoSummary} />
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-[#6b6e66] flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-white/[0.06] border-t-[#CCD67F] rounded-full animate-spin" />
                  <span className="text-xs">Loading Codebase Canvas…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
