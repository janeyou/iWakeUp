import Link from "next/link";
import type { Metadata } from "next";
import { getLiveAgents } from "@/content/agents";
import { getLatestEntryForAgent, type EntryRow } from "@/lib/db";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Agents · AI Radar",
  description: "Available tools currently tracked on AI Radar.",
};

export default async function AgentsPage() {
  const agents = getLiveAgents();
  const latest = await Promise.all(
    agents.map((a) =>
      getLatestEntryForAgent(a.slug).catch(() => null as EntryRow | null)
    )
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-12">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          Agents
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] font-normal text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[-0.01em] text-[var(--color-text)]">
          Tools currently tracked.
        </h1>
        <p className="mt-4 max-w-xl text-base text-[var(--color-text-muted)]">
          A small, hand-picked list. Each tool gets its own profile with a 6-month activity heatmap and recent drops.
        </p>
      </header>

      <ul className="space-y-3">
        {agents.map((a, i) => {
          const last = latest[i];
          const lastDate = last
            ? new Date(last.published_at).toLocaleDateString("en-US", {
                timeZone: "America/Los_Angeles",
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : null;
          return (
            <li key={a.slug}>
              <Link
                href={`/agents/${a.slug}`}
                className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <h2
                      className="font-[family-name:var(--font-display)] text-lg font-medium tracking-[-0.01em]"
                      style={{ color: `var(--color-agent-${a.slug}, var(--color-text))` }}
                    >
                      {a.name}
                    </h2>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
                      Live
                    </span>
                  </div>
                  {lastDate && (
                    <span className="font-mono text-[11px] text-[var(--color-text-faint)]">
                      Last drop · {lastDate}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{a.blurb}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--color-text-faint)]">
                  {a.sources.map((s) => (
                    <span key={s.url}>
                      {s.label}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-10 rounded-xl border border-dashed border-[var(--color-border-strong)] p-5 text-center text-sm text-[var(--color-text-muted)]">
        Don&apos;t see a tool you&apos;d want tracked?{" "}
        <Link href="/suggest" className="text-[var(--color-accent)] hover:underline">
          Suggest one →
        </Link>
      </div>

      <SiteFooter />
    </main>
  );
}
