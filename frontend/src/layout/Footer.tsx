import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#8A5F41]/15 bg-[#050505] py-16 md:py-20">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            {/* Brand: Outfit 600, text-sm, tracking-wide */}
            <span
              className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F3E4C9]"
              style={{ letterSpacing: "var(--tracking-wide)" }}
            >
              CodeAtlas
            </span>
            {/* Body small: Geist 400, text-sm, leading-relaxed */}
            <p className="mt-4 text-sm leading-relaxed text-[#A77F60] max-w-[45ch]">
              Architectural clarity for any codebase. Index, trace, and
              understand complex systems with AI.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-3">
              {/* Category label: Geist 500, text-xs, uppercase, tracking-[0.06em]
                  Using #A77F60 (tan) NOT #8A5F41 (brown) since this is small text
                  that needs WCAG AA (4.5:1). Brown only passes at large sizes. */}
              <span
                className="text-xs font-medium uppercase text-[#A77F60]"
                style={{ letterSpacing: "var(--tracking-caps)" }}
              >
                Navigate
              </span>
              <Link
                href="#features"
                className="text-sm text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
              >
                Features
              </Link>
              <Link
                href="#workflow"
                className="text-sm text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
              >
                How it works
              </Link>
              <Link
                href="/analyze"
                className="text-sm text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
              >
                Analyze
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <span
                className="text-xs font-medium uppercase text-[#A77F60]"
                style={{ letterSpacing: "var(--tracking-caps)" }}
              >
                External
              </span>
              <Link
                href="https://github.com/surajyadav04/CodeAtlas-AI"
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
              >
                GitHub
              </Link>
              <Link
                href="/docs"
                className="text-sm text-[#A77F60] transition-colors hover:text-[#F3E4C9]"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[#8A5F41]/10 pt-8">
          {/* Caption: Geist 400, text-xs, using tan for WCAG compliance */}
          <p className="text-xs text-[#A77F60]">
            &copy; {new Date().getFullYear()} CodeAtlas AI
          </p>
        </div>
      </div>
    </footer>
  );
}
