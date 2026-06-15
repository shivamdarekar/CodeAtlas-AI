"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { useChatStore } from "@/store/chat-store";
import { useRepoStore } from "@/store/repo-store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ModeSelector } from "./ModeSelector";

export function ChatInput() {
  const [query, setQuery] = useState("");
  const { activeMode, addMessage, setStreaming, isStreaming } = useChatStore();
  const { activeRepo } = useRepoStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    addMessage({ role: "user", content: currentQuery, mode: activeMode });
    setStreaming(true);

    try {
      const response = await api.chat(activeRepo.namespace, currentQuery, activeMode);
      if (response.data.statusCode === 200 && response.data.data) {
        addMessage({
          role: "assistant",
          content: response.data.data.answer,
          mode: response.data.data.mode,
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
    <div className="w-full max-w-4xl mx-auto p-4 relative">
      <ModeSelector />
      
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end bg-[#1C1917]/80 backdrop-blur-md border border-[#8A5F41]/30 rounded-2xl p-2 shadow-lg"
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about the codebase..."
          className="flex-1 max-h-[200px] bg-transparent text-[#F3E4C9] placeholder:text-[#A77F60]/50 p-3 resize-none outline-none focus:ring-0 text-sm"
          rows={1}
          disabled={isStreaming}
        />
        
        <button
          type="submit"
          disabled={!query.trim() || isStreaming}
          className="p-3 m-1 bg-[#CCD67F] text-[#0C0A09] rounded-xl hover:bg-[#CCD67F]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isStreaming ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      <div className="text-center mt-2 text-xs text-[#A77F60]/70">
        AI responses can be inaccurate. Please verify information.
      </div>
    </div>
  );
}
