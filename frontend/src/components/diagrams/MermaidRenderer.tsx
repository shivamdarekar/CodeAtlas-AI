"use client";
import { useEffect, useRef, useId, useState } from "react";
import mermaid from "mermaid";
import { AlertTriangle, Copy, RotateCcw } from "lucide-react";

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

function normalizeChart(raw: string): string {
  const trimmed = cleanChart(raw)
    .replace(/^```mermaid\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const graphStart = trimmed.match(/^(graph TD|flowchart TD)/im);
  if (!graphStart) {
    return trimmed;
  }

  return trimmed.slice(graphStart.index).trim();
}

function looksRenderable(chart: string): boolean {
  if (!chart) return false;
  if (!/^(graph TD|flowchart TD)/i.test(chart)) return false;
  return /-->|==>|-.->|---/.test(chart);
}

function isMermaidFallbackSvg(svg: string): boolean {
  return /Syntax error in text|mermaid version/i.test(svg);
}

export default function MermaidRenderer({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);
  const cleaned = normalizeChart(chart);

  useEffect(() => {
    if (!containerRef.current) return;

    setError(null);
    containerRef.current.innerHTML = "";

    if (!looksRenderable(cleaned)) {
      setError("The diagram text is missing a valid Mermaid flowchart header or edge definitions.");
      return;
    }

    let cancelled = false;

    const renderChart = async () => {
      try {
        await mermaid.parse(cleaned);
        const { svg } = await mermaid.render(`mermaid-${id}`, cleaned);

        if (cancelled || !containerRef.current) {
          return;
        }

        if (isMermaidFallbackSvg(svg)) {
          setError("Mermaid returned an invalid diagram fallback.");
          return;
        }

        containerRef.current.innerHTML = svg;
      } catch (err: any) {
        if (cancelled) {
          return;
        }

        setError(err?.message ?? "Invalid diagram syntax");
      }
    };

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [cleaned, id]);

  if (error) {
    return (
      <div className="my-3 rounded-xl border border-white/[0.06] bg-[#111210] px-4 py-3 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.65)]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#CCD67F]/[0.08] border border-[#CCD67F]/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-[#CCD67F]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#e3e2de]">Diagram unavailable</p>
            <p className="mt-0.5 text-xs text-[#8e9289] leading-relaxed">
              The model produced Mermaid that could not be rendered cleanly.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#CCD67F]/15 bg-[#CCD67F]/[0.08] px-2.5 py-1 text-[11px] text-[#CCD67F] hover:bg-[#CCD67F]/[0.12] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry page
              </button>
              <details className="group">
                <summary className="cursor-pointer list-none text-[11px] text-[#b5cdac] inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 hover:bg-white/[0.05] transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                  Show details
                </summary>
                <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/20 p-3">
                  <p className="text-[11px] text-[#6b6e66] mb-2">{error}</p>
                  <pre className="text-[11px] text-[#8e9289] whitespace-pre-wrap overflow-x-auto">{cleaned}</pre>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!looksRenderable(cleaned)) {
    return (
      <div className="my-3 rounded-xl border border-white/[0.06] bg-[#111210] p-4 text-sm text-[#8e9289] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
          <Copy className="w-4 h-4 text-[#6b6e66]" />
        </div>
        <div>
          <p className="text-[#e3e2de] font-medium">Preparing diagram…</p>
          <p className="text-xs mt-0.5">Waiting for a valid Mermaid graph from the model.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-x-auto rounded-xl border border-[#CCD67F]/10 bg-[#0e0f0c] p-4 my-3 w-full min-h-[360px] [&_svg]:w-full [&_svg]:max-w-none [&_svg]:h-auto"
    />
  );
}
