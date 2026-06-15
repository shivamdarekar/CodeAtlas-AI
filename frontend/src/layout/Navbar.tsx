"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="fixed top-0 left-0 right-0 w-full z-[100] h-[80px] flex items-center justify-between px-6 lg:px-[140px] pointer-events-auto bg-[#050505]">
      {/* Brand */}
      <Link
        href="/"
        className="flex items-center gap-[12px] group"
      >
        <div className="flex h-8 w-8 items-center justify-center text-[#CCD67F] transition-transform duration-300 ease-in-out group-hover:scale-110">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 9h8" />
            <path d="M9 4h6" />
            <path d="M10 14h4" />
            <path d="M12 2v2" />
            <path d="m8 22 1-13" />
            <path d="m16 22-1-13" />
            <path d="M4 22h16" />
            <path d="M10 2l-1 2" />
            <path d="M14 2l1 2" />
            <path d="M12 18v.01" />
          </svg>
        </div>
        <span
          className="font-[family-name:var(--font-inter)] text-[18px] font-[700] text-[#F3E4C9] tracking-[-0.02em]"
        >
          CodeAtlas AI
        </span>
      </Link>

      {/* Nav links (Center) */}
      <nav className="hidden items-center gap-[48px] lg:flex absolute left-1/2 -translate-x-1/2">
        <Link
          href="#features"
          className="font-[family-name:var(--font-inter)] text-[16px] font-[500] text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70"
        >
          Features
        </Link>
        <Link
          href="#docs"
          className="font-[family-name:var(--font-inter)] text-[16px] font-[500] text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70"
        >
          Docs
        </Link>
        <Link
          href="#pricing"
          className="font-[family-name:var(--font-inter)] text-[16px] font-[500] text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70"
        >
          Pricing
        </Link>
        <Link
          href="https://github.com/startup-inc/CodeAtlas-AI"
          target="_blank"
          rel="noreferrer"
          className="font-[family-name:var(--font-inter)] text-[16px] font-[500] text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70"
        >
          GitHub
        </Link>
      </nav>

      {/* Right Actions */}
      <div className="hidden lg:flex items-center gap-[32px]">
        <button className="text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
        </button>
        <Link href="/login" className="font-[family-name:var(--font-inter)] text-[16px] font-[600] text-[rgba(255,255,255,0.9)] transition-opacity duration-200 hover:opacity-70 bg-transparent border-none shadow-none">
          Sign In
        </Link>
        <Link href="/signup" className="flex items-center justify-center h-[44px] px-[20px] rounded-[12px] font-[family-name:var(--font-inter)] text-[16px] font-[600] text-[#0a0a0a] bg-white transition-opacity duration-200 hover:opacity-80">
          Start Free
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden flex items-center justify-center text-[#A77F60] hover:text-[#F3E4C9] transition-colors focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-20 left-6 right-6 pointer-events-auto rounded-2xl border border-[#8A5F41]/20 bg-[#1C1917]/95 p-6 backdrop-blur-xl shadow-2xl flex flex-col gap-4 md:hidden"
          >
            <Link
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[14px] font-medium text-[#F3E4C9] hover:text-[#CCD67F] transition-colors"
            >
              Features
            </Link>
            <Link
              href="#workflow"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[14px] font-medium text-[#F3E4C9] hover:text-[#CCD67F] transition-colors"
            >
              How it works
            </Link>
            <Link
              href="https://github.com/surajyadav04/CodeAtlas-AI"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[14px] font-medium text-[#F3E4C9] hover:text-[#CCD67F] transition-colors"
            >
              GitHub
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
