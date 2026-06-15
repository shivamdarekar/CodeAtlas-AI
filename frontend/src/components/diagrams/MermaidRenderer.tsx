"use client";
import { useEffect, useRef, useId } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    background: "#0C0A09",
    primaryColor: "#1C1917",
    primaryTextColor: "#F3E4C9",
    primaryBorderColor: "#8A5F41",
    lineColor: "#CCD67F",
  },
});

export default function MermaidRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, ""); // mermaid IDs can't have colons

  useEffect(() => {
    if (!containerRef.current || !chart) return;

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch(() => {
        // If mermaid fails to parse, show raw text
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre>${chart}</pre>`;
        }
      });
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-[#8A5F41]/20 bg-[#121110] p-4 my-4"
    />
  );
}
