import Link from "next/link";
import type { Metadata } from "next";
import { getLiveAgents } from "@/content/agents";
import {
  getActivityByDay,
  getLatestEntryForAgent,
  type EntryRow,
} from "@/lib/db";
import { TrackedAgentCard } from "@/components/TrackedAgentCard";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Agents · AI Radar",
  description: "Available tools currently tracked on AI Radar.",
};

export default async function AgentsPage() {
  const agents = getLiveAgents();
  const rest = await Promise.all(
    agents.flatMap((a) => [
      safe(() => getLatestEntryForAgent(a.slug), null as EntryRow | null),
      safe(() => getActivityByDay(a.slug, 30), [] as { date: string; total: number }[]),
    ])
  );

  const perAgent = agents.map((a, i) => ({
    agent: a,
    latest: rest[i * 2] as EntryRow | null,
    activity: rest[i * 2 + 1] as { date: string; total: number }[],
  }));

  return (
    <main className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-10">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perAgent.map(({ agent, latest, activity }) => (
          <TrackedAgentCard key={agent.slug} agent={agent} latest={latest} activity={activity} />
        ))}
      </div>

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

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[agents] db query failed:", err);
    return fallback;
  }
}
