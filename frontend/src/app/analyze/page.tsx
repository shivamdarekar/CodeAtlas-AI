"use client";

import { RepoIndexForm } from "@/components/repository/RepoIndexForm";
import { Navbar } from "@/layout/Navbar";
import Image from "next/image";
import { SearchIcon, Folder, MessageSquare, FileText, Zap } from "lucide-react";

export default function AnalyzePage() {
  return (
    <div className="w-full bg-[#050505] min-h-screen relative pt-[98px] pb-0 font-sans">
      <Navbar />

      <section className="relative flex w-[96%] max-w-[1536px] mx-auto min-h-[calc(100vh-140px)] flex-col items-center overflow-hidden bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.02)] mb-10">
        {/* Background Image */}
        <div className="absolute inset-0 z-[0] pointer-events-none">
          <Image 
            src="/hero-bg.png" 
            alt="CodeAtlas Background" 
            fill
            priority
            className="object-cover object-center opacity-50"
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 z-[10] pointer-events-none bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a] mix-blend-multiply" />

        {/* Content Container */}
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full flex-1 px-4 py-20">
          
          <div className="text-center mb-12">
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-[#F3E4C9] mb-4 tracking-tight">
              Connect Repository
            </h1>
            <p className="text-[#A77F60] text-lg max-w-xl mx-auto">
              Initialize the Atlas Engine to parse, vector-index, and trace your codebase architecture instantly.
            </p>
          </div>

          {/* The Mockup Dashboard Container */}
          <div className="w-full max-w-[1200px] bg-[#121411]/80 backdrop-blur-[32px] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex min-h-[500px]">
            
            {/* Left Sidebar */}
            <aside className="w-64 border-r border-white/5 bg-white/5 flex flex-col p-6 gap-4 hidden md:flex shrink-0">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-[#98b090]/20 border border-[#98b090]/40 flex items-center justify-center shadow-[0_0_15px_rgba(152,176,144,0.2)]">
                  <SearchIcon className="h-4 w-4 text-[#b5cdac]" />
                </div>
                <span className="font-bold text-base text-[#e3e2de]">Atlas Dev</span>
              </div>
              
              <nav className="flex flex-col gap-2">
                <div className="px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-default bg-[#98b090]/15 text-[#b5cdac] border border-[#98b090]/20 shadow-sm">
                  <Folder className="h-4 w-4" />
                  <span className="text-sm font-medium">Repositories</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-not-allowed text-[#c4c8be] opacity-50">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">AI Chat</span>
                </div>
                <div className="px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-not-allowed text-[#c4c8be] opacity-50">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Docs Gen</span>
                </div>
              </nav>
            </aside>

            {/* Main Content Area (Form) */}
            <section className="flex-1 flex flex-col p-8 relative overflow-y-auto items-center justify-center">
              <RepoIndexForm />
            </section>

            {/* Right Aside */}
            <aside className="w-80 border-l border-white/5 bg-white/5 p-8 hidden lg:flex flex-col gap-10 shrink-0">
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#d2b48c]/10 to-transparent border border-[#d2b48c]/20 shadow-inner relative overflow-hidden">
                <p className="text-xs text-[#d2b48c] font-bold mb-3 flex items-center gap-2 relative z-10">
                  <Zap className="h-4 w-4" />
                  Repository Sync
                </p>
                <p className="text-sm text-[#e3e2de] leading-relaxed relative z-10">
                  CodeAtlas automatically indexes your repositories on every push. Enter a public GitHub URL to begin the vectorization and AST parsing sequence.
                </p>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </div>
  );
}
