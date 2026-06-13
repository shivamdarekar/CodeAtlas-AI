"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Zap, Code, Database, Terminal, Send, Search as SearchIcon, MessageSquare, FileText, Folder } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { Navbar } from "@/layout/Navbar";

const springTransition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: springTransition,
  },
};

const MOCK_REPOS = [
  {
    id: "api-gateway",
    name: "acme-corp / api-gateway",
    lang: "Go",
    time: "3d ago",
    query: "Explain the auth data flow...",
    insightTitle: "Security Insight",
    insightText: "Detected potential JWT token leakage in /middleware/auth.go. Consider using HttpOnly cookies.",
    docFile: "Architecture.md",
    docTitle: "Gateway Architecture",
    docContent: "The API gateway is built in Go using Gin. It routes traffic to microservices, handling rate limiting, authentication, and logging centrally.",
    docCode: "router.Use(auth.Middleware())\nrouter.GET(\"/api/v1/users\", handlers.GetUsers)"
  },
  {
    id: "frontend-mono",
    name: "startup-inc / frontend-mono",
    lang: "TypeScript",
    time: "2h ago",
    query: "How does the UI state sync?",
    insightTitle: "Performance Insight",
    insightText: "Multiple re-renders detected in <Dashboard />. Consider memoizing the selector in useUIStore.",
    docFile: "State_Management.md",
    docTitle: "Frontend State",
    docContent: "We use Zustand for global state management to ensure seamless synchronization across components without excessive boilerplate.",
    docCode: "export const useUIStore = create((set) => ({\n  theme: 'dark',\n  setTheme: (t) => set({ theme: t })\n}));"
  },
  {
    id: "payment-engine",
    name: "stripe / payment-engine",
    lang: "Rust",
    time: "5m ago",
    query: "Analyze webhook concurrency...",
    insightTitle: "Concurrency Insight",
    insightText: "Potential race condition in webhook worker pool. Ensure Mutex lock is released early.",
    docFile: "Webhooks.md",
    docTitle: "Webhook Handling",
    docContent: "Webhooks are processed asynchronously using a Tokio worker pool to ensure high throughput and resilience against traffic spikes.",
    docCode: "tokio::spawn(async move {\n  let event = queue.pop().await;\n  process_webhook(event).await;\n});"
  }
];

