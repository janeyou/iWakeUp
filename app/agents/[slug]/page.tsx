import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/content/agents";
import {
  getActivityByDay,
  getEntriesForAgent,
  type EntryRow,
} from "@/lib/db";
import { groupByPTDate } from "@/lib/groupByPTDate";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { DropsList } from "@/components/DropsList";
import { SiteFooter } from "@/components/SiteFooter";

export const revalidate = 300;

const ENTRIES_LIMIT = 200;

export default async function AgentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  if (agent.status === "coming_soon") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-24">
        <Link
          href="/"
          className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
        >
          ← Back
        </Link>
        <h1 className="mt-8 text-3xl font-semibold text-[var(--color-text)]">
          {agent.name}
        </h1>
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          Coming soon. {agent.name} will join the tracker once Claude clears the quality bar.
        </p>
        <a
          href={agent.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block text-sm text-[var(--color-accent)]"
        >
          Visit {agent.name} ↗
        </a>
      </main>
    );
  }

  const [entries, activity] = await Promise.all([
    safeEntries(slug),
    safeActivity(slug),
  ]);

  const groupedDays = groupByPTDate(entries);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-8 mb-10 border-b border-[var(--color-border)] pb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          {agent.name}
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)]">{agent.blurb}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <a
            href={agent.officialUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
          >
            Official site ↗
          </a>
          {agent.sources.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              {s.label} ↗
            </a>
          ))}
        </div>
      </header>

      <div className="mb-10">
        <ActivityHeatmap data={activity} agentSlug={slug} />
      </div>

      <section>
        {entries.length === 0 ? (
          <p className="text-[var(--color-text-muted)]">No entries yet.</p>
        ) : (
          <DropsList
            groups={groupedDays}
            expandable
            defaultView="expanded"
            storageKey={`agent:${slug}:view`}
          />
        )}
      </section>

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8">
        <SiteFooter />
      </footer>
    </main>
  );
}

async function safeEntries(slug: string): Promise<EntryRow[]> {
  try {
    return await getEntriesForAgent(slug, { limit: ENTRIES_LIMIT });
  } catch (err) {
    console.error("[agent] db query failed:", err);
    return [];
  }
}

async function safeActivity(slug: string) {
  try {
    return await getActivityByDay(slug, 182);
  } catch (err) {
    console.error("[agent] activity query failed:", err);
    return [];
  }
}
