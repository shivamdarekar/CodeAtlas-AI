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
  const isPlaceholderAssistant = !isUser && !message.content.trim();
  const isDiagramMessage = message.mode === "diagram";

  if (isPlaceholderAssistant) {
    return null;
  }

  const bubbleWidthClass = isDiagramMessage || message.mode === "overview"
    ? "w-full max-w-none"
    : "max-w-[85%] md:max-w-[78%]";

  return (
    <div
      data-chat-message="true"
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} ${isDiagramMessage ? "w-full" : ""}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-[#CCD67F]/[0.1] border border-[#CCD67F]/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-[#CCD67F]" strokeWidth={1.5} />
        </div>
      )}

      <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"} ${bubbleWidthClass} ${isDiagramMessage ? "flex-1" : ""}`}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-md bg-white/[0.06] border border-white/[0.08] px-4 py-3 text-[14px] text-[#e3e2de] leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className={`chat-prose w-full ${isDiagramMessage ? "max-w-none" : ""}`}>
            <ReactMarkdown
              components={{
                // ── Headings — compact sizes for chat context ──────────────
                h1: ({ children }) => (
                  <h1 className="text-base font-semibold text-[#e3e2de] mt-4 mb-1.5 leading-snug">{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-[15px] font-semibold text-[#e3e2de] mt-3.5 mb-1 leading-snug">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-[14px] font-semibold text-[#c8d4b8] mt-3 mb-1 leading-snug">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-[13px] font-semibold text-[#b5cdac] mt-2 mb-0.5">{children}</h4>
                ),
                // ── Paragraphs ─────────────────────────────────────────────
                p: ({ children }) => (
                  <p className="text-[14px] text-[#d4ddc8] leading-relaxed mb-2 last:mb-0">{children}</p>
                ),
                // ── Lists ──────────────────────────────────────────────────
                ul: ({ children }) => (
                  <ul className="text-[14px] text-[#d4ddc8] space-y-1 mb-2 ml-4 list-disc">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="text-[14px] text-[#d4ddc8] space-y-1 mb-2 ml-4 list-decimal">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed">{children}</li>
                ),
                // ── Horizontal rule ────────────────────────────────────────
                hr: () => (
                  <hr className="border-white/[0.06] my-3" />
                ),
                // ── Strong / Em ────────────────────────────────────────────
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#e3e2de]">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-[#b5cdac] not-italic font-medium">{children}</em>
                ),
                // ── Blockquote ─────────────────────────────────────────────
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#CCD67F]/40 pl-3 my-2 text-[13px] text-[#8e9289] italic">
                    {children}
                  </blockquote>
                ),
                // ── Code blocks ────────────────────────────────────────────
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
                        borderRadius: "10px",
                        border: "1px solid rgba(255,255,255,0.06)",
                        fontSize: "12.5px",
                        margin: "8px 0",
                      }}
                      {...(props as any)}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code
                      className="bg-white/[0.06] border border-white/[0.06] px-1.5 py-0.5 rounded text-[12.5px] text-[#CCD67F] font-mono"
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

        <span className="text-[10px] text-[#6b6e66] tabular-nums px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-[#8e9289]" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
}
