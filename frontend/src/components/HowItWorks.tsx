"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronRight, Terminal, RefreshCw } from "lucide-react";

const steps = [
  {
    id: "step-1",
    num: "01",
    title: "Connect Repository",
    description: "Provide a public GitHub URL. The scanner clones the environment safely without altering your source.",
    codeSnippet: "$ codeatlas init https://github.com/user/repo\n> Cloning environment...\n> Resolving dependencies...\n> Ready for parsing.",
  },
  {
    id: "step-2",
    num: "02",
    title: "Structural Indexing",
    description: "Logic files are parsed into abstract syntax trees, mapping dependencies and data flows across the entire architecture.",
    codeSnippet: "$ codeatlas parse --deep\n> Building AST...\n> Found 1,204 functions\n> Mapping dependency graph: 100%\n> Complete.",
  },
  {
    id: "step-3",
    num: "03",
    title: "Vector Storage",
    description: "Semantic chunks are embedded into high-dimensional space and stored in Pinecone for instant, latency-free retrieval.",
    codeSnippet: "$ codeatlas embed --model text-embedding-3-small\n> Generating embeddings...\n> Upserting 4,500 vectors to Pinecone index\n> Storage complete in 2.4s.",
  },
  {
    id: "step-4",
    num: "04",
    title: "Query & Synthesize",
    description: "Ask complex architectural questions. Groq retrieves exact context and delivers precise, actionable engineering answers.",
    codeSnippet: "$ codeatlas query \"How is authentication handled?\"\n> Retrieving context (12ms)\n> Groq inference running...\n> Auth relies on NextAuth in src/lib/auth.ts.\n> Uses JWT session strategy.",
  },
];

