"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <div className="absolute top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pointer-events-auto flex items-center justify-between gap-12 rounded-full border border-[#8A5F41]/20 bg-[#1C1917]/30 px-6 py-3 backdrop-blur-md shadow-2xl"
      >
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0C0A09] border border-[#8A5F41]/30">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#CCD67F"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <span
            className="font-[family-name:var(--font-display)] text-[13px] font-semibold text-[#F3E4C9]"
            style={{ letterSpacing: "var(--tracking-wide)" }}
          >
            CodeAtlas
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-[12px] font-medium text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
          >
            Features
          </Link>
          <Link
            href="#workflow"
            className="text-[12px] font-medium text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
          >
            How it works
          </Link>
          <Link
            href="https://github.com/surajyadav04/CodeAtlas-AI"
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-medium text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
          >
            GitHub
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden flex items-center justify-center text-[#A77F60] hover:text-[#F3E4C9] transition-colors focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.header>

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
