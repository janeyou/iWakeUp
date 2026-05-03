import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-6xl px-8 sm:px-12 pt-12 pb-16">
      <div className="font-[family-name:var(--font-display)] font-normal text-[clamp(22px,3vw,34px)] leading-[1.15] tracking-[-0.01em] text-[var(--color-text-muted)]">
        i wake up, there is <em className="italic text-[var(--color-accent)]">another one</em>.
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-[var(--color-border)] pt-5 text-sm text-[var(--color-text-faint)]">
        <div>
          Built by{" "}
          <a
            href="https://janeyou.me"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-text)]"
          >
            Jane You
          </a>
          {" "}with Claude Code &amp; Design. Maintained by RaeyaBot. Daily ingest 5am PT.
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
