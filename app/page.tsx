import Link from "next/link";
import { getLiveAgents } from "@/content/agents";
import {
  getRecentEntries,
  getLastIngestedAt,
  getLatestEntryForAgent,
  type EntryRow,
} from "@/lib/db";
import { TodayPanel } from "@/components/TodayPanel";
import { TrackedAgentCard } from "@/components/TrackedAgentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SuggestToolForm } from "@/components/SuggestToolForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export const revalidate = 300;

export default async function HomePage() {
  const liveAgents = getLiveAgents();

  const [recent, lastIngestedAt, ...latestPerAgent] = await Promise.all([
    safe(() => getRecentEntries(24), [] as EntryRow[]),
    safe(() => getLastIngestedAt(), null as string | null),
    ...liveAgents.map((a) => safe(() => getLatestEntryForAgent(a.slug), null as EntryRow | null)),
  ]);

  const stamp = lastIngestedAt
    ? new Date(lastIngestedAt).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <header className="mb-14">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-text)]">
              AI Radar
            </h1>
            <p className="mt-2 font-mono text-sm italic text-[var(--color-accent)]">
              i wake up, there is another AI update.
            </p>
            <p className="mt-3 max-w-xl text-lg text-[var(--color-text-muted)]">
              What the AI agents shipped while you slept. Updated every morning at 5am PT.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="https://www.janeyoubradley.com/#/blog/agentic-ai-landscape-2026"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--color-border)] px-3.5 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Framework →
            </a>
            <ThemeToggle />
          </div>
        </div>
        {stamp && (
          <p className="mt-4 font-mono text-xs text-[var(--color-text-faint)]">
            last ingest, {stamp} PT
          </p>
        )}
      </header>

      {/* Latest drops */}
      <TodayPanel entries={recent as EntryRow[]} />

      {/* Timelines */}
      <section className="mt-16">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Timelines
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {liveAgents.map((agent, i) => (
            <TrackedAgentCard
              key={agent.slug}
              agent={agent}
              latest={latestPerAgent[i] as EntryRow | null}
            />
          ))}
        </div>
      </section>

      {/* Suggest a tool */}
      <section className="mt-12">
        <SuggestToolForm />
      </section>

      {/* Newsletter */}
      <section className="mt-12">
        <SubscribeForm source="home" />
      </section>

      {/* Framework CTA */}
      <section className="mt-12 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          New here?
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
          Not sure what an &ldquo;AI agent&rdquo; really means?
        </h2>
        <p className="mt-3 max-w-2xl text-base text-[var(--color-text-muted)]">
          The word covers everything from autocomplete to autonomous deputies. Jane wrote a
          5-level framework, capability and PM-trust on each, to tell what&apos;s what.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href="https://www.janeyoubradley.com/#/blog/agentic-ai-landscape-2026"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--color-accent)] hover:underline"
          >
            Read the framework essay →
          </a>
          <Link
            href="/learn"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            Or scan the live landscape on AI Radar →
          </Link>
        </div>
      </section>

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8">
        <SiteFooter />
      </footer>
    </main>
  );
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[home] db query failed:", err);
    return fallback;
  }
}
