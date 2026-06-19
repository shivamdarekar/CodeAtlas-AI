"use client";
import { useEffect, useRef, useId, useState } from "react";
import mermaid from "mermaid";
import { AlertTriangle } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  themeVariables: {
    background: "#0C0A09",
    primaryColor: "#1C1917",
    primaryTextColor: "#e3e2de",
    primaryBorderColor: "#CCD67F",
    lineColor: "#CCD67F",
    secondaryColor: "#1a1c14",
    tertiaryColor: "#1a1c14",
    edgeLabelBackground: "#1a1c14",
    nodeTextColor: "#e3e2de",
    clusterBkg: "#1a1c14",
    titleColor: "#e3e2de",
  },
});

function cleanChart(raw: string): string {
  // Strip surrounding whitespace/newlines
  return raw.trim();
}

export default function MermaidRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const cleaned = cleanChart(chart);

  useEffect(() => {
    if (!containerRef.current || !cleaned) return;
    setError(null);

    mermaid
      .render(`mermaid-${id}`, cleaned)
      .then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      })
      .catch((err) => {
        setError(err?.message ?? "Invalid diagram syntax");
      });
  }, [cleaned, id]);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4 my-3">
        <div className="flex items-center gap-2 mb-2 text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="text-xs font-medium">Diagram render failed</span>
        </div>
        <p className="text-[11px] text-[#6b6e66] mb-3">{error}</p>
        <pre className="text-[11px] text-[#8e9289] bg-white/[0.03] rounded-lg p-3 overflow-x-auto border border-white/[0.04] whitespace-pre-wrap">{cleaned}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-[#CCD67F]/10 bg-[#0e0f0c] p-4 my-3 [&_svg]:max-w-full"
    />
  );
}
