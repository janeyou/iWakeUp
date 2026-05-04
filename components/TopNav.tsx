import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";

const FRAMEWORK_URL = "https://www.janeyoubradley.com/#/blog/agentic-ai-landscape-2026";

/**
 * Sticky top nav, semi-transparent backdrop-blur, 56px tall.
 * Wordmark on the left + section links + theme toggle on the right.
 * Status moved to the footer; Framework points off-site to janeyoubradley.com.
 */
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_oklch,_var(--color-bg)_85%,_transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklch,_var(--color-bg)_75%,_transparent)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-8 sm:px-12">
        <Wordmark size="md" />

        <nav className="hidden items-center gap-5 text-sm text-[var(--color-text-muted)] sm:flex">
          <Link href="/drops" className="hover:text-[var(--color-text)]">
            Drops
          </Link>
          <Link href="/agents" className="hover:text-[var(--color-text)]">
            Tools
          </Link>
          <Link href="/learn" className="hover:text-[var(--color-text)]">
            Landscape
          </Link>
          <a
            href={FRAMEWORK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-[var(--color-text)]"
            title="Read on janeyoubradley.com (opens in a new tab)"
          >
            Framework
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
              <path d="M5 11L11 5M11 5H6.5M11 5v4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
