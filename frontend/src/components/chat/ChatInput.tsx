"use client";
import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { useRepoStore } from "@/store/repo-store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ModeSelector } from "./ModeSelector";

export interface ChatInputHandle {
  fill: (text: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle>((_, ref) => {
  const [query, setQuery] = useState("");
  const { activeMode, addMessage, setStreaming, isStreaming } = useChatStore();
  const { activeRepo } = useRepoStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    fill: (text: string) => {
      setQuery(text);
      textareaRef.current?.focus();
    },
  }));

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [query]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isStreaming || !activeRepo) return;

    const currentQuery = query.trim();
    setQuery("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    addMessage({ role: "user", content: currentQuery, mode: activeMode });
    setStreaming(true);

    try {
      const response = await api.chat(activeRepo.namespace, currentQuery, activeMode);
      if ((response.data.statusCode === 200 || response.data.statusCode === 201) && response.data.data) {
        addMessage({
          role: "assistant",
          content: response.data.data.answer,
          mode: activeMode,
          chunksUsed: response.data.data.chunksUsed,
        });
      } else {
        toast.error(response.data.message || "Failed to get a response.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to get a response. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2">
      <div className="bg-[#111210] border border-white/[0.06] rounded-2xl overflow-hidden shadow-[0_-4px_24px_-6px_rgba(0,0,0,0.4)]">
        <div className="flex items-center px-3 pt-2.5 pb-1 border-b border-white/[0.04]">
          <ModeSelector />
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-2 p-2">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the codebase…"
            className="flex-1 max-h-[200px] bg-transparent text-[#e3e2de] placeholder:text-[#4a4d46] px-3 py-2.5 resize-none outline-none text-[14px] leading-relaxed"
            rows={1}
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={!query.trim() || isStreaming}
            className="shrink-0 p-2.5 bg-[#CCD67F] text-[#0a0a0a] rounded-xl hover:bg-[#d8e18f] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.95]"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

ChatInput.displayName = "ChatInput";
