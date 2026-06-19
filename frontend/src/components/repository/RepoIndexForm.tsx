"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/store/repo-store";
import { GitBranch, Upload, Check, Loader2, AlertCircle, FileArchive, X } from "lucide-react";
import type { IndexedRepository } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const formSchema = z.object({
  repoUrl: z.string().url("Please enter a valid GitHub URL.").refine(
    (v) => v.includes("github.com"),
    { message: "Only GitHub URLs are supported." }
  ),
  branch: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { key: "clone",   label: "Cloning / Extracting",     icon: "⬇" },
  { key: "scan",    label: "Scanning files",            icon: "🔍" },
  { key: "chunk",   label: "AST parsing & chunking",    icon: "🧩" },
  { key: "embed",   label: "Generating embeddings",     icon: "🔢" },
  { key: "upsert",  label: "Storing vectors",           icon: "📦" },
  { key: "summary", label: "Building architecture map", icon: "🗺" },
] as const;
type StepKey = typeof STEPS[number]["key"];
interface StepState { status: "idle" | "active" | "done"; detail?: string; pct?: number; }
type StepsMap = Record<StepKey, StepState>;

const IDLE_STEPS: StepsMap = {
  clone: { status: "idle" }, scan: { status: "idle" }, chunk: { status: "idle" },
  embed: { status: "idle" }, upsert: { status: "idle" }, summary: { status: "idle" },
};

// ── SSE reader helper ─────────────────────────────────────────────────────────
async function readSSEStream(
  res: Response,
  onProgress: (step: StepKey, detail?: string, pct?: number) => void,
  onDone: (repo: IndexedRepository) => void,
  onError: (msg: string) => void
) {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      if (!part.trim()) continue;
      const eventMatch = part.match(/^event:\s*(\S+)/m);
      const dataMatch  = part.match(/^data:\s*(.+)/m);
      if (!eventMatch || !dataMatch) continue;
      const event = eventMatch[1];
      const data  = JSON.parse(dataMatch[1]);

      if (event === "progress") onProgress(data.step, data.detail, data.pct);
      if (event === "done")     onDone(data.repository);
      if (event === "error")    onError(data.message ?? "Indexing failed.");
    }
  }
}

