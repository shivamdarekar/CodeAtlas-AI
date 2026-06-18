"use client";
import { FolderGit2, Trash2, Layout, MessageSquare, FileCode2, Boxes } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRepoStore } from "@/store/repo-store";
import { useUiStore } from "@/store/ui-store";
import { useChatStore } from "@/store/chat-store";

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

  const views = [
    { id: "chat" as const, label: "Chat", icon: MessageSquare },
    { id: "canvas" as const, label: "Codebase Canvas", icon: Layout },
  ];

  const stats = [
    { label: "Scanned Files", value: activeRepo.indexing.scannedFiles, icon: FileCode2 },
    { label: "Indexed Chunks", value: activeRepo.indexing.indexedChunks, icon: Boxes },
  ];

  return (
    <div className="w-[280px] h-screen border-r border-white/[0.04] bg-[#0c0c0b] flex flex-col hidden md:flex shrink-0">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <h2 className="text-lg font-[family-name:var(--font-display)] font-semibold text-[#e3e2de] tracking-tight">
          CodeAtlas
        </h2>
      </div>

      {/* Repo card */}
      <div className="px-4 pb-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5">
          <div className="flex items-center gap-2.5 mb-1.5">
            <FolderGit2 className="w-4 h-4 text-[#CCD67F] shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-medium text-[#e3e2de] truncate">
              {activeRepo.repoName}
            </span>
          </div>
          <div className="text-xs text-[#6b6e66] truncate pl-[26px]">
            {activeRepo.owner}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 flex-1">
        <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#4a4d46] mb-2 px-1">
          Views
        </div>
        <div className="flex flex-col gap-0.5">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 active:scale-[0.98] text-left
                  ${isActive
                    ? "bg-white/[0.05] text-[#CCD67F] border border-white/[0.06]"
                    : "text-[#8e9289] hover:text-[#e3e2de] hover:bg-white/[0.03] border border-transparent"
                  }
                `}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                {view.label}
              </button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-6">
          <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#4a4d46] mb-2 px-1">
            Indexing
          </div>
          <div className="flex flex-col gap-2">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="flex items-center gap-2 text-xs text-[#6b6e66]">
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                    {stat.label}
                  </div>
                  <span className="text-xs font-medium text-[#e3e2de] tabular-nums">
                    {stat.value.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Clear action */}
      <div className="p-4 border-t border-white/[0.04]">
        <button
          onClick={handleClear}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#6b6e66] hover:text-red-400 hover:bg-red-950/20 transition-all duration-150 active:scale-[0.98]"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
          Clear Context
        </button>
      </div>
    </div>
  );
}
