import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-12 max-w-6xl border-t border-[var(--color-border)] px-8 pb-16 pt-5 text-sm text-[var(--color-text-faint)] sm:px-12">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div>
          Built by{" "}
          <a
            href="https://www.janeyoubradley.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-accent)] hover:text-[var(--color-text)]"
          >
            Jane You Bradley
          </a>
          {" "}with Claude Code &amp; Design. Maintained by RaeyaBot. Daily ingest 5am PT.{" "}
          <span className="rounded border border-[var(--color-border-strong)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Beta
          </span>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <a href="https://x.com/janeyoubradley" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)]">
            𝕏
          </a>
          <a href="https://github.com/janeyou/iWakeUp" target="_blank" rel="noreferrer" className="hover:text-[var(--color-text)]">
            GitHub
          </a>
          <Link href="/drops" className="hover:text-[var(--color-text)]">Drops</Link>
          <Link href="/changelog" className="hover:text-[var(--color-text)]">Changelog</Link>
          <Link href="/suggest" className="hover:text-[var(--color-text)]">Tool request</Link>
          <Link href="/status" className="hover:text-[var(--color-text)]">Status</Link>
        </nav>
      </div>
    </footer>
  );
}
