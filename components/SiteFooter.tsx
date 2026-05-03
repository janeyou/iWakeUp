import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-8 sm:px-12 pt-14 pb-20">
      <div className="font-[family-name:var(--font-display)] italic text-[clamp(36px,5.5vw,64px)] leading-[0.98] tracking-[-0.025em]">
        i wake up,
        <br />
        there is <em className="text-[var(--color-accent)]">another one</em>.
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-6 border-t border-[var(--color-border)] pt-5 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        <div>
          Built by Jane You (with Claude Code &amp; Design) · maintained by RaeyaBot · daily ingest 5am PT
        </div>
        <nav className="flex gap-5">
          <a href="https://x.com/janeyoubradley" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)]">𝕏</a>
          <a href="https://github.com/janeyou/iWakeUp" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)]">GitHub</a>
          <Link href="/drops" className="hover:text-[var(--color-text)]">Drops</Link>
          <Link href="/changelog" className="hover:text-[var(--color-text)]">Changelog</Link>
          <Link href="/status" className="hover:text-[var(--color-text)]">Status</Link>
        </nav>
      </div>
    </footer>
  );
}
