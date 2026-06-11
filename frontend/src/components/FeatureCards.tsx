"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  FolderSearch,
  Code2,
  Search,
  Database,
  Cpu,
  Network,
  ArrowUpRight
} from "lucide-react";

const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

export function FeatureCards() {
  const reduce = useReducedMotion();

  return (
    <section id="features" className="relative py-32 bg-[#0C0A09] overflow-hidden">
      {/* Custom Styles for StitchMCP Generated UI */}
      <style>{`
        .glass-card {
          background: rgba(28, 25, 23, 0.4);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(138, 95, 65, 0.2);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }
        .glass-card:hover {
          border: 1px solid rgba(204, 214, 127, 0.3);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 40px rgba(0,0,0,0.5);
        }
        .double-bezel {
          position: relative;
        }
        .double-bezel::after {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(243, 228, 201, 0.15), transparent, rgba(204, 214, 127, 0.1));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }
        @keyframes scan {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        .scanner-line {
          animation: scan 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          background: linear-gradient(to bottom, transparent, #8A5F41, transparent);
          box-shadow: 0 0 20px #8A5F41;
        }
        .mesh-gradient {
          background: radial-gradient(at 0% 0%, rgba(138, 95, 65, 0.4) 0%, transparent 50%),
                      radial-gradient(at 100% 0%, rgba(204, 214, 127, 0.2) 0%, transparent 50%),
                      radial-gradient(at 100% 100%, rgba(167, 127, 96, 0.3) 0%, transparent 50%),
                      radial-gradient(at 0% 100%, rgba(12, 10, 9, 0.8) 0%, transparent 50%);
        }
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .node-pulse {
          animation: pulse-node 4s ease-in-out infinite;
        }
      `}</style>

      <div className="relative mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between mb-16">
          <div>
            <span
              className="font-mono text-[11px] font-medium uppercase text-[#A77F60]"
              style={{ letterSpacing: "var(--tracking-caps)" }}
            >
              System Capabilities
            </span>
            <h2
              className="mt-4 font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-[#F3E4C9] sm:text-4xl max-w-2xl"
              style={{ lineHeight: "var(--leading-heading)" }}
            >
              Engineered for massive codebases
            </h2>
          </div>
        </div>

        {/* Pure CSS Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-[280px]">
          
          {/* Feature 1: Repository Scanning */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.05, ...springTransition }}
            className="md:col-span-8 md:row-span-2 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500"
          >
            <div className="absolute inset-0 bg-[#161412] opacity-40"></div>
            <div className="absolute top-0 left-0 w-full h-1/2 scanner-line z-0 opacity-50"></div>
            
            <div className="absolute top-12 right-12 opacity-20 pointer-events-none z-0">
              <div className="flex flex-col gap-4">
                <div className="w-32 h-4 bg-[#A77F60] rounded-full"></div>
                <div className="w-48 h-4 bg-[#CCD67F] rounded-full"></div>
                <div className="w-24 h-4 bg-[#8A5F41] rounded-full"></div>
                <div className="w-32 h-4 bg-[#F3E4C9] rounded-full mt-4"></div>
                <div className="w-16 h-4 bg-[#8A5F41] rounded-full"></div>
              </div>
            </div>

            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <div className="mb-auto flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C0A09]/80 border border-[#8A5F41]/30">
                  <FolderSearch className="h-5 w-5 text-[#CCD67F]" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-[#A77F60] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#CCD67F] tracking-widest mb-2 block">Scanning Module</span>
                <h3 className="text-2xl font-medium text-[#F3E4C9] mb-3 font-[family-name:var(--font-display)]">Repository Scanning</h3>
                <p className="text-sm leading-relaxed text-[#A77F60] max-w-md">Deep-clone and traverse any public GitHub repository. Map the entire structural topology without manual indexing. Works on mega-repos.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: AST Parsing */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1, ...springTransition }}
            className="md:col-span-4 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
              <div className="relative w-64 h-64 opacity-30">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#CCD67F]/40 node-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-12 h-12 rounded-lg bg-[#CCD67F]/10 border border-[#CCD67F]/40 rotate-12"></div>
                <div className="absolute bottom-1/4 right-1/4 w-16 h-16 rounded-full bg-[#8A5F41]/10 border border-[#8A5F41]/30"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-[1px] bg-[#CCD67F]/30 rotate-45"></div>
              </div>
            </div>
            
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <div className="mb-auto">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C0A09]/80 border border-[#8A5F41]/20">
                    <Code2 className="h-4 w-4 text-[#CCD67F]" />
                 </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#F3E4C9] mb-2 font-[family-name:var(--font-display)]">AST Parsing</h3>
                <p className="text-sm leading-relaxed text-[#A77F60]">Extract semantic structures across multiple languages with precision.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 3: Vector Storage */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15, ...springTransition }}
            className="md:col-span-4 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500"
          >
            <div className="absolute inset-0 mesh-gradient opacity-40 z-0 transition-opacity duration-700 group-hover:opacity-70"></div>
            
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <div className="mb-auto">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C0A09]/80 border border-[#8A5F41]/20">
                    <Database className="h-4 w-4 text-[#CCD67F]" />
                 </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#F3E4C9] mb-2 font-[family-name:var(--font-display)]">Vector Storage</h3>
                <p className="text-sm leading-relaxed text-[#A77F60]">Ultra-low latency retrieval powered by Pinecone architecture.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: Groq Inference */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.2, ...springTransition }}
            className="md:col-span-4 md:row-span-2 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500 bg-gradient-to-br from-[#1C1917] to-[#121110]"
          >
             <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <svg className="absolute inset-0 w-full h-full stroke-[#F3E4C9]/20 fill-none" strokeWidth="1">
                  <path d="M0,50 L100,50 L150,100 L300,100 M100,150 L150,200 L300,200 M50,250 L100,250 L150,300 L300,300" strokeDasharray="4 4" />
                  <circle cx="100" cy="50" r="3" fill="#CCD67F"/>
                  <circle cx="150" cy="200" r="3" fill="#CCD67F"/>
                  <circle cx="150" cy="300" r="3" fill="#CCD67F"/>
                </svg>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#8A5F41]/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <div className="mb-auto flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0C0A09]/80 border border-[#8A5F41]/30">
                  <Cpu className="h-5 w-5 text-[#CCD67F]" />
                </div>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase text-[#A77F60] tracking-widest mb-2 block">LPU Engine</span>
                <h3 className="text-2xl font-medium text-[#F3E4C9] mb-3 font-[family-name:var(--font-display)]">Groq Inference</h3>
                <p className="text-sm leading-relaxed text-[#A77F60]">Real-time query resolution via Groq's high-speed inference engine. Zero latency bottlenecks.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 5: Semantic Search */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.25, ...springTransition }}
            className="md:col-span-4 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500"
          >
             <div className="absolute inset-0 bg-gradient-to-t from-[#8A5F41]/10 to-transparent opacity-50"></div>
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
              <div className="mb-auto">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C0A09]/80 border border-[#8A5F41]/20">
                    <Search className="h-4 w-4 text-[#CCD67F]" />
                 </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#F3E4C9] mb-2 font-[family-name:var(--font-display)]">Semantic Search</h3>
                <p className="text-sm leading-relaxed text-[#A77F60]">Find logic by meaning, not by exact keyword match. Context aware.</p>
              </div>
            </div>
          </motion.div>

          {/* Feature 6: Architecture Tracing */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3, ...springTransition }}
            className="md:col-span-4 glass-card double-bezel rounded-[24px] overflow-hidden relative group transition-all duration-500"
          >
            <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-20">
               <svg className="absolute inset-0 w-full h-full stroke-[#A77F60] fill-none" strokeWidth="1">
                  <path d="M-50,50 Q100,150 50,300" opacity="0.3"></path>
                  <path d="M0,100 Q150,200 100,350" opacity="0.5"></path>
                  <circle cx="100" cy="240" r="4" fill="#8A5F41"/>
               </svg>
            </div>
            <div className="relative z-10 p-8 flex flex-col justify-end h-full">
               <div className="mb-auto">
                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0C0A09]/80 border border-[#8A5F41]/20">
                    <Network className="h-4 w-4 text-[#CCD67F]" />
                 </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#F3E4C9] mb-2 font-[family-name:var(--font-display)]">Architecture Tracing</h3>
                <p className="text-sm leading-relaxed text-[#A77F60]">Trace data flows across the full stack. Identify architectural bottlenecks.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
