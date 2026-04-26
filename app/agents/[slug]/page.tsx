import Link from "next/link";
import { notFound } from "next/navigation";
import { getAgentBySlug } from "@/content/agents";
import { getEntriesForAgent, type EntryRow } from "@/lib/db";
import { TimelineEntry } from "@/components/TimelineEntry";

export const revalidate = 300;

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
          Coming soon. {agent.name} will join the tracker once Claude and Cursor
          are stable.
        </p>
        <a
          href={agent.officialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block text-sm text-[var(--color-accent)]"
        >
          Visit {agent.name} →
        </a>
      </main>
    );
  }

  const entries = await safeEntries(slug);
  const grouped = groupByDate(entries);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← Back
      </Link>

      <header className="mt-8 mb-12 border-b border-[var(--color-border)] pb-8">
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
          {agent.changelogUrl && (
            <a
              href={agent.changelogUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              Changelog ↗
            </a>
          )}
          {agent.xHandle && (
            <a
              href={`https://x.com/${agent.xHandle}`}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              @{agent.xHandle} ↗
            </a>
          )}
        </div>
      </header>

      {entries.length === 0 ? (
        <p className="text-[var(--color-text-muted)]">
          No entries yet. The first daily ingest will populate this timeline.
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
                {date}
              </h2>
              <div>
                {items.map((entry) => (
                  <TimelineEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

async function safeEntries(slug: string): Promise<EntryRow[]> {
  try {
    return await getEntriesForAgent(slug);
  } catch (err) {
    console.error("[agent] db query failed:", err);
    return [];
  }
}

function groupByDate(entries: EntryRow[]): [string, EntryRow[]][] {
  const map = new Map<string, EntryRow[]>();
  for (const e of entries) {
    const date = new Date(e.published_at).toLocaleDateString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const arr = map.get(date) ?? [];
    arr.push(e);
    map.set(date, arr);
  }
  return Array.from(map.entries());
}