export function RepoIndexForm() {
  const router = useRouter();
  const { setActiveRepo, addToHistory } = useRepoStore();
  const [tab, setTab] = useState<"github" | "zip">("github");
  const [indexing, setIndexing] = useState(false);
  const [steps, setSteps] = useState<StepsMap>(IDLE_STEPS);
  const [overallPct, setOverallPct] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { repoUrl: "", branch: "main" },
  });

  // ── Shared progress handlers ──────────────────────────────────────────────
  const handleProgress = (step: StepKey, detail?: string, pct?: number) => {
    setOverallPct(pct ?? 0);
    setSteps((prev) => {
      const next = { ...prev };
      // Mark everything before this step as done
      const idx = STEPS.findIndex((s) => s.key === step);
      STEPS.slice(0, idx).forEach((s) => {
        if (next[s.key].status !== "done") next[s.key] = { status: "done" };
      });
      next[step] = { status: "active", detail, pct };
      return next;
    });
  };

  const handleDone = (repo: IndexedRepository) => {
    setSteps((prev) => {
      const next = { ...prev };
      STEPS.forEach((s) => { next[s.key] = { status: "done" }; });
      return next;
    });
    setOverallPct(100);
    setActiveRepo(repo);
    addToHistory(repo);
    setTimeout(() => router.push(`/${repo.namespace}/chat`), 600);
  };

  const handleStreamError = (msg: string) => {
    setErrorMsg(msg);
    setIndexing(false);
  };

  const startIndexing = () => {
    setErrorMsg("");
    setIndexing(true);
    setOverallPct(0);
    setSteps(IDLE_STEPS);
  };

  // ── GitHub submit ─────────────────────────────────────────────────────────
  const onGitHubSubmit = async (values: FormValues) => {
    startIndexing();
    try {
      const res = await fetch(`${BASE_URL}/repos/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl: values.repoUrl, branch: values.branch }),
      });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).message ?? "Failed to start.");
      await readSSEStream(res, handleProgress, handleDone, handleStreamError);
    } catch (err: any) {
      handleStreamError(err.message ?? "An error occurred.");
    }
  };

  // ── ZIP submit ────────────────────────────────────────────────────────────
  const onZipSubmit = async () => {
    if (!zipFile) return;
    startIndexing();
    try {
      const formData = new FormData();
      formData.append("zipFile", zipFile);
      const res = await fetch(`${BASE_URL}/repos/upload/stream`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).message ?? "Failed to start.");
      await readSSEStream(res, handleProgress, handleDone, handleStreamError);
    } catch (err: any) {
      handleStreamError(err.message ?? "An error occurred.");
    }
  };

  // ── Progress UI (shared) ──────────────────────────────────────────────────
  if (indexing) {
    return (
      <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-[family-name:var(--font-display)] text-[#e3e2de] font-semibold mb-1">
              Indexing Repository
            </h2>
            <p className="text-xs text-[#6b6e66]">This may take 1–3 minutes depending on repo size</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#CCD67F] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-1.5">
            {STEPS.map((step) => {
              const state = steps[step.key];
              return (
                <div
                  key={step.key}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-all duration-300
                    ${state.status === "active" ? "bg-[#CCD67F]/[0.06] border border-[#CCD67F]/20" : "border border-transparent"}
                  `}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300
                    ${state.status === "done"   ? "bg-[#98b090]/20 border border-[#98b090]/40" :
                      state.status === "active" ? "bg-[#CCD67F]/10 border border-[#CCD67F]/30" :
                                                  "bg-white/[0.04] border border-white/[0.06]"}`}
                  >
                    {state.status === "done"   ? <Check className="w-3 h-3 text-[#98b090]" strokeWidth={2.5} /> :
                     state.status === "active" ? <Loader2 className="w-3 h-3 text-[#CCD67F] animate-spin" /> :
                                                 <span className="text-[10px]">{step.icon}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-colors duration-200
                      ${state.status === "done" ? "text-[#6b6e66]" : state.status === "active" ? "text-[#e3e2de]" : "text-[#4a4d46]"}`}>
                      {step.label}
                    </p>
                    {state.detail && state.status === "active" && (
                      <p className="text-[11px] text-[#8e9289] mt-0.5 truncate">{state.detail}</p>
                    )}
                  </div>
                  {state.status === "active" && state.pct !== undefined && (
                    <span className="text-[11px] font-mono text-[#CCD67F] shrink-0">{state.pct}%</span>
                  )}
                  {state.status === "done" && (
                    <span className="text-[11px] text-[#4a4d46] shrink-0">done</span>
                  )}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errorMsg}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form UI ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.2)]">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-[family-name:var(--font-display)] text-[#e3e2de] font-bold mb-2">
          New Repository
        </h2>
        <p className="text-sm text-[#8e9289]">Connect a GitHub repo or upload a ZIP archive.</p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-6">
        {([["github", GitBranch, "GitHub URL"], ["zip", Upload, "Upload ZIP"]] as const).map(([id, Icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${tab === id
                ? "bg-white/[0.08] text-[#e3e2de] border border-white/[0.08]"
                : "text-[#6b6e66] hover:text-[#8e9289]"
              }`}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* GitHub URL form */}
      {tab === "github" && (
        <form onSubmit={handleSubmit(onGitHubSubmit)} className="space-y-4">
          <div>
            <div className="relative">
              <GitBranch className="absolute left-3 top-3 h-4 w-4 text-[#8e9289]" />
              <Input
                {...register("repoUrl")}
                placeholder="https://github.com/user/repo"
                className="pl-9 bg-white/5 border-white/10 text-[#e3e2de] placeholder:text-[#8e9289] focus-visible:ring-[#98b090]/50 h-11"
              />
            </div>
            {errors.repoUrl && <p className="text-xs text-red-400 mt-1">{errors.repoUrl.message}</p>}
          </div>
          <Input
            {...register("branch")}
            placeholder="Branch (optional, default: main)"
            className="bg-white/5 border-white/10 text-[#e3e2de] placeholder:text-[#8e9289] focus-visible:ring-[#98b090]/50 h-11"
          />
          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errorMsg}
            </div>
          )}
          <Button type="submit" className="w-full bg-[#98b090] text-[#0a0a0a] hover:bg-[#b5cdac] rounded-xl h-11 font-semibold">
            Start Analysis
          </Button>
        </form>
      )}

      {/* ZIP upload form */}
      {tab === "zip" && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f?.name.endsWith(".zip")) setZipFile(f);
            }}
            className="border-2 border-dashed border-white/[0.10] rounded-xl p-8 text-center cursor-pointer hover:border-white/20 hover:bg-white/[0.02] transition-all duration-200"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
            />
            {zipFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileArchive className="w-5 h-5 text-[#CCD67F]" strokeWidth={1.5} />
                <span className="text-sm text-[#e3e2de] font-medium truncate max-w-[240px]">{zipFile.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setZipFile(null); }}
                  className="text-[#4a4d46] hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-[#8e9289]" strokeWidth={1.5} />
                <p className="text-sm text-[#c8d4b8]">Drop a <span className="text-white font-medium">.zip</span> file here or click to browse</p>
                <p className="text-xs text-[#8e9289]">Max 200 MB</p>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{errorMsg}
            </div>
          )}

          <Button
            onClick={onZipSubmit}
            disabled={!zipFile}
            className="w-full bg-[#98b090] text-[#0a0a0a] hover:bg-[#b5cdac] rounded-xl h-11 font-semibold disabled:opacity-40"
          >
            Index ZIP Archive
          </Button>
        </div>
      )}
    </div>
  );
}
