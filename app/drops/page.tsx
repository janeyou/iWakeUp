import Link from "next/link";
import type { Metadata } from "next";
import { AGENTS, getAgentBySlug } from "@/content/agents";
import {
  getAllEntries,
  getDailyActivityByAgent,
  type EntryRow,
} from "@/lib/db";
import { AgentChips } from "@/components/AgentChips";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { DropsList } from "@/components/DropsList";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "All drops · AI Radar",
  description:
    "Every release, news drop, and X post from the AI tools we track. Newest first.",
};

const PAGE_SIZE = 100;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DropsPage({
  searchParams,
}: {
  searchParams: Promise<{
    before?: string;
    agent?: string;
    date?: string;
  }>;
}) {
  const { before, agent, date } = await searchParams;

  const liveAgents = AGENTS.filter((a) => a.status === "live");
  const validAgentSlugs = new Set(liveAgents.map((a) => a.slug));
  const agentSlug = agent && validAgentSlugs.has(agent) ? agent : undefined;

  const dateOnly = date && DATE_RE.test(date) ? date : undefined;

  const [entries, activity] = await Promise.all([
    safeAll({
      before: dateOnly ? undefined : before,
      limit: PAGE_SIZE,
      agentSlug,
      dateOnly,
    }),
    safeActivity(),
  ]);

  const scopedActivity = agentSlug
    ? activity.filter((r) => r.agent_slug === agentSlug)
    : activity;
  const scopedAgentSlugs = agentSlug ? [agentSlug] : liveAgents.map((a) => a.slug);

  const groupedDays = groupByPTDate(entries);
  const todayPT = todayPTISODate();
  const oldest = entries[entries.length - 1];
  const hasMore = !dateOnly && entries.length === PAGE_SIZE;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-8">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          All drops
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-text)]">
          Every drop, every tool we track
        </h1>
        <p className="mt-4 max-w-xl text-base text-[var(--color-text-muted)]">
          The full archive: releases, news, and X posts from the tools we track. Newest first.
        </p>
      </header>

      <div className="mb-8">
        <ActivityHeatmap
          mode="global"
          data={scopedActivity}
          agentSlugs={scopedAgentSlugs}
        />
      </div>

      <AgentChips
        agents={AGENTS}
        current={agentSlug ?? "all"}
        basePath="/drops"
        carry={{ date: dateOnly }}
      />

      {dateOnly && (
        <div className="mb-6 flex items-center gap-3 text-sm">
          <span className="text-[var(--color-text-muted)]">
            Showing drops for{" "}
            <span className="font-mono text-[var(--color-text)]">{dateOnly}</span>
          </span>
          <Link
            href={agentSlug ? `/drops?agent=${agentSlug}` : "/drops"}
            className="text-[var(--color-accent)] hover:underline"
          >
            Clear date
          </Link>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          No entries
          {agentSlug ? ` from ${getAgentBySlug(agentSlug)?.name}` : ""}
          {dateOnly ? ` on ${dateOnly}` : ""}.
        </p>
      ) : (
        <DropsList groups={groupedDays} todayPT={todayPT} dateOnly={dateOnly} />
      )}

      {hasMore && oldest && (
        <div className="mt-10 flex justify-center">
          <Link
            href={olderHref({ agentSlug, before: oldest.published_at })}
            className="rounded-full border border-[var(--color-border)] px-5 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Older drops →
          </Link>
        </div>
      )}

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8">
        <SiteFooter />
      </footer>
    </main>
  );
}

function olderHref(opts: { agentSlug?: string; before: string }): string {
  const params = new URLSearchParams();
  if (opts.agentSlug) params.set("agent", opts.agentSlug);
  params.set("before", opts.before);
  return `/drops?${params.toString()}`;
}

async function safeAll(opts: Parameters<typeof getAllEntries>[0]): Promise<EntryRow[]> {
  try {
    return await getAllEntries(opts);
  } catch (err) {
    console.error("[drops] db query failed:", err);
    return [];
  }
}

async function safeActivity() {
  try {
    return await getDailyActivityByAgent(182);
  } catch (err) {
    console.error("[drops] activity query failed:", err);
    return [];
  }
}

type DayGroup = { iso: string; displayDate: string; items: EntryRow[] };

function groupByPTDate(entries: EntryRow[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const e of entries) {
    const d = new Date(e.published_at);
    const iso = d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    let g = map.get(iso);
    if (!g) {
      g = {
        iso,
        displayDate: d.toLocaleDateString("en-US", {
          timeZone: "America/Los_Angeles",
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        items: [],
      };
      map.set(iso, g);
    }
    g.items.push(e);
  }
  return Array.from(map.values());
}

function todayPTISODate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}
