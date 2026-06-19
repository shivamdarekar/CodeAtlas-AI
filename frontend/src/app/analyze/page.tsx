"use client";

import { RepoIndexForm } from "@/components/repository/RepoIndexForm";
import { Navbar } from "@/layout/Navbar";
import Image from "next/image";

export default function AnalyzePage() {
  return (
    <div className="w-full bg-[#050505] min-h-screen relative pt-[98px] pb-0 font-sans">
      <Navbar />

      <section className="relative flex w-[96%] max-w-[1536px] mx-auto min-h-[calc(100vh-140px)] flex-col items-center overflow-hidden bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.02)] mb-10">
        <div className="absolute inset-0 z-[0] pointer-events-none">
          <Image
            src="/hero-bg.png"
            alt="CodeAtlas Background"
            fill
            priority
            className="object-cover object-center opacity-50"
          />
        </div>
        <div className="absolute inset-0 z-[10] pointer-events-none bg-gradient-to-b from-[#0a0a0a]/80 via-[#0a0a0a]/60 to-[#0a0a0a] mix-blend-multiply" />

        <div className="relative z-20 flex flex-col items-center justify-center w-full flex-1 px-6 md:px-12 py-16">
          <div className="text-center mb-12">
            <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-[#F3E4C9] mb-4 tracking-tight">
              Connect Repository
            </h1>
            <p className="text-[#A77F60] text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Initialize the Atlas Engine to parse, vector-index, and trace your codebase architecture instantly.
            </p>
          </div>

          <div className="w-full max-w-lg">
            <RepoIndexForm />
          </div>
        </div>
      </section>
    </div>
  );
}
