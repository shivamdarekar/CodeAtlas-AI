"use client";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import type { RepoSummary, GraphNodeType } from "@/types";

// ── Column layout ────────────────────────────────────────────────────────────
const COLUMN_X: Record<GraphNodeType, number> = {
  page:      0,
  component: 320,
  hook:      640,
  service:   960,
  apiRoute:  1280,
};

const COLUMN_LABELS: Record<GraphNodeType, string> = {
  page:      "Pages",
  component: "Components",
  hook:      "Hooks",
  service:   "Services",
  apiRoute:  "API Routes",
};

// ── Node accent colors ───────────────────────────────────────────────────────
const NODE_COLORS: Record<GraphNodeType, { border: string; badge: string; text: string }> = {
  page:      { border: "#CCD67F", badge: "#CCD67F20", text: "#CCD67F" },
  component: { border: "#8A5F41", badge: "#8A5F4120", text: "#d4935a" },
  hook:      { border: "#A77F60", badge: "#A77F6020", text: "#c9a07a" },
  service:   { border: "#6b9e8f", badge: "#6b9e8f20", text: "#8fc5b8" },
  apiRoute:  { border: "#8172B3", badge: "#8172B320", text: "#a599cc" },
};

// ── Custom node label: filename + parent folder ──────────────────────────────
function buildLabel(filePath: string): { name: string; folder: string } {
  const parts = filePath.replace(/\\/g, "/").split("/");
  const name = parts.pop() ?? filePath;
  const folder = parts.length > 0 ? parts[parts.length - 1] : "";
  return { name, folder };
}

function buildNodes(summary: RepoSummary): Node[] {
  const nodes: Node[] = [];
  const entries: [GraphNodeType, string[]][] = [
    ["page",      summary.pages      || []],
    ["component", summary.components || []],
    ["hook",      summary.hooks      || []],
    ["service",   summary.services   || []],
    ["apiRoute",  summary.apiRoutes  || []],
  ];

  for (const [type, paths] of entries) {
    const colors = NODE_COLORS[type];
    paths.forEach((filePath, i) => {
      const { name, folder } = buildLabel(filePath);
      nodes.push({
        id: `${type}-${i}`,
        data: { label: name, folder, type },
        position: { x: COLUMN_X[type], y: i * 90 + 60 }, // +60 offset for column header
        style: {
          background: "#111210",
          border: `1px solid ${colors.border}40`,
          borderRadius: 10,
          padding: "0",
          width: 200,
          fontSize: 12,
        },
      });
    });
  }
  return nodes;
}

// ── Custom node renderer via nodeTypes ───────────────────────────────────────
function CustomNode({ data }: { data: { label: string; folder: string; type: GraphNodeType } }) {
  const colors = NODE_COLORS[data.type];
  return (
    <div
      style={{
        background: "#111210",
        border: `1px solid ${colors.border}50`,
        borderRadius: 10,
        overflow: "hidden",
        width: 200,
        minHeight: 52,
      }}
    >
      {/* Type badge strip */}
      <div
        style={{
          background: colors.badge,
          borderBottom: `1px solid ${colors.border}30`,
          padding: "3px 10px",
          display: "flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: colors.text,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 10, color: colors.text, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {COLUMN_LABELS[data.type]}
        </span>
      </div>

      {/* File name */}
      <div style={{ padding: "8px 10px 6px" }}>
        <div style={{ color: "#e3e2de", fontSize: 12, fontWeight: 500, wordBreak: "break-word", lineHeight: 1.3 }}>
          {data.label}
        </div>
        {data.folder && (
          <div style={{ color: "#4a4d46", fontSize: 10, marginTop: 2 }}>
            …/{data.folder}/
          </div>
        )}
      </div>
    </div>
  );
}

const NODE_TYPES = { default: CustomNode };

// ── Column header nodes ──────────────────────────────────────────────────────
function buildHeaderNodes(): Node[] {
  return (Object.entries(COLUMN_LABELS) as [GraphNodeType, string][]).map(([type, label]) => ({
    id: `header-${type}`,
    type: "header" as any,
    data: { label, type },
    position: { x: COLUMN_X[type], y: -20 },
    selectable: false,
    draggable: false,
    style: { width: 200, pointerEvents: "none" as any },
  }));
}

function HeaderNode({ data }: { data: { label: string; type: GraphNodeType } }) {
  const colors = NODE_COLORS[data.type];
  return (
    <div style={{ textAlign: "center", width: 200 }}>
      <span style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: colors.text,
        background: colors.badge,
        border: `1px solid ${colors.border}40`,
        borderRadius: 6,
        padding: "3px 10px",
        display: "inline-block",
      }}>
        {data.label}
      </span>
    </div>
  );
}

const EXTENDED_NODE_TYPES = { default: CustomNode, header: HeaderNode };

// ── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{
      background: "#0e0f0c",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: "10px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{ fontSize: 10, color: "#4a4d46", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 2 }}>
        Legend
      </span>
      {(Object.entries(NODE_COLORS) as [GraphNodeType, typeof NODE_COLORS[GraphNodeType]][]).map(([type, colors]) => (
        <div key={type} style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: colors.text, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "#8e9289" }}>{COLUMN_LABELS[type]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CodebaseGraph({ summary }: { summary: RepoSummary }) {
  const dataNodes = buildNodes(summary);
  const headerNodes = buildHeaderNodes();
  const nodes = [...headerNodes, ...dataNodes];
  const edges: Edge[] = [];

  // Stats
  const totalNodes = dataNodes.length;

  return (
    <div className="h-full w-full bg-[#0a0a0a] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={EXTENDED_NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ style: { stroke: "#CCD67F40", strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1e1f1c" gap={20} size={1} />

        {/* Controls — styled to be visible */}
        <Controls
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            background: "#111210",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            padding: 4,
            bottom: 24,
            left: 16,
          }}
          showInteractive={false}
        />

        <MiniMap
          nodeColor={(n) => {
            if (n.id.startsWith("header-")) return "transparent";
            const type = n.id.split("-")[0] as GraphNodeType;
            return NODE_COLORS[type]?.text ?? "#8A5F41";
          }}
          style={{
            background: "#0e0f0c",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
          }}
          maskColor="#0a0a0a90"
        />

        {/* Top-left info panel */}
        <Panel position="top-left">
          <div style={{
            background: "#0e0f0c",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#e3e2de" }}>{summary.repoName}</span>
            <span style={{ fontSize: 10, color: "#4a4d46" }}>{totalNodes} nodes · {summary.stats.files} files</span>
          </div>
        </Panel>

        {/* Bottom-right legend */}
        <Panel position="bottom-right">
          <Legend />
        </Panel>
      </ReactFlow>
    </div>
  );
}
