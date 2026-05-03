import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Sticky top nav, semi-transparent backdrop-blur, 56px tall (per taste.md).
 * Wordmark on the left in bold sans (AI in accent purple, RADAR in --text,
 * pulsing accent dot). Mono nav links + theme toggle on the right.
 */
export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[color-mix(in_oklch,_var(--color-bg)_85%,_transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklch,_var(--color-bg)_75%,_transparent)]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-8 sm:px-12">
        <Wordmark size="md" />

        <nav className="hidden items-center gap-5 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] sm:flex">
          <Link href="/drops" className="hover:text-[var(--color-text)]">
            Drops
          </Link>
          <Link href="/learn" className="hover:text-[var(--color-text)]">
            Landscape
          </Link>
          <Link href="/changelog" className="hover:text-[var(--color-text)]">
            Changelog
          </Link>
          <Link href="/status" className="hover:text-[var(--color-text)]">
            Status
          </Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
