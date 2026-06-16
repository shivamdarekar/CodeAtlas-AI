"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRepoStore } from "@/store/repo-store";
import { useUiStore } from "@/store/ui-store";
import { ChatSidebar } from "./ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import CodebaseGraph from "@/components/diagrams/CodebaseGraph";
import { api } from "@/lib/api";
import { toast } from "sonner";

export function AppShell({ namespace }: { namespace: string }) {
  const router = useRouter();
  const { activeRepo, repoSummary, setRepoSummary } = useRepoStore();
  const { activeView } = useUiStore();

  useEffect(() => {
    // If we land here but there's no active repo in Zustand (e.g. they opened a link directly),
    // ideally we'd fetch repo details from API. For now, if no repo, redirect to analyze.
    if (!activeRepo || activeRepo.namespace !== namespace) {
      toast.error("Repository context not found. Please analyze again.");
      router.push("/analyze");
      return;
    }

    // Fetch the summary for the graph view
    if (!repoSummary && activeRepo) {
      api.getRepoSummary(namespace).then((res) => {
        if (res.data.statusCode === 200 && res.data.data) {
          setRepoSummary(res.data.data);
        }
      }).catch(() => {
        // Silently fail or log, overview might just be empty
      });
    }
  }, [namespace, activeRepo, repoSummary, router, setRepoSummary]);

  if (!activeRepo) return null; // Wait for redirect

  return (
    <div className="flex h-screen bg-[#0C0A09] text-[#F3E4C9] overflow-hidden font-sans">
      <ChatSidebar />
      
      <div className="flex-1 flex flex-col relative h-full">
        {activeView === "chat" ? (
          <>
            <ChatWindow />
            <div className="shrink-0 bg-gradient-to-t from-[#0C0A09] to-transparent pt-4 pb-2 px-2 md:px-0 z-10">
              <ChatInput />
            </div>
          </>
        ) : (
          <div className="flex-1 w-full h-full">
            {repoSummary ? (
              <CodebaseGraph summary={repoSummary} />
            ) : (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-[#A77F60] flex flex-col items-center">
                  <div className="w-8 h-8 border-4 border-[#8A5F41]/30 border-t-[#CCD67F] rounded-full animate-spin mb-4"></div>
                  Loading Codebase Canvas...
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
