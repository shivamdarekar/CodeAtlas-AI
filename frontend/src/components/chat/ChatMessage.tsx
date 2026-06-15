import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import MermaidRenderer from "@/components/diagrams/MermaidRenderer";
import type { ChatMessage as ChatMessageType } from "@/types";

export function ChatMessage({ message }: { message: ChatMessageType }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end my-4">
        <div className="max-w-[80%] rounded-2xl bg-[#1C1917] border border-[#8A5F41]/30 px-4 py-3 text-sm text-[#F3E4C9]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start my-4">
      <div className={`${message.mode === "overview" ? "w-full" : "max-w-[90%]"} prose prose-invert prose-sm`}>
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";

              // Intercept mermaid blocks and render as diagram
              if (language === "mermaid") {
                return <MermaidRenderer chart={String(children)} />;
              }

              return match ? (
                <SyntaxHighlighter style={oneDark} language={language} PreTag="div" {...props as any}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
