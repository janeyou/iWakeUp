import Link from "next/link";
import type { EntryRow } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";

export function TodayPanel({ entries }: { entries: EntryRow[] }) {
  const today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Today — {today}
        </h2>
        <p className="mt-3 text-lg text-[var(--color-text-muted)]">
          Nothing new overnight. Check back tomorrow.
        </p>
      </section>
    );
  }

  const grouped = new Map<string, EntryRow[]>();
  for (const e of entries) {
    const arr = grouped.get(e.agent_slug) ?? [];
    arr.push(e);
    grouped.set(e.agent_slug, arr);
  }

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8">
      <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-accent)]">
        What dropped overnight — {today}
      </h2>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {Array.from(grouped.entries()).map(([slug, items]) => {
          const agent = getAgentBySlug(slug);
          return (
            <div key={slug}>
              <Link
                href={`/agents/${slug}`}
                className="text-base font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]"
              >
                {agent?.name ?? slug} →
              </Link>
              <ul className="mt-3 space-y-2">
                {items.slice(0, 4).map((e) => (
                  <li key={e.id} className="text-sm text-[var(--color-text-muted)]">
                    <a
                      href={e.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-[var(--color-text)]"
                    >
                      · {e.title}
                    </a>
                  </li>
                ))}
                {items.length > 4 && (
                  <li className="text-xs text-[var(--color-text-faint)]">
                    + {items.length - 4} more
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
