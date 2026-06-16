import { MessageSquare, LayoutDashboard, GitBranch, Share2, LucideIcon } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import type { ChatMode } from "@/types";

const MODE_CONFIG: Record<ChatMode, { label: string; description: string; icon: LucideIcon }> = {
  chat:     { label: "Chat",     description: "Q&A about the codebase",       icon: MessageSquare },
  overview: { label: "Overview", description: "Full architecture report",      icon: LayoutDashboard },
  flow:     { label: "Flow",     description: "Trace execution paths",         icon: GitBranch },
  diagram:  { label: "Diagram",  description: "Generate architecture diagram", icon: Share2 },
};

const MODES = Object.keys(MODE_CONFIG) as ChatMode[];

export function ModeSelector() {
  const { activeMode, setMode } = useChatStore();

  return (
    <div className="flex space-x-2 p-2 bg-[#121110] border border-[#8A5F41]/20 rounded-xl mb-2 w-max">
      {MODES.map((mode) => {
        const config = MODE_CONFIG[mode];
        const Icon = config.icon;
        const isActive = activeMode === mode;
        
        return (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? "bg-[#1C1917] text-[#CCD67F] border border-[#8A5F41]/30" 
                : "text-[#A77F60] hover:text-[#F3E4C9] hover:bg-[#1C1917]/50 border border-transparent"
            }`}
            title={config.description}
          >
            <Icon className="w-4 h-4" />
            <span>{config.label}</span>
          </button>
        );
      })}
    </div>
  );
}
