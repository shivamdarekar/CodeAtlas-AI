"use client";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./ChatMessage";
import { MessageSquare, GitBranch, LayoutDashboard, Share2 } from "lucide-react";

const SUGGESTIONS = [
  { label: "Explain the architecture", icon: LayoutDashboard },
  { label: "Trace the auth flow", icon: GitBranch },
  { label: "List all API endpoints", icon: Share2 },
  { label: "How does error handling work?", icon: MessageSquare },
];

export function ChatWindow() {
  const { messages, isStreaming } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-8">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#CCD67F]/[0.06] border border-[#CCD67F]/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-[#CCD67F]/60" strokeWidth={1.5} />
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-[family-name:var(--font-display)] font-semibold text-[#e3e2de] tracking-tight">
            Start a conversation
          </h3>
          <p className="text-sm text-[#6b6e66] max-w-sm leading-relaxed">
            Ask about architecture, trace execution flows, or generate diagrams for this repository.
          </p>
        </div>

        {/* Suggestion chips */}
        <div className="flex flex-wrap justify-center gap-2 max-w-lg">
          {SUGGESTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-[#8e9289] hover:text-[#e3e2de] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-200 active:scale-[0.97]"
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Messages ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Top scroll fade */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollRef}
        className="h-full overflow-y-auto scroll-smooth px-4 md:px-8 py-6"
      >
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Streaming indicator */}
          {isStreaming && (
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-[#CCD67F]/[0.1] border border-[#CCD67F]/20 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 border-2 border-[#CCD67F]/30 border-t-[#CCD67F] rounded-full animate-spin" />
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-[#CCD67F]/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#CCD67F]/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#CCD67F]/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
                <span className="text-xs text-[#6b6e66]">Analyzing codebase…</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom scroll fade */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
    </div>
  );
}
