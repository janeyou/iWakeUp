import { AGENTS } from "@/content/agents";
import { getRecentEntries, getLatestEntryForAgent, getLastIngestedAt } from "@/lib/db";
import { TodayPanel } from "@/components/TodayPanel";
import { AgentCard } from "@/components/AgentCard";

export const revalidate = 300;

export default async function HomePage() {
  const [recent, lastIngestedAt, ...latestPerAgent] = await Promise.all([
    safe(() => getRecentEntries(24), []),
    safe(() => getLastIngestedAt(), null),
    ...AGENTS.filter((a) => a.status === "live").map((a) =>
      safe(() => getLatestEntryForAgent(a.slug), null)
    ),
  ]);

  const liveAgents = AGENTS.filter((a) => a.status === "live");
  const latestBySlug = new Map<string, string | null>();
  liveAgents.forEach((a, i) => {
    const entry = latestPerAgent[i] as Awaited<ReturnType<typeof getLatestEntryForAgent>>;
    latestBySlug.set(a.slug, entry?.title ?? null);
  });

  const stamp = lastIngestedAt
    ? new Date(lastIngestedAt as string).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          iWakeUp
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">
          What the AI agents shipped while you slept.
        </p>
        {stamp && (
          <p className="mt-2 font-mono text-xs text-[var(--color-text-faint)]">
            updated {stamp} PT
          </p>
        )}
      </header>

      <TodayPanel entries={recent as Awaited<ReturnType<typeof getRecentEntries>>} />

      <section className="mt-16">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          The landscape
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent) => (
            <AgentCard
              key={agent.slug}
              agent={agent}
              latestTitle={latestBySlug.get(agent.slug)}
            />
          ))}
        </div>
      </section>

      <footer className="mt-24 border-t border-[var(--color-border)] pt-8 text-sm text-[var(--color-text-faint)]">
        <p>
          Built by{" "}
          <a
            href="https://janeyou.me"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-text)]"
          >
            Jane You
          </a>{" "}
          with Claude Code · Daily ingest at 5am PT
        </p>
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
