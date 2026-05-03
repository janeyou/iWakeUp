import Link from "next/link";

export function SiteFooter() {
  return (
    <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-center text-xs text-[var(--color-text-faint)]">
      <span>
        Built by{" "}
        <a
          href="https://janeyou.me"
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-text)]"
        >
          Jane You
        </a>{" "}
        with Claude Code, maintained by RaeyaBot. Daily ingest 5am PT.
      </span>
      <span>·</span>
      <a
        href="https://x.com/janeyoubradley"
        target="_blank"
        rel="noreferrer"
        className="hover:text-[var(--color-text)]"
      >
        𝕏
      </a>
      <span>·</span>
      <a
        href="https://github.com/janeyou/iWakeUp"
        target="_blank"
        rel="noreferrer"
        className="hover:text-[var(--color-text)]"
      >
        github
      </a>
      <span>·</span>
      <Link href="/drops" className="hover:text-[var(--color-text)]">
        drops
      </Link>
      <span>·</span>
      <Link href="/changelog" className="hover:text-[var(--color-text)]">
        changelog
      </Link>
      <span>·</span>
      <Link href="/status" className="hover:text-[var(--color-text)]">
        status
      </Link>
    </p>
  );
}
