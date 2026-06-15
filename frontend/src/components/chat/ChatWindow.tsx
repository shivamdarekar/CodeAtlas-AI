"use client";
import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chat-store";
import { ChatMessage } from "./ChatMessage";

export function ChatWindow() {
  const { messages, isStreaming } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <h3 className="text-2xl font-[family-name:var(--font-display)] text-[#F3E4C9] mb-2">
          How can I help you?
        </h3>
        <p className="text-[#A77F60] max-w-md text-sm">
          Select a mode below and ask me to trace execution flows, summarize files, or generate architecture diagrams for this repository.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto w-full p-4 md:p-8 scroll-smooth"
    >
      <div className="max-w-4xl mx-auto w-full flex flex-col">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {isStreaming && (
          <div className="flex justify-start my-4">
            <div className="max-w-[90%] rounded-2xl bg-transparent px-4 py-3 text-sm text-[#A77F60] flex items-center space-x-2">
              <span className="flex space-x-1">
                <span className="w-1.5 h-1.5 bg-[#CCD67F] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-[#CCD67F] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-[#CCD67F] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              <span>Analyzing codebase...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
