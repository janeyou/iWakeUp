import Link from "next/link";
import type { Metadata } from "next";
import { getDigestIssue, listDigestIssueKeys } from "@/lib/db";
import { getIssueNumbers } from "@/lib/issue";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Radar · Archive",
  description: "Past issues of AI Radar. Weekly digest of what AI coding agents shipped.",
};

type IssueRow = {
  weekKey: string;
  vol: string;
  issue: string;
  weekRange: string;
  headline: string;
  themeCount: number;
  dropCount: number;
};

async function loadIssues(): Promise<IssueRow[]> {
  const keys = await listDigestIssueKeys(100);
  const rows = await Promise.all(
    keys.map(async (k) => {
      const row = await getDigestIssue(k);
      if (!row) return null;
      const { vol, issue } = getIssueNumbers(row.content.weekKey);
      return {
        weekKey: k,
        vol,
        issue,
        weekRange: row.content.weekRangeLabel,
        headline: `${row.content.headlinePre}${row.content.headlineAccent}${row.content.headlinePost}`,
        themeCount: row.content.themes.length,
        dropCount: row.content.stats.drops,
      } satisfies IssueRow;
    }),
  );
  return rows.filter((r): r is IssueRow => r !== null);
}

export default async function IssuesArchivePage() {
  const issues = await loadIssues();

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Archive
          </p>
          <h1 className="mt-2 text-4xl font-normal tracking-tight md:text-5xl">
            Every issue of AI Radar.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">
            Weekly Sunday digest of what AI coding agents shipped. Claude, Codex,
            Cursor. One email, every drop linked, sorted by what the news meant
            not who shipped it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-[var(--color-border)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
              Subscribe →
            </Link>
            <Link
              href="/drops"
              className="rounded-full border border-[var(--color-border)] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
            >
              Live drops feed
            </Link>
          </div>
        </header>

        {issues.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No issues yet.</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
            {issues.map((iss) => (
              <li key={iss.weekKey}>
                <Link
                  href={`/issues/${iss.weekKey}`}
                  className="group flex flex-col gap-2 py-6 transition hover:opacity-90"
                >
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                    <span className="text-[var(--color-text)]">
                      Vol {iss.vol} · Issue {iss.issue}
                    </span>
                    <span>{iss.weekRange}</span>
                    <span>
                      {iss.dropCount} drops · {iss.themeCount} themes
                    </span>
                  </div>
                  <h2 className="text-xl font-normal leading-snug tracking-tight md:text-2xl">
                    {iss.headline}
                  </h2>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)]">
                    Read issue →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
