"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { HeroNodeGraph } from "@/effects/HeroNodeGraph";

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
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
};

export function HeroSection() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0C0A09]">
      {/* Background Layer: 3D Scene */}
      <HeroNodeGraph />

      {/* Hero Content */}
      <motion.div
        variants={reduce ? undefined : container}
        initial={reduce ? undefined : "hidden"}
        animate="show"
        className="relative z-[2] mx-auto w-full max-w-[1000px] px-6 pointer-events-none"
      >
        <div className="relative p-8 sm:p-16 md:p-24 pointer-events-auto">
          <div className="relative flex flex-col items-center text-center">
            {/* Eyebrow */}
            <motion.div variants={reduce ? undefined : item} className="mb-6 flex items-center gap-2 rounded-full border border-[#8A5F41]/30 bg-[#0C0A09]/60 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-[#CCD67F]" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[#A77F60]">
                CodeAtlas AI 2.0
              </span>
            </motion.div>

            {/* Display Headline */}
            <motion.h1
              variants={reduce ? undefined : item}
              className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[#F3E4C9] sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ lineHeight: "var(--leading-display)" }}
            >
              See your codebase
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-[#F3E4C9] to-[#CCD67F] bg-clip-text text-transparent">
                {" "}with absolute clarity
              </span>
            </motion.h1>

            {/* Body Text */}
            <motion.p
              variants={reduce ? undefined : item}
              className="mt-6 max-w-[55ch] text-base leading-relaxed text-[#A77F60] sm:text-lg"
            >
              Index any repository. Trace data flows and dependencies. Get precise
              architectural answers instantly. Built for developers who demand depth.
            </motion.p>

            {/* Actions */}
            <motion.div
              variants={reduce ? undefined : item}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            >
              {/* Primary Pill Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  className="group relative h-14 overflow-hidden rounded-full bg-[#CCD67F] px-8 text-sm font-semibold tracking-wide text-[#0C0A09] shadow-[0_0_40px_-10px_#CCD67F]"
                  asChild
                >
                  <Link href="/analyze">
                    <span className="relative z-10 flex items-center">
                      Analyze repository
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    {/* Hover sheen effect */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </Link>
                </Button>
              </motion.div>

              {/* Secondary Pill Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-full border border-[#8A5F41]/40 bg-[#0C0A09]/50 px-8 text-sm font-semibold tracking-wide text-[#F3E4C9] backdrop-blur-md hover:bg-[#1C1917]/80 hover:text-[#F3E4C9]"
                  asChild
                >
                  <Link
                    href="https://github.com/surajyadav04/CodeAtlas-AI"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Source
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
