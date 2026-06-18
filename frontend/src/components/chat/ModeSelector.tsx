"use client";

import { MessageSquare, LayoutDashboard, GitBranch, Share2, type LucideIcon } from "lucide-react";
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
    <div className="flex items-center gap-1">
      {MODES.map((mode) => {
        const config = MODE_CONFIG[mode];
        const Icon = config.icon;
        const isActive = activeMode === mode;

        return (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            title={config.description}
            className={`
              relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200 select-none
              active:scale-[0.97]
              ${isActive
                ? "text-[#CCD67F] bg-[#CCD67F]/[0.08]"
                : "text-[#6b6e66] hover:text-[#e3e2de] hover:bg-white/[0.04]"
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{config.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-[#CCD67F]/60 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
