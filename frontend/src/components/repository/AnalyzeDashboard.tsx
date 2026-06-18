"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { RepositorySummary } from "@/types";
import {
  Database,
  FileCode2,
  Boxes,
  FunctionSquare,
  ArrowUpRight,
  RefreshCw,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";

// ── Chart.js setup ──────────────────────────────────────────────────────────
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

// ── Color palette matching CodeAtlas theme ───────────────────────────────────
const CHART_COLORS = [
  "#98b090", // sage green (primary)
  "#CCD67F", // lime
  "#d2b48c", // tan
  "#A77F60", // warm brown
  "#8172B3", // muted purple
  "#5a9e8f", // teal
];

// ── KPI Card Component ──────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  accentColor = "#98b090",
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accentColor?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
        </div>
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#8e9289]">
          {label}
        </span>
      </div>
      <span className="text-2xl font-bold text-[#e3e2de] tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}

// ── Sortable Table ──────────────────────────────────────────────────────────
type SortKey = "repoName" | "files" | "components" | "functions";

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      onClick={() => onSort(sortKey)}
      className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8e9289] cursor-pointer select-none hover:text-[#b5cdac] transition-colors whitespace-nowrap"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ChevronUp className="w-3 h-3 text-[#98b090]" />
          ) : (
            <ChevronDown className="w-3 h-3 text-[#98b090]" />
          )
        ) : null}
      </span>
    </th>
  );
}

// ── Main Dashboard Component ────────────────────────────────────────────────
export function AnalyzeDashboard() {
  const router = useRouter();
  const [repos, setRepos] = useState<RepositorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("repoName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getRepositories();
      if (res.data.statusCode === 200 && res.data.data) {
        setRepos(res.data.data);
      } else {
        setError(res.data.message || "Failed to load repositories.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Backend is unreachable. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  // ── Aggregate KPIs ──────────────────────────────────────────────────────
  const totalRepos = repos.length;
  const totalFiles = repos.reduce((sum, r) => sum + r.stats.files, 0);
  const totalComponents = repos.reduce((sum, r) => sum + r.stats.components, 0);
  const totalFunctions = repos.reduce((sum, r) => sum + r.stats.functions, 0);

  // ── Chart data ──────────────────────────────────────────────────────────
  const barChartData = {
    labels: repos.map((r) => r.repoName),
    datasets: [
      {
        label: "Components",
        data: repos.map((r) => r.stats.components),
        backgroundColor: CHART_COLORS[0] + "CC",
        borderColor: CHART_COLORS[0],
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Functions",
        data: repos.map((r) => r.stats.functions),
        backgroundColor: CHART_COLORS[1] + "CC",
        borderColor: CHART_COLORS[1],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#8e9289",
          usePointStyle: true,
          padding: 16,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "#1a1c19",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleColor: "#e3e2de",
        bodyColor: "#b5cdac",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#8e9289", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#8e9289", font: { size: 11 } },
      },
    },
  };

  // Doughnut: file type breakdown across all repos
  const categoryData = {
    pages: repos.reduce((s, r) => s + r.pages.length, 0),
    components: repos.reduce((s, r) => s + r.components.length, 0),
    services: repos.reduce((s, r) => s + r.services.length, 0),
    hooks: repos.reduce((s, r) => s + r.hooks.length, 0),
    apiRoutes: repos.reduce((s, r) => s + r.apiRoutes.length, 0),
  };

  const doughnutData = {
    labels: ["Pages", "Components", "Services", "Hooks", "API Routes"],
    datasets: [
      {
        data: Object.values(categoryData),
        backgroundColor: CHART_COLORS.slice(0, 5).map((c) => c + "CC"),
        borderColor: "#0a0a0a",
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#8e9289",
          usePointStyle: true,
          padding: 12,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: "#1a1c19",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleColor: "#e3e2de",
        bodyColor: "#b5cdac",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  // ── Sorting ─────────────────────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedRepos = [...repos].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortKey) {
      case "repoName":
        aVal = a.repoName.toLowerCase();
        bVal = b.repoName.toLowerCase();
        break;
      case "files":
        aVal = a.stats.files;
        bVal = b.stats.files;
        break;
      case "components":
        aVal = a.stats.components;
        bVal = b.stats.components;
        break;
      case "functions":
        aVal = a.stats.functions;
        bVal = b.stats.functions;
        break;
    }

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  // ── Loading state ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 w-full">
        <Loader2 className="w-8 h-8 text-[#98b090] animate-spin" />
        <p className="text-sm text-[#8e9289]">Loading repository data…</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 w-full">
        <p className="text-sm text-red-400 text-center max-w-md">{error}</p>
        <button
          onClick={fetchRepos}
          className="text-xs text-[#98b090] hover:text-[#b5cdac] transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────
  if (repos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 w-full">
        <Database className="w-10 h-10 text-[#8e9289]/40" />
        <p className="text-sm text-[#8e9289] text-center max-w-sm">
          No repositories indexed yet. Use the form above to connect your first GitHub repository.
        </p>
      </div>
    );
  }

  // ── Dashboard ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#e3e2de]">Index Overview</h3>
          <p className="text-xs text-[#8e9289] mt-0.5">
            Aggregate stats across {totalRepos} indexed {totalRepos === 1 ? "repository" : "repositories"}
          </p>
        </div>
        <button
          onClick={fetchRepos}
          className="text-xs text-[#8e9289] hover:text-[#b5cdac] transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] hover:border-white/[0.12]"
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Repositories" value={totalRepos} icon={Database} accentColor="#98b090" />
        <KpiCard label="Files Indexed" value={totalFiles} icon={FileCode2} accentColor="#CCD67F" />
        <KpiCard label="Components" value={totalComponents} icon={Boxes} accentColor="#d2b48c" />
        <KpiCard label="Functions" value={totalFunctions} icon={FunctionSquare} accentColor="#A77F60" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Bar Chart – spans 3 cols */}
        <div className="lg:col-span-3 p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#8e9289] mb-4 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#98b090]" />
            Components vs Functions by Repository
          </h4>
          <div className="h-[300px]">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart – spans 2 cols */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#8e9289] mb-4 flex items-center gap-2">
            <Boxes className="w-3.5 h-3.5 text-[#d2b48c]" />
            Architecture Breakdown
          </h4>
          <div className="h-[300px]">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Repository Table */}
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-5 pt-4 pb-2">
          <h4 className="text-xs font-semibold uppercase tracking-[0.06em] text-[#8e9289]">
            Indexed Repositories
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <SortableHeader label="Repository" sortKey="repoName" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Files" sortKey="files" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Components" sortKey="components" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Functions" sortKey="functions" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8e9289]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRepos.map((repo) => (
                <tr
                  key={repo.repoId}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[#e3e2de]">
                      {repo.repoName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#8e9289] tabular-nums">
                    {repo.stats.files.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#8e9289] tabular-nums">
                    {repo.stats.components.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#8e9289] tabular-nums">
                    {repo.stats.functions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/${repo.namespace}/chat`)}
                      className="text-xs text-[#98b090] hover:text-[#b5cdac] transition-colors flex items-center gap-1"
                    >
                      Open Chat <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