// Custom typewriter component for the terminal effect
const Typewriter = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const [displayedText, setDisplayedText] = useState("");
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first interaction to comply with browser autoplay policies
  useEffect(() => {
    const handleInteraction = () => {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
    };
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const playKeystroke = () => {
    // Haptic feedback (vibration) for supported mobile devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate(5); } catch(e) {}
    }

    // Realistic mechanical keyboard click using filtered noise burst
    if (audioCtxRef.current && audioCtxRef.current.state === "running") {
      try {
        const ctx = audioCtxRef.current;
        
        // 1. Create a very short white noise buffer (40ms)
        const bufferSize = ctx.sampleRate * 0.04;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        
        // 2. Bandpass filter to shape the noise into a "clack"
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        // Randomize frequency slightly (1200Hz to 2000Hz) to sound like different keys
        filter.frequency.value = 1200 + Math.random() * 800;
        filter.Q.value = 1.5; // Slightly resonant
        
        // 3. Sharp volume envelope
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        
        // Connect nodes
        noiseSource.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Play
        noiseSource.start(ctx.currentTime);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!isActive) return;
    
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      const char = text.charAt(i);
      setDisplayedText(text.slice(0, i + 1));
      
      // Play sound/vibrate only on non-whitespace characters to simulate realistic typing
      // and randomly skip some to prevent it from sounding like a machine gun
      if (char.trim() !== "" && Math.random() > 0.3) {
        playKeystroke();
      }

      i++;
      if (i >= text.length) clearInterval(interval);
    }, 20); // typing speed

    return () => clearInterval(interval);
  }, [text, isActive]);

  return <>{displayedText}{isActive && displayedText.length < text.length && <span className="animate-pulse">_</span>}</>;
};

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [terminalState, setTerminalState] = useState<"open" | "minimized" | "maximized" | "closed">("open");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const reduce = useReducedMotion();
  const constraintsRef = useRef(null);

  useEffect(() => {
    if (!isAutoPlaying || terminalState === "closed" || terminalState === "maximized") return;

    const currentStepData = steps[activeStep];
    const typingTime = currentStepData.codeSnippet.length * 20;
    const totalTime = typingTime + 4000; // Extra 4 seconds to read before auto-advancing

    const timer = setTimeout(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, totalTime);

    return () => clearTimeout(timer);
  }, [activeStep, isAutoPlaying, terminalState]);

  const handleTerminalClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState("closed");
  };

  const handleTerminalMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState(terminalState === "minimized" ? "open" : "minimized");
  };

  const handleTerminalMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminalState(terminalState === "maximized" ? "open" : "maximized");
  };

  return (
    <section id="workflow" className="relative py-32 bg-[#0C0A09] border-t border-[#8A5F41]/10">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span
            className="font-mono text-[11px] font-medium uppercase text-[#A77F60] inline-block mb-4 px-3 py-1 rounded-full border border-[#8A5F41]/20 bg-[#1C1917]/50"
            style={{ letterSpacing: "var(--tracking-caps)" }}
          >
            The Workflow
          </span>
          <h2
            className="font-[family-name:var(--font-display)] text-3xl font-medium tracking-tight text-[#F3E4C9] sm:text-4xl"
            style={{ lineHeight: "var(--leading-heading)" }}
          >
            Four steps to complete clarity
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#A77F60]">
            A deterministic process turning raw code into architectural understanding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start relative">
          
          {/* Interactive Stepper Navigation */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setActiveStep(index);
                    setIsAutoPlaying(false);
                    if (terminalState === "closed") setTerminalState("open");
                  }}
                  className={`group relative overflow-hidden w-full text-left rounded-2xl p-6 transition-all duration-300 border ${
                    isActive 
                      ? "bg-[#1C1917] border-[#8A5F41]/40 shadow-lg" 
                      : "bg-transparent border-transparent hover:bg-[#1C1917]/40 hover:border-[#8A5F41]/10"
                  }`}
                >
                  {/* Active Indicator Glow */}
                  {isActive && (
                    <motion.div
                      layoutId="activeGlow"
                      className="absolute -left-px top-6 bottom-6 w-[2px] rounded-full bg-[#CCD67F] shadow-[0_0_10px_#CCD67F]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex gap-6 items-start">
                      <span className={`font-mono text-sm pt-1 transition-colors ${isActive ? "text-[#CCD67F]" : "text-[#A77F60]"}`}>
                        {step.num}
                      </span>
                      <div>
                        <h3 className={`font-[family-name:var(--font-display)] text-xl font-medium transition-colors ${isActive ? "text-[#F3E4C9]" : "text-[#A77F60]"}`}>
                          {step.title}
                        </h3>
                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="mt-2 text-sm leading-relaxed text-[#F3E4C9]/70 max-w-[40ch] overflow-hidden"
                            >
                              {step.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${isActive ? "text-[#CCD67F] translate-x-1" : "text-[#8A5F41]/40"}`} />
                  </div>
                  
                  {/* Auto-Play Progress Bar */}
                  {isActive && isAutoPlaying && terminalState !== "closed" && terminalState !== "maximized" && (
                    <motion.div
                      key={`progress-${activeStep}`}
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        duration: (steps[index].codeSnippet.length * 20 + 4000) / 1000, 
                        ease: "linear" 
                      }}
                      className="absolute bottom-0 left-0 h-1 bg-[#CCD67F]/40"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Terminal Window Placeholder when closed */}
          <div className="lg:col-span-7 sticky top-32 z-50" ref={constraintsRef}>
            <AnimatePresence mode="popLayout">
              {terminalState === "closed" ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-[2rem] border border-dashed border-[#8A5F41]/20 bg-[#121110]/50 h-[300px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#121110] transition-colors group"
                  onClick={() => setTerminalState("open")}
                >
                   <Terminal className="h-12 w-12 text-[#A77F60]/50 mb-4 group-hover:text-[#CCD67F] transition-colors" />
                   <p className="font-mono text-sm text-[#A77F60]">Terminal Terminated.</p>
                   <p className="font-mono text-xs text-[#A77F60]/70 mt-2 flex items-center gap-2">
                     <RefreshCw className="h-3 w-3" /> Click to reboot
                   </p>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  drag={terminalState !== "maximized"}
                  dragConstraints={constraintsRef}
                  dragElastic={0.1}
                  dragMomentum={false}
                  whileDrag={{ scale: 1.02, cursor: "grabbing" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`${
                    terminalState === "maximized" 
                      ? "fixed inset-4 md:inset-10 z-[100] shadow-2xl shadow-black/80" 
                      : "relative shadow-2xl"
                  } rounded-[2rem] border border-[#8A5F41]/20 bg-[#121110] overflow-hidden flex flex-col ${terminalState === "minimized" ? "h-[60px]" : "h-auto"}`}
                >
                  {/* Backdrop for maximized state to dim background */}
                  {terminalState === "maximized" && (
                     <div className="fixed inset-[-100px] bg-black/80 -z-10" onClick={() => setTerminalState("open")} />
                  )}

                  {/* Terminal Header */}
                  <div 
                    className={`flex items-center gap-2 px-6 py-4 border-b border-[#8A5F41]/10 bg-[#161412] shrink-0 select-none ${terminalState !== "maximized" ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
                    onDoubleClick={() => setTerminalState(terminalState === "maximized" ? "open" : "maximized")}
                  >
                    <div className="flex items-center gap-2 group">
                      <button 
                        onClick={handleTerminalClose}
                        className="h-3.5 w-3.5 rounded-full bg-[#373432] group-hover:bg-[#EF4444] transition-colors flex items-center justify-center focus:outline-none"
                        aria-label="Close terminal"
                      >
                         <div className="h-1.5 w-1.5 opacity-0 group-hover:opacity-100 bg-black/40 rounded-sm rotate-45 scale-x-[0.2]" />
                         <div className="h-1.5 w-1.5 opacity-0 group-hover:opacity-100 bg-black/40 rounded-sm -rotate-45 scale-x-[0.2] absolute" />
                      </button>
                      <button 
                        onClick={handleTerminalMinimize}
                        className="h-3.5 w-3.5 rounded-full bg-[#373432] group-hover:bg-[#EAB308] transition-colors flex items-center justify-center focus:outline-none"
                        aria-label="Minimize terminal"
                      >
                         <div className="h-[1.5px] w-2 opacity-0 group-hover:opacity-100 bg-black/40 rounded-sm" />
                      </button>
                      <button 
                        onClick={handleTerminalMaximize}
                        className="h-3.5 w-3.5 rounded-full bg-[#373432] group-hover:bg-[#CCD67F] transition-colors flex items-center justify-center focus:outline-none"
                        aria-label="Maximize terminal"
                      >
                         <div className="h-1.5 w-1.5 opacity-0 group-hover:opacity-100 bg-black/40 rounded-sm rotate-45 flex items-center justify-center">
                            <div className="h-[5px] w-[5px] bg-[#CCD67F] rotate-[-45deg]" />
                         </div>
                      </button>
                    </div>
                    <span className="ml-4 font-mono text-xs text-[#A77F60] flex-1 text-center pr-12">
                      {terminalState === "maximized" ? "user@codeatlas: ~/project (fullscreen)" : "user@codeatlas: ~/project"}
                    </span>
                  </div>
                  
                  {/* Terminal Body */}
                  <AnimatePresence>
                    {terminalState !== "minimized" && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: terminalState === "maximized" ? "100%" : "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`p-8 relative flex-1 overflow-auto ${terminalState === "maximized" ? "min-h-[500px]" : "min-h-[300px]"}`}
                      >
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-[#CCD67F]/5 blur-[100px] pointer-events-none" />
                        
                        <div className="relative z-10 h-full">
                           <pre className="font-mono text-sm leading-[1.7] text-[#F3E4C9]/90 whitespace-pre-wrap">
                             {steps.map((step, index) => {
                               // Keep previous steps visible but dim
                               if (index < activeStep) {
                                 return (
                                   <div key={step.id} className="opacity-40 mb-6">
                                     {step.codeSnippet}
                                   </div>
                                 );
                               }
                               // Current active step gets typewriter effect
                               if (index === activeStep) {
                                 return (
                                   <div key={step.id} className="mb-6">
                                     <Typewriter text={step.codeSnippet} isActive={true} />
                                   </div>
                                 );
                               }
                               return null;
                             })}
                           </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
