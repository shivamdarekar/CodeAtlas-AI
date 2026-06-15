"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, ArrowRight, Brain, Code2, Network, Search, 
  Terminal, FileCode, CheckCircle2, FileText, Layers, FolderTree, 
  GitMerge, Activity, BarChart3, ShieldCheck, Database, Server
} from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";

// The timeline node that sits on the global spine.
const TimelineNode = ({ icon: Icon }: { icon: any }) => (
  <motion.div 
    initial={{ borderColor: 'rgba(255,255,255,0.1)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
    whileInView={{ borderColor: 'rgba(181,205,172,0.6)', boxShadow: '0 0 20px rgba(181,205,172,0.4)' }}
    viewport={{ margin: "-40% 0px -40% 0px" }}
    className="hidden lg:flex absolute top-1/2 -left-[60px] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#121411] border items-center justify-center z-30 transition-colors duration-700"
  >
    <Icon className="h-[18px] w-[18px] text-[#b5cdac]" />
  </motion.div>
);

export function FeatureCards() {
  return (
    <section id="features" className="relative w-full max-w-[1536px] mx-auto flex flex-col items-end pb-32 pt-12 overflow-hidden lg:overflow-visible">
      {/* GLOBAL TIMELINE SPINE */}
      <div className="absolute left-[40px] lg:left-[120px] top-[100px] bottom-[200px] w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block z-20" />

      {/* Cards Container */}
      <div className="w-full lg:w-[calc(100%-180px)] flex flex-col gap-12 pr-4 pl-4 lg:pr-8 lg:pl-0 z-30 relative">
        <StorySectionOne />
        <StorySectionTwo />
        <StorySectionThree />
        <StorySectionFour />
        
        <div className="h-8 w-full" />
        <CTASection />
      </div>
    </section>
  );
}

// ------------------------------------------------------------------------------------------------
// SECTION 1: AI Chat (Text Left | Screenshot Right)
// ------------------------------------------------------------------------------------------------
function StorySectionOne() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const [storyStep, setStoryStep] = useState(0);

  useEffect(() => {
    let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout, t4: NodeJS.Timeout, t5: NodeJS.Timeout, t6: NodeJS.Timeout;
    const runSequence = () => {
      setStoryStep(0);
      t1 = setTimeout(() => {
        setStoryStep(1); t2 = setTimeout(() => {
          setStoryStep(2); t3 = setTimeout(() => {
            setStoryStep(3); t4 = setTimeout(() => {
              setStoryStep(4); t5 = setTimeout(() => {
                setStoryStep(5); t6 = setTimeout(() => runSequence(), 4000);
              }, 800);
            }, 800);
          }, 600);
        }, 1200);
      }, 1000);
    };
    runSequence();
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); clearTimeout(t6); };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !mockupRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mockupRef.current.style.transform = `rotateY(${x / 40}deg) rotateX(${-y / 40}deg)`;
  };
  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    mockupRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.06)] overflow-visible flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      
      {/* Node Attached to Global Spine */}
      <TimelineNode icon={Brain} />

      <div className="absolute inset-0 z-0 pointer-events-none rounded-[24px] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#98b090]/[0.03] blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-20 min-h-[600px] items-center">
        
        {/* Left: Content (40%) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 h-[40px] px-4 rounded-full bg-[#121411] border border-[rgba(255,255,255,0.08)] shadow-sm mb-8">
              <MessageSquare className="h-4 w-4 text-[#b5cdac]" />
              <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium text-white/80 tracking-wide">AI Chat</span>
            </div>
            <h2 className="font-[family-name:var(--font-instrument)] text-[48px] lg:text-[56px] text-white leading-[1.05] max-w-[550px] mb-6 font-normal tracking-[-0.01em]">
              Talk to your repositories naturally.
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[17px] text-[#a1a1aa] leading-[1.6] max-w-[500px] mb-10">
              Ask questions, understand relationships, and explore codebases instantly with context-aware answers.
            </p>
            <Link href="#" className="group inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] font-medium text-[#e3e2de] opacity-60 hover:opacity-100 transition-opacity duration-300">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right: Screenshot (60%) */}
        <div className="lg:col-span-7 flex items-center justify-center relative" style={{ perspective: "2000px" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <motion.div ref={mockupRef} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="w-full bg-[#121411] rounded-[16px] border border-[rgba(255,255,255,0.06)] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-row transition-transform duration-700 ease-out h-[650px]">
            {/* Sidebar Mock */}
            <aside className="w-64 border-r border-[rgba(255,255,255,0.04)] bg-[#0a0a0a]/50 flex flex-col hidden md:flex shrink-0">
              <div className="p-5 border-b border-[rgba(255,255,255,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 rounded bg-[#98b090]/10 border border-[#98b090]/20 flex items-center justify-center">
                    <MessageSquare className="h-3.5 w-3.5 text-[#b5cdac]" />
                  </div>
                  <span className="font-[family-name:var(--font-inter)] font-semibold text-[14px] text-[#e3e2de]">Atlas Workspace</span>
                </div>
                <div className="w-full h-8 rounded-lg bg-white/[0.02] border border-[rgba(255,255,255,0.04)] flex items-center px-3 gap-2">
                   <Search className="h-3 w-3 text-white/30" />
                   <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="flex-1 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                   <Terminal className="h-3.5 w-3.5 text-white/40" />
                   <span className="font-[family-name:var(--font-inter)] text-[12px] font-medium text-white/60">Active Context</span>
                </div>
                <div className="flex flex-col gap-3 pl-5 mt-1">
                  <div className="flex items-center gap-2">
                     <FileCode className="h-3.5 w-3.5 text-[#98b090]/70" />
                     <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/50 truncate">checkout_service.go</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <FileCode className="h-3.5 w-3.5 text-[#b5cdac]/50" />
                     <span className="font-[family-name:var(--font-mono)] text-[11px] text-white/50 truncate">stripe_webhook.go</span>
                  </div>
                </div>
              </div>
            </aside>
            <div className="flex-1 flex flex-col bg-[#0a0a0a]/30">
              <div className="h-12 border-b border-[rgba(255,255,255,0.04)] flex items-center px-4 gap-2 bg-white/[0.01]">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="p-6 lg:p-8 flex flex-col gap-8 flex-1 overflow-hidden relative">
                <AnimatePresence>
                  {storyStep >= 1 && (
                    <motion.div key="msg-user" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="flex gap-4 self-end max-w-[80%]">
                      <div className="bg-[#1a1c18] border border-[rgba(255,255,255,0.05)] rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm">
                        <p className="font-[family-name:var(--font-inter)] text-[14px] text-[#e3e2de]">How does the payment flow work?</p>
                      </div>
                    </motion.div>
                  )}
                  {storyStep >= 2 && (
                    <motion.div key="msg-ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="flex gap-4 max-w-[95%]">
                      <div className="w-8 h-8 rounded-full bg-[#98b090]/10 border border-[#98b090]/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Brain className="h-4 w-4 text-[#b5cdac]" />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <span className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-[#e3e2de]">Atlas Assistant</span>
                          <span className="font-[family-name:var(--font-inter)] text-[12px] text-white/30">Just now</span>
                        </div>
                        {storyStep === 2 && (
                           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1 items-center h-4">
                              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" />
                              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "150ms" }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse" style={{ animationDelay: "300ms" }} />
                           </motion.div>
                        )}
                        {storyStep >= 3 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-[family-name:var(--font-inter)] text-[14px] text-[#a1a1aa] leading-[1.6]">
                            The payment lifecycle involves three main services interacting over gRPC. Here's the complete architecture breakdown:
                          </motion.p>
                        )}
                        {storyStep >= 4 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0c] overflow-hidden shadow-sm origin-top">
                            <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] bg-white/[0.01] flex items-center gap-2">
                              <Network className="h-3.5 w-3.5 text-white/30" />
                              <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/50">payment-lifecycle.mermaid</span>
                            </div>
                            <div className="p-5 font-[family-name:var(--font-mono)] text-[13px] text-[#98b090] leading-[1.8] opacity-80 overflow-x-auto whitespace-nowrap">
                              Client -{">"} API Gateway: Initiate Checkout<br/>
                              API Gateway -{">"} Checkout Service: Process Request<br/>
                              Checkout Service -{">"} Stripe API: Create Intent<br/>
                              Stripe API --{">"} Checkout Service: Client Secret<br/>
                              Checkout Service --{">"} Client: Return Token
                            </div>
                          </motion.div>
                        )}
                        {storyStep >= 5 && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-2 mt-4">
                            <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[rgba(255,255,255,0.04)] flex items-center gap-2 hover:bg-white/[0.04] transition-colors cursor-pointer">
                               <Code2 className="h-3.5 w-3.5 text-white/40" />
                               <span className="font-[family-name:var(--font-inter)] text-[12px] text-white/60">checkout_service.go</span>
                            </div>
                            <div className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-[rgba(255,255,255,0.04)] flex items-center gap-2 hover:bg-white/[0.04] transition-colors cursor-pointer">
                               <Code2 className="h-3.5 w-3.5 text-white/40" />
                               <span className="font-[family-name:var(--font-inter)] text-[12px] text-white/60">stripe_webhook.go</span>
                            </div>
                            <div className="h-4 w-[1px] bg-white/10 mx-2" />
                            <div className="px-3 py-1.5 rounded-lg bg-[#b5cdac]/10 border border-[#b5cdac]/20 flex items-center gap-2 hover:bg-[#b5cdac]/20 transition-colors cursor-pointer shadow-sm">
                               <CheckCircle2 className="h-3.5 w-3.5 text-[#b5cdac]" />
                               <span className="font-[family-name:var(--font-inter)] font-medium text-[12px] text-[#b5cdac]">Apply Architecture</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="p-4 border-t border-[rgba(255,255,255,0.04)] bg-[#0a0a0a]/80 backdrop-blur-sm mt-auto z-10">
                 <div className="w-full bg-[#1a1c18] border border-[rgba(255,255,255,0.06)] rounded-xl h-12 flex items-center px-4 shadow-inner">
                    <div className="h-4 w-[2px] bg-[#98b090] animate-pulse rounded-full" />
                    <span className="text-[13px] text-white/30 ml-2 font-[family-name:var(--font-inter)]">Ask Atlas anything...</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// SECTION 2: Documentation (Text Left | Screenshot Right)
// ------------------------------------------------------------------------------------------------
function StorySectionTwo() {
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !mockupRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mockupRef.current.style.transform = `rotateY(${x / 40}deg) rotateX(${-y / 40}deg)`;
  };
  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    mockupRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.06)] overflow-visible flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      
      {/* Node Attached to Global Spine */}
      <TimelineNode icon={FileText} />

      <div className="absolute inset-0 z-0 pointer-events-none rounded-[24px] overflow-hidden">
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] rounded-full bg-[#98b090]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-20 min-h-[600px] items-center">
        
        {/* Left: Content (40%) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 h-[40px] px-4 rounded-full bg-[#121411] border border-[rgba(255,255,255,0.08)] shadow-sm mb-8">
              <FileText className="h-4 w-4 text-[#b5cdac]" />
              <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium text-white/80 tracking-wide">Documentation</span>
            </div>
            <h2 className="font-[family-name:var(--font-instrument)] text-[48px] lg:text-[56px] text-white leading-[1.05] max-w-[550px] mb-6 font-normal tracking-[-0.01em]">
              Generate technical documentation automatically.
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[17px] text-[#a1a1aa] leading-[1.6] max-w-[500px] mb-10">
              Create architecture summaries, API references, and markdown documentation in seconds.
            </p>
            <Link href="#" className="group inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] font-medium text-[#e3e2de] opacity-60 hover:opacity-100 transition-opacity duration-300">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right: Screenshot (60%) */}
        <div className="lg:col-span-7 flex items-center justify-center relative" style={{ perspective: "2000px" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <motion.div ref={mockupRef} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="w-full bg-[#121411] rounded-[16px] border border-[rgba(255,255,255,0.06)] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-row transition-transform duration-700 ease-out h-[600px]">
             
            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-[#0a0a0a]/30">
              <div className="h-12 border-b border-[rgba(255,255,255,0.04)] flex items-center px-4 gap-4 bg-white/[0.01]">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-md border border-[rgba(255,255,255,0.05)]">
                   <FileText className="h-3 w-3 text-white/40" />
                   <span className="font-[family-name:var(--font-inter)] text-[12px] text-white/50">architecture.md</span>
                </div>
              </div>
              
              <div className="p-8 lg:p-12 flex flex-col gap-6 flex-1 overflow-hidden relative">
                 <div className="w-[80%] h-8 bg-white/5 rounded-md" />
                 <div className="w-full h-4 bg-white/[0.02] rounded-sm mt-4" />
                 <div className="w-[90%] h-4 bg-white/[0.02] rounded-sm" />
                 <div className="w-[85%] h-4 bg-white/[0.02] rounded-sm" />
                 
                 <div className="mt-8 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0c0c0c] p-6 shadow-inner">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-12 h-12 rounded-lg bg-[#98b090]/10 border border-[#98b090]/20 flex items-center justify-center">
                          <Server className="h-5 w-5 text-[#b5cdac]" />
                       </div>
                       <div className="flex flex-col gap-2 flex-1">
                         <div className="w-[40%] h-3 bg-white/10 rounded-sm" />
                         <div className="w-[60%] h-2 bg-white/5 rounded-sm" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="h-20 rounded-md border border-[rgba(255,255,255,0.04)] bg-white/[0.02]" />
                       <div className="h-20 rounded-md border border-[rgba(255,255,255,0.04)] bg-white/[0.02]" />
                    </div>
                 </div>

                 <div className="w-[70%] h-4 bg-white/[0.02] rounded-sm mt-8" />
                 <div className="w-[60%] h-4 bg-white/[0.02] rounded-sm" />
              </div>
            </div>

            {/* Right Context Panel */}
            <aside className="w-64 border-l border-[rgba(255,255,255,0.04)] bg-[#0a0a0a]/50 flex flex-col hidden md:flex shrink-0">
               <div className="p-5 border-b border-[rgba(255,255,255,0.04)] flex items-center gap-2">
                 <Layers className="h-3.5 w-3.5 text-white/40" />
                 <span className="font-[family-name:var(--font-inter)] text-[12px] font-medium text-white/60">Doc Outline</span>
               </div>
               <div className="flex flex-col p-5 gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#b5cdac]" />
                    <div className="w-[60%] h-2 bg-white/10 rounded-sm" />
                 </div>
                 <div className="flex items-center gap-2 pl-4">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="w-[70%] h-2 bg-white/5 rounded-sm" />
                 </div>
                 <div className="flex items-center gap-2 pl-4">
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="w-[50%] h-2 bg-white/5 rounded-sm" />
                 </div>
                 <div className="flex items-center gap-2 mt-4">
                    <div className="w-1 h-1 rounded-full bg-[#b5cdac]" />
                    <div className="w-[80%] h-2 bg-white/10 rounded-sm" />
                 </div>
               </div>
            </aside>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// SECTION 3: Repository Explorer (Text Left | Screenshot Right)
// ------------------------------------------------------------------------------------------------
function StorySectionThree() {
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !mockupRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mockupRef.current.style.transform = `rotateY(${x / 40}deg) rotateX(${-y / 40}deg)`;
  };
  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    mockupRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.06)] overflow-visible flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      
      {/* Node Attached to Global Spine */}
      <TimelineNode icon={FolderTree} />

      <div className="absolute inset-0 z-0 pointer-events-none rounded-[24px] overflow-hidden">
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-[#98b090]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-20 min-h-[600px] items-center">
        
        {/* Left: Content (40%) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 h-[40px] px-4 rounded-full bg-[#121411] border border-[rgba(255,255,255,0.08)] shadow-sm mb-8">
              <FolderTree className="h-4 w-4 text-[#b5cdac]" />
              <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium text-white/80 tracking-wide">Repository Explorer</span>
            </div>
            <h2 className="font-[family-name:var(--font-instrument)] text-[48px] lg:text-[56px] text-white leading-[1.05] max-w-[550px] mb-6 font-normal tracking-[-0.01em]">
              Navigate complex codebases effortlessly.
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[17px] text-[#a1a1aa] leading-[1.6] max-w-[500px] mb-10">
              Understand project structure and discover relationships through an intelligent explorer.
            </p>
            <Link href="#" className="group inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] font-medium text-[#e3e2de] opacity-60 hover:opacity-100 transition-opacity duration-300">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right: Screenshot (60%) */}
        <div className="lg:col-span-7 flex items-center justify-center relative" style={{ perspective: "2000px" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <motion.div ref={mockupRef} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="w-full bg-[#121411] rounded-[16px] border border-[rgba(255,255,255,0.06)] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-transform duration-700 ease-out h-[600px]">
            {/* Header */}
            <div className="h-12 border-b border-[rgba(255,255,255,0.04)] flex items-center px-4 gap-4 bg-white/[0.01]">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
            </div>
            
            <div className="flex-1 flex flex-row bg-[#0a0a0a]/30">
               {/* Repo Tree Panel */}
               <aside className="w-64 border-r border-[rgba(255,255,255,0.04)] bg-transparent flex flex-col hidden md:flex shrink-0 p-5">
                 <div className="flex items-center gap-2 mb-6">
                    <Database className="h-4 w-4 text-[#98b090]" />
                    <span className="font-[family-name:var(--font-inter)] text-[13px] font-semibold text-white/80">CodeAtlas-AI</span>
                 </div>
                 {/* Tree structure */}
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                       <FolderTree className="h-3 w-3 text-white/30" />
                       <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/50">backend/</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                       <FileCode className="h-3 w-3 text-[#b5cdac]/70" />
                       <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/70">main.py</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                       <FileCode className="h-3 w-3 text-white/30" />
                       <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/40">models.py</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                       <FolderTree className="h-3 w-3 text-white/30" />
                       <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/50">frontend/</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                       <FolderTree className="h-3 w-3 text-white/30" />
                       <span className="font-[family-name:var(--font-mono)] text-[12px] text-white/40">src/</span>
                    </div>
                 </div>
               </aside>
               
               {/* Main Canvas - Dependency Graph Mock */}
               <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                  
                  {/* Graph Nodes Mock */}
                  <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
                     {/* Center Node */}
                     <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-16 h-16 rounded-xl bg-[#121411] border border-[#b5cdac]/40 shadow-[0_0_20px_rgba(181,205,172,0.2)] flex items-center justify-center z-20">
                        <Database className="h-6 w-6 text-[#b5cdac]" />
                     </div>

                     {/* Satellite Nodes */}
                     <div className="absolute top-[10%] left-[20%] w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center z-20">
                        <Server className="h-4 w-4 text-white/40" />
                     </div>
                     <div className="absolute top-[80%] left-[15%] w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center z-20">
                        <Terminal className="h-4 w-4 text-white/40" />
                     </div>
                     <div className="absolute top-[30%] right-[10%] w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center z-20">
                        <Code2 className="h-4 w-4 text-white/40" />
                     </div>

                     {/* SVG Lines */}
                     <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: 'visible' }}>
                        <path d="M 50 50 Q 150 150 200 200" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                        <path d="M 200 200 Q 250 300 100 350" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                        <path d="M 200 200 Q 300 150 350 150" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                     </svg>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// SECTION 4: Insights (Text Left | Screenshot Right)
// ------------------------------------------------------------------------------------------------
function StorySectionFour() {
  const mockupRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !mockupRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mockupRef.current.style.transform = `rotateY(${x / 40}deg) rotateX(${-y / 40}deg)`;
  };
  const handleMouseLeave = () => {
    if (!mockupRef.current) return;
    mockupRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.06)] overflow-visible flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      
      {/* Node Attached to Global Spine */}
      <TimelineNode icon={Activity} />

      <div className="absolute inset-0 z-0 pointer-events-none rounded-[24px] overflow-hidden">
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-[#98b090]/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 p-8 lg:p-20 min-h-[600px] items-center">
        
        {/* Left: Content (40%) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: "easeOut" }}>
            <div className="inline-flex items-center gap-2 h-[40px] px-4 rounded-full bg-[#121411] border border-[rgba(255,255,255,0.08)] shadow-sm mb-8">
              <Activity className="h-4 w-4 text-[#b5cdac]" />
              <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium text-white/80 tracking-wide">Insights</span>
            </div>
            <h2 className="font-[family-name:var(--font-instrument)] text-[48px] lg:text-[56px] text-white leading-[1.05] max-w-[550px] mb-6 font-normal tracking-[-0.01em]">
              Understand dependencies and architecture.
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[17px] text-[#a1a1aa] leading-[1.6] max-w-[500px] mb-10">
              Analyze complexity, dependencies, and project health to make better decisions.
            </p>
            <Link href="#" className="group inline-flex items-center gap-2 font-[family-name:var(--font-inter)] text-[15px] font-medium text-[#e3e2de] opacity-60 hover:opacity-100 transition-opacity duration-300">
              Learn more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Right: Screenshot (60%) */}
        <div className="lg:col-span-7 flex items-center justify-center relative" style={{ perspective: "2000px" }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <motion.div ref={mockupRef} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="w-full bg-[#121411] rounded-[16px] border border-[rgba(255,255,255,0.06)] shadow-[0_15px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col transition-transform duration-700 ease-out h-[600px]">
             
            <div className="h-12 border-b border-[rgba(255,255,255,0.04)] flex items-center px-4 gap-4 bg-white/[0.01]">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
            </div>

            <div className="flex-1 flex flex-col p-8 bg-[#0a0a0a]/30 gap-6">
               <div className="flex items-center gap-4">
                  <div className="flex-1 h-24 rounded-xl border border-[rgba(255,255,255,0.04)] bg-white/[0.02] p-5 flex flex-col justify-between">
                     <span className="text-[11px] font-[family-name:var(--font-inter)] text-white/40 uppercase tracking-widest">Health Score</span>
                     <span className="text-3xl font-[family-name:var(--font-instrument)] text-[#b5cdac]">98%</span>
                  </div>
                  <div className="flex-1 h-24 rounded-xl border border-[rgba(255,255,255,0.04)] bg-white/[0.02] p-5 flex flex-col justify-between">
                     <span className="text-[11px] font-[family-name:var(--font-inter)] text-white/40 uppercase tracking-widest">Dependencies</span>
                     <span className="text-3xl font-[family-name:var(--font-instrument)] text-white">142</span>
                  </div>
                  <div className="flex-1 h-24 rounded-xl border border-[rgba(255,255,255,0.04)] bg-white/[0.02] p-5 flex flex-col justify-between">
                     <span className="text-[11px] font-[family-name:var(--font-inter)] text-white/40 uppercase tracking-widest">Complexity</span>
                     <span className="text-3xl font-[family-name:var(--font-instrument)] text-[#e3e2de]">A+</span>
                  </div>
               </div>

               <div className="flex-1 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[#0c0c0c] p-6 relative overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                     <span className="font-[family-name:var(--font-inter)] text-[13px] font-medium text-white/60">Complexity Trends</span>
                     <BarChart3 className="h-4 w-4 text-white/20" />
                  </div>
                  {/* Mock Chart Area */}
                  <div className="flex-1 flex items-end justify-between gap-2 px-4 pb-4">
                     {[40, 55, 30, 45, 70, 60, 40, 50, 35, 45].map((height, i) => (
                       <div key={i} className="w-full bg-[#98b090]/20 rounded-t-sm relative group">
                          <motion.div 
                             initial={{ height: 0 }} 
                             whileInView={{ height: `${height}%` }} 
                             viewport={{ once: true }} 
                             transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                             className="absolute bottom-0 left-0 right-0 bg-[#b5cdac]/80 rounded-t-sm"
                          />
                       </div>
                     ))}
                  </div>
               </div>
            </div>

          </motion.div>
        </div>

      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// CTA SECTION
// ------------------------------------------------------------------------------------------------
function CTASection() {
  return (
    <div className="relative w-full bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.06)] overflow-hidden flex flex-col items-center justify-center py-32 lg:py-48 shadow-[0_0_80px_rgba(0,0,0,0.8)] mt-12">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[60%] h-[60%] rounded-full bg-[#98b090]/[0.05] blur-[150px]" />
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-100px" }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <h2 className="font-[family-name:var(--font-instrument)] text-[56px] lg:text-[72px] text-white leading-[1.05] max-w-[800px] mb-6 font-normal tracking-[-0.02em]">
          Everything you need to understand your codebase.
        </h2>
        <p className="font-[family-name:var(--font-inter)] text-[18px] lg:text-[20px] text-[#a1a1aa] leading-[1.6] mb-12 font-light tracking-wide">
          Start exploring today.
        </p>
        
        <button className="h-[52px] px-8 bg-white text-black rounded-full font-[family-name:var(--font-inter)] text-[15px] font-semibold tracking-wide hover:bg-[#e3e2de] hover:scale-[1.02] transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center gap-2 group">
          Get Started for Free
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}