export function HeroSection() {
  const reduce = useReducedMotion();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'repos' | 'docs'>('chat');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [storyStep, setStoryStep] = useState(0);
  const [activeRepoIndex, setActiveRepoIndex] = useState(0);
  const [chatQuery, setChatQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Advanced Storyboard Sequencer
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    let timeout: NodeJS.Timeout;
    
    if (storyStep === 0) {
      setActiveTab('repos');
      timeout = setTimeout(() => setStoryStep(1), 1500); // Highlight current
    } else if (storyStep === 1) {
      setActiveRepoIndex((prev) => (prev + 1) % MOCK_REPOS.length);
      timeout = setTimeout(() => setStoryStep(2), 1500); // Highlight new
    } else if (storyStep === 2) {
      setActiveTab('chat');
      timeout = setTimeout(() => setStoryStep(3), 800); // Switch to chat
    } else if (storyStep === 3) {
      timeout = setTimeout(() => setStoryStep(4), 2000); // Simulate typing
    } else if (storyStep === 4) {
      timeout = setTimeout(() => setStoryStep(5), 3000); // Show AI insight
    } else if (storyStep === 5) {
      setActiveTab('docs');
      timeout = setTimeout(() => setStoryStep(6), 1000); // Switch to docs
    } else if (storyStep === 6) {
      timeout = setTimeout(() => setStoryStep(0), 4000); // Generate doc, loop
    }

    return () => clearTimeout(timeout);
  }, [storyStep, isAutoPlaying]);

  // Typing effect for Chat Input
  useEffect(() => {
    if (storyStep === 3) {
      const text = MOCK_REPOS[activeRepoIndex].query;
      let i = 0;
      setChatQuery("");
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          setChatQuery(prev => prev + text.charAt(i));
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
      return () => clearInterval(typeInterval);
    } else if (storyStep < 3) {
      setChatQuery("");
    }
  }, [storyStep, activeRepoIndex]);

  // Parallax Hover Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 1024 || !dashboardRef.current) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
    dashboardRef.current.style.transform = `rotateY(${xAxis}deg) rotateX(${-yAxis}deg)`;
  };

  const handleMouseLeave = () => {
    if (!dashboardRef.current) return;
    dashboardRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  return (
    <div className="w-full bg-[#050505] min-h-screen relative pt-[98px] pb-[120px]">
      <Navbar />

      <section 
        className="relative flex w-[96%] max-w-[1536px] mx-auto min-h-[120vh] flex-col items-center overflow-hidden bg-[#0a0a0a] rounded-[24px] border border-[rgba(255,255,255,0.02)]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
      {/* Layer 0: Atlas illustration */}
      <div className="absolute inset-0 z-[0] pointer-events-none">
        <Image 
          src="/hero-bg.png" 
          alt="CodeAtlas Background" 
          fill
          priority
          className="object-cover object-center"
          quality={100}
        />
      </div>

      {/* Layer 1: Dark gradient overlay */}
      <div className="absolute inset-0 z-[10] pointer-events-none bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a] opacity-90 mix-blend-multiply" />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center justify-start text-center px-4 pt-[140px]">
        {/* Layer 4: Floating Particles - Rendered client-side only */}
        {mounted && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#CCD67F]/20 blur-[1px]"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.1, 0.4, 0.1],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        <motion.div
          variants={reduce ? undefined : container}
          initial="hidden"
          animate="show"
          className="relative z-10 flex flex-col items-center w-full"
        >
          {/* Badge */}
          <motion.div variants={reduce ? undefined : item} className="mb-6 inline-block">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#98b090]/30 bg-[#98b090]/10 backdrop-blur-md">
              <Zap className="h-4 w-4 text-[#b5cdac]" />
              <span className="text-xs font-semibold text-[#b5cdac] tracking-wide">
                ATLAS ENGINE V2.0
              </span>
            </div>
          </motion.div>

        {/* Headline */}
        <motion.h1
          variants={reduce ? undefined : item}
          className="font-[family-name:var(--font-instrument)] text-[64px] text-white mb-8 leading-[1.1] tracking-[-0.02em] max-w-[800px] font-normal"
        >
          Understand any codebase <span className="italic opacity-80 text-[#e3e2de]">in seconds.</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={reduce ? undefined : item}
          className="font-[family-name:var(--font-inter)] text-[18px] text-[#a1a1aa] max-w-[500px] mb-10 leading-[1.6]"
        >
          Explore repositories, generate documentation, and chat with your code using context-aware AI. Built for high-performance engineering teams.
        </motion.p>

        {/* Layer 5: Actions */}
        <motion.div
          variants={reduce ? undefined : item}
          className="relative z-[50] flex flex-col sm:flex-row gap-4 mb-[100px] items-center"
        >
          <Button
            size="lg"
            className="group h-[60px] rounded-xl bg-[#F3E4C9] text-black hover:bg-white px-[32px] font-medium text-[15px] transition-all"
            asChild
          >
            <Link href="/analyze">
              Start Free 
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-[60px] rounded-xl border border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/5 px-[32px] font-medium text-[15px] transition-all"
            asChild
          >
            <Link href="https://github.com/surajyadav04/CodeAtlas-AI" target="_blank">
              View Demo
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Social Proof */}
      <motion.div variants={reduce ? undefined : item} className="opacity-70 mb-24 relative z-[40]">
          <p className="font-sans text-xs uppercase text-[#c4c8be] mb-6 tracking-[0.2em] font-semibold">
            Trusted by developers at:
          </p>
          <div className="flex flex-wrap justify-center gap-10 grayscale opacity-80">
            <div className="flex items-center gap-2 text-[#e3e2de] hover:opacity-100 transition-opacity"><Terminal className="h-6 w-6"/><span className="font-bold text-xl">GitHub</span></div>
            <div className="flex items-center gap-2 text-[#e3e2de] hover:opacity-100 transition-opacity"><div className="w-6 h-6 border-2 border-current rounded-full flex items-center justify-center"><div className="w-0 h-0 border-l-4 border-r-4 border-b-[6px] border-l-transparent border-r-transparent border-b-current" /></div><span className="font-bold text-xl">Vercel</span></div>
            <div className="flex items-center gap-2 text-[#e3e2de] hover:opacity-100 transition-opacity"><Database className="h-6 w-6"/><span className="font-bold text-xl">Supabase</span></div>
            <div className="flex items-center gap-2 text-[#e3e2de] hover:opacity-100 transition-opacity"><Code className="h-6 w-6"/><span className="font-bold text-xl">Railway</span></div>
          </div>
        </motion.div>
      </div>

      {/* Layer 6: Dashboard Preview */}
      <motion.div 
        variants={reduce ? undefined : item}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-[60] w-[80vw] max-w-[1150px] pb-[120px]"
        style={{ perspective: "2000px" }}
      >
        <div 
          ref={dashboardRef}
          className="bg-[#121411]/80 backdrop-blur-[32px] border border-[rgba(255,255,255,0.08)] rounded-[16px] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] flex h-[500px] transition-transform duration-700 ease-out"
        >
          {/* Sidebar */}
          <aside className="w-64 border-r border-white/5 bg-white/5 flex flex-col p-6 gap-4 hidden md:flex">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 rounded-lg bg-[#98b090]/20 border border-[#98b090]/40 flex items-center justify-center shadow-[0_0_15px_rgba(152,176,144,0.2)]">
                <SearchIcon className="h-4 w-4 text-[#b5cdac]" />
              </div>
              <span className="font-bold text-base text-[#e3e2de]">Atlas Dev</span>
            </div>
            
            <nav className="flex flex-col gap-2">
              <div 
                onClick={() => { setActiveTab('repos'); setIsAutoPlaying(false); }}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'repos' ? 'bg-[#98b090]/15 text-[#b5cdac] border border-[#98b090]/20 shadow-sm' : 'text-[#c4c8be] hover:bg-white/5 hover:text-[#e3e2de]'}`}
              >
                <Folder className="h-4 w-4" />
                <span className="text-sm font-medium">Repositories</span>
              </div>
              <div 
                onClick={() => { setActiveTab('chat'); setIsAutoPlaying(false); }}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'chat' ? 'bg-[#98b090]/15 text-[#b5cdac] border border-[#98b090]/20 shadow-sm' : 'text-[#c4c8be] hover:bg-white/5 hover:text-[#e3e2de]'}`}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm font-medium">AI Chat</span>
              </div>
              <div 
                onClick={() => { setActiveTab('docs'); setIsAutoPlaying(false); }}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer ${activeTab === 'docs' ? 'bg-[#98b090]/15 text-[#b5cdac] border border-[#98b090]/20 shadow-sm' : 'text-[#c4c8be] hover:bg-white/5 hover:text-[#e3e2de]'}`}
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Docs Gen</span>
              </div>
            </nav>
          </aside>

          {/* CHAT TAB */}
          {activeTab === 'chat' && (
            <>
              <section className="flex-1 flex flex-col p-8 relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto opacity-90">
                  <div className="w-20 h-20 bg-[#d2b48c]/10 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(210,180,140,0.15)] border border-[#d2b48c]/20">
                    <Zap className="h-10 w-10 text-[#d2b48c] fill-current" />
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-5xl mb-4 text-[#e3e2de]">Ask about your code</h3>
                  <p className="text-[#c4c8be] text-lg mb-12">How can I help you navigate your repository today?</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group">
                      <p className="text-sm font-semibold mb-1 text-[#e3e2de] group-hover:text-[#b5cdac] transition-colors">Explain Architecture</p>
                      <p className="text-xs text-[#8e9289]">Understand the data flow of this repo.</p>
                    </div>
                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer border border-white/10 group">
                      <p className="text-sm font-semibold mb-1 text-[#e3e2de] group-hover:text-[#b5cdac] transition-colors">Refactor Auth</p>
                      <p className="text-xs text-[#8e9289]">Find bottlenecks in the auth module.</p>
                    </div>
                  </div>
                </div>
                
                {/* Input Bar */}
                <div className="mt-8 relative z-10">
                  <div className={`bg-white/5 backdrop-blur-xl p-2 rounded-full flex items-center gap-4 border transition-colors duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.5)] ${storyStep >= 3 ? 'border-[#98b090]/60 shadow-[0_0_20px_rgba(152,176,144,0.2)]' : 'border-[#98b090]/40'}`}>
                    <Search className="h-5 w-5 text-[#8e9289] ml-5" />
                    <input 
                      className="bg-transparent border-none focus:ring-0 text-base flex-1 text-[#e3e2de] outline-none placeholder-[#8e9289]" 
                      placeholder="Search files or ask AI..." 
                      type="text" 
                      value={chatQuery}
                      disabled
                    />
                    <button className={`text-[#0a0a0a] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${storyStep >= 4 ? 'bg-[#b5cdac] scale-105 shadow-[0_0_20px_rgba(181,205,172,0.6)]' : 'bg-[#98b090] shadow-[0_0_15px_rgba(152,176,144,0.4)]'}`}>
                      <Send className="h-5 w-5 ml-[-2px] mt-[2px]" />
                    </button>
                  </div>
                </div>
              </section>

              <aside className="w-80 border-l border-white/5 bg-white/5 p-8 hidden lg:flex flex-col gap-10">
                <div>
                  <h4 className="font-sans text-xs text-[#8e9289] font-bold uppercase tracking-[0.15em] mb-6">Context</h4>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                      <span className="text-[#c4c8be]">Language</span>
                      <span className="text-[#d2b48c] bg-[#d2b48c]/10 px-2 py-1 rounded-md text-xs font-semibold">{MOCK_REPOS[activeRepoIndex].lang}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                      <span className="text-[#c4c8be]">Framework</span>
                      <span className="text-[#d2b48c] bg-[#d2b48c]/10 px-2 py-1 rounded-md text-xs font-semibold">Native</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                      <span className="text-[#c4c8be]">Last Indexed</span>
                      <span className="text-[#e3e2de] font-mono text-xs">{MOCK_REPOS[activeRepoIndex].time}</span>
                    </div>
                  </div>
                </div>
                
                {storyStep >= 4 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-[#98b090]/10 to-transparent border border-[#98b090]/20 shadow-inner relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#98b090]/10 blur-[30px] rounded-full" />
                    <p className="text-xs text-[#b5cdac] font-bold mb-3 flex items-center gap-2 relative z-10">
                      <SparklesIcon className="h-4 w-4" />
                      {MOCK_REPOS[activeRepoIndex].insightTitle}
                    </p>
                    <p className="text-sm text-[#e3e2de] leading-relaxed relative z-10">
                      {MOCK_REPOS[activeRepoIndex].insightText}
                    </p>
                  </motion.div>
                )}
              </aside>
            </>
          )}

          {/* REPOS TAB */}
          {activeTab === 'repos' && (
            <>
              <section className="flex-1 flex flex-col p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-[#e3e2de] font-[family-name:var(--font-display)]">Your Repositories</h3>
                  <Button className="bg-[#98b090] text-[#0a0a0a] hover:bg-[#b5cdac] rounded-full text-sm h-9 px-5 font-semibold transition-colors">Connect GitHub</Button>
                </div>
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {MOCK_REPOS.map((repo, idx) => (
                    <div 
                      key={repo.id}
                      onClick={() => { setActiveRepoIndex(idx); setIsAutoPlaying(false); }}
                      className={`bg-white/5 border ${activeRepoIndex === idx ? 'border-[#b5cdac]/50 shadow-[0_0_20px_rgba(181,205,172,0.1)] opacity-100' : 'border-white/10 opacity-50'} rounded-xl p-5 transition-all duration-500 cursor-pointer flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center"><Folder className="h-6 w-6 text-[#c4c8be]" /></div>
                        <div>
                          <h4 className="font-semibold text-lg text-[#e3e2de]">{repo.name}</h4>
                          <p className="text-sm text-[#8e9289] mt-1">{repo.lang} • Updated {repo.time}</p>
                        </div>
                      </div>
                      <div className="text-xs text-[#b5cdac] bg-[#b5cdac]/10 px-3 py-1 rounded-full font-medium">Indexed</div>
                    </div>
                  ))}
                </div>
              </section>
              <aside className="w-80 border-l border-white/5 bg-white/5 p-8 hidden lg:flex flex-col gap-10">
                <div className="p-5 rounded-xl bg-gradient-to-br from-[#d2b48c]/10 to-transparent border border-[#d2b48c]/20 shadow-inner relative overflow-hidden">
                  <p className="text-xs text-[#d2b48c] font-bold mb-3 flex items-center gap-2 relative z-10">
                    <Zap className="h-4 w-4" />
                    Repository Sync
                  </p>
                  <p className="text-sm text-[#e3e2de] leading-relaxed relative z-10">
                    CodeAtlas automatically indexes your repositories on every push. Connect your GitHub account to enable continuous synchronization.
                  </p>
                </div>
              </aside>
            </>
          )}

          {/* DOCS TAB */}
          {activeTab === 'docs' && (
            <>
              <section className="flex-1 flex flex-col p-8 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="h-6 w-6 text-[#b5cdac]" />
                  <h3 className="text-3xl font-bold text-[#e3e2de] font-[family-name:var(--font-display)]">Documentation Generator</h3>
                </div>
                <div className="flex-1 bg-[#0a0a0a]/50 rounded-xl border border-white/5 flex overflow-hidden">
                  <div className="w-48 border-r border-white/5 p-4 bg-white/5">
                    <div className="text-xs font-semibold text-[#8e9289] uppercase tracking-wider mb-4">Generated Docs</div>
                    <div className="flex flex-col gap-3">
                      <div className="text-sm font-medium text-[#b5cdac] cursor-pointer">{MOCK_REPOS[activeRepoIndex].docFile}</div>
                      <div className="text-sm font-medium text-[#c4c8be] hover:text-[#e3e2de] transition-colors cursor-pointer">API_Routes.md</div>
                      <div className="text-sm font-medium text-[#c4c8be] hover:text-[#e3e2de] transition-colors cursor-pointer">Components.md</div>
                    </div>
                  </div>
                  <div className="flex-1 p-8 overflow-y-auto relative">
                    {storyStep >= 6 ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.5 } }}>
                        <h1 className="text-2xl font-bold text-[#e3e2de] mb-4 border-b border-white/10 pb-3">{MOCK_REPOS[activeRepoIndex].docTitle}</h1>
                        <p className="text-base text-[#c4c8be] mb-6 leading-relaxed">
                          {MOCK_REPOS[activeRepoIndex].docContent}
                        </p>
                        <div className="bg-black/60 rounded-xl p-5 font-mono text-sm text-[#d2b48c] border border-white/5 leading-loose whitespace-pre-wrap">
                          {MOCK_REPOS[activeRepoIndex].docCode}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col gap-4 animate-pulse pt-2">
                        <div className="h-8 bg-white/5 rounded-md w-1/3 mb-4"></div>
                        <div className="h-4 bg-white/5 rounded-md w-full"></div>
                        <div className="h-4 bg-white/5 rounded-md w-11/12"></div>
                        <div className="h-4 bg-white/5 rounded-md w-4/5"></div>
                        <div className="h-32 bg-white/5 rounded-xl w-full mt-6"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 text-[#c4c8be] font-medium text-sm">
                            <SparklesIcon className="h-4 w-4 animate-spin text-[#b5cdac]" />
                            Generating Docs...
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <aside className="w-80 border-l border-white/5 bg-white/5 p-8 hidden lg:flex flex-col gap-10">
                <div>
                  <h4 className="font-sans text-xs text-[#8e9289] font-bold uppercase tracking-[0.15em] mb-6">Doc Details</h4>
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                      <span className="text-[#c4c8be]">Format</span>
                      <span className="text-[#d2b48c] bg-[#d2b48c]/10 px-2 py-1 rounded-md text-xs font-semibold">Markdown</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pb-4 border-b border-white/5">
                      <span className="text-[#c4c8be]">Auto-sync</span>
                      <span className="text-[#b5cdac] bg-[#b5cdac]/10 px-2 py-1 rounded-md text-xs font-semibold">Enabled</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full bg-white/10 hover:bg-white/20 text-[#e3e2de] border border-white/20 transition-colors">
                  Export as PDF
                </Button>
              </aside>
            </>
          )}
        </div>
      </motion.div>
    </section>
  </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
