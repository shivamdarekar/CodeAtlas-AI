"use client";
import { FolderGit2, Trash2, Layout, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRepoStore } from "@/store/repo-store";
import { useUiStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatSidebar() {
  const router = useRouter();
  const { activeRepo, clearRepo } = useRepoStore();
  const { activeView, setActiveView } = useUiStore();
  const { clearMessages } = useChatStore();

  const handleClear = () => {
    clearRepo();
    clearMessages();
    router.push("/analyze");
  };

  if (!activeRepo) return null;

  return (
    <div className="w-64 h-screen border-r border-[#8A5F41]/20 bg-[#121110] flex flex-col hidden md:flex shrink-0">
      <div className="p-4 border-b border-[#8A5F41]/20">
        <h2 className="text-xl font-[family-name:var(--font-display)] text-[#F3E4C9] mb-4">CodeAtlas</h2>
        
        <div className="bg-[#1C1917] border border-[#8A5F41]/30 p-3 rounded-xl">
          <div className="flex items-center space-x-2 text-[#F3E4C9] mb-1 font-mono text-sm break-all">
            <FolderGit2 className="w-4 h-4 text-[#CCD67F] shrink-0" />
            <span className="truncate">{activeRepo.repoName}</span>
          </div>
          <div className="text-xs text-[#A77F60] truncate">{activeRepo.owner}</div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#A77F60] mb-2">Views</div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start ${activeView === "chat" ? "bg-[#1C1917] text-[#CCD67F]" : "text-[#F3E4C9] hover:text-[#CCD67F] hover:bg-[#1C1917]/50"}`}
                onClick={() => setActiveView("chat")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Interface
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${activeView === "canvas" ? "bg-[#1C1917] text-[#CCD67F]" : "text-[#F3E4C9] hover:text-[#CCD67F] hover:bg-[#1C1917]/50"}`}
                onClick={() => setActiveView("canvas")}
              >
                <Layout className="w-4 h-4 mr-2" />
                Codebase Canvas
              </Button>
            </div>
          </div>
          
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#A77F60] mb-2">Indexing Stats</div>
            <div className="text-sm text-[#F3E4C9] space-y-1 bg-[#1C1917]/50 p-3 rounded-lg border border-[#8A5F41]/10">
              <div className="flex justify-between">
                <span>Scanned Files:</span>
                <span className="text-[#CCD67F]">{activeRepo.indexing.scannedFiles}</span>
              </div>
              <div className="flex justify-between">
                <span>Indexed Chunks:</span>
                <span className="text-[#CCD67F]">{activeRepo.indexing.indexedChunks}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-[#8A5F41]/20">
        <Button 
          variant="ghost" 
          className="w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 justify-start"
          onClick={handleClear}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Context
        </Button>
      </div>
    </div>
  );
}
