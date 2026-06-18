import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import MermaidRenderer from "@/components/diagrams/MermaidRenderer";
import type { ChatMessage as ChatMessageType } from "@/types";
import { User, Sparkles } from "lucide-react";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#CCD67F]/[0.1] border border-[#CCD67F]/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#CCD67F]" strokeWidth={1.5} />
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} max-w-[85%] md:max-w-[75%]`}>
        {/* Message bubble */}
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-[14px] text-[#e3e2de] leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className={`${message.mode === "overview" ? "w-full max-w-none" : ""} prose prose-invert prose-sm max-w-none`}>
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const language = match ? match[1] : "";

                  if (language === "mermaid") {
                    return <MermaidRenderer chart={String(children)} />;
                  }

                  return match ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      customStyle={{
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontSize: "13px",
                      }}
                      {...props as any}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded-md text-[13px] text-[#CCD67F]"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-[#6b6e66] tabular-nums px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-[#8e9289]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
