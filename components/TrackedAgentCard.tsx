import Link from "next/link";
import type { Agent } from "@/content/agents";
import type { EntryRow } from "@/lib/db";

export function TrackedAgentCard({
  agent,
  latest,
}: {
  agent: Agent;
  latest: EntryRow | null;
}) {
  const date = latest
    ? new Date(latest.published_at).toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
            ● Live
          </p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--color-text)]">
            {agent.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{agent.blurb}</p>
        </div>
      </div>

      {latest ? (
        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            Latest · {date}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text)]">
            {latest.title}
          </p>
        </div>
      ) : (
        <p className="mt-6 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-faint)]">
          No entries yet. First ingest pending.
        </p>
      )}

      <p className="mt-4 text-sm text-[var(--color-accent)] opacity-0 transition group-hover:opacity-100">
        View timeline →
      </p>
    </Link>
  );
}
