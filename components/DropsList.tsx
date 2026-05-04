"use client";

import { useEffect, useState } from "react";
import type { EntryRow } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";
import { TimelineEntry } from "@/components/TimelineEntry";

export type DropsDay = {
  iso: string;
  displayDate: string;
  items: EntryRow[];
};

type Props = {
  groups: DropsDay[];
  todayPT: string;
  dateOnly?: string;
};

type View = "compact" | "expanded";

export function DropsList({ groups, todayPT, dateOnly }: Props) {
  const [view, setView] = useState<View>("compact");
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    initialOpenMap(groups, todayPT, dateOnly),
  );

  // Restore persisted view preference on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("drops:view");
    if (saved === "compact" || saved === "expanded") setView(saved);
  }, []);

  // When the underlying group set changes (filters / pagination / ?date), reset open map.
  useEffect(() => {
    setOpenMap(initialOpenMap(groups, todayPT, dateOnly));
  }, [groups, todayPT, dateOnly]);

  function toggleView() {
    setView((prev) => {
      const next = prev === "compact" ? "expanded" : "compact";
      if (typeof window !== "undefined") window.localStorage.setItem("drops:view", next);
      return next;
    });
  }

  function setAll(val: boolean) {
    const next: Record<string, boolean> = {};
    for (const g of groups) next[g.iso] = val;
    setOpenMap(next);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleView}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          aria-label={`Switch to ${view === "compact" ? "expanded" : "compact"} view`}
        >
          {view === "compact" ? "Compact" : "Expanded"} view
        </button>
        {!dateOnly && groups.length > 0 && (
          <div className="ml-auto flex gap-2 font-mono text-[11px] uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setAll(true)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              Expand all
            </button>
            <span className="text-[var(--color-border-strong)]">/</span>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {groups.map(({ iso, displayDate, items }) => {
          const agentNames = uniqueAgentNames(items);
          const open = openMap[iso] ?? false;
          return (
            <details
              key={iso}
              open={open}
              onToggle={(e) =>
                setOpenMap((prev) => ({ ...prev, [iso]: e.currentTarget.open }))
              }
              className="group border-t border-[var(--color-border)] [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-baseline justify-between gap-3 py-3 list-none">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                    {displayDate}
                  </h2>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {items.length} {items.length === 1 ? "update" : "updates"}
                    {agentNames.length > 0 ? ` · ${agentNames.join(", ")}` : ""}
                  </span>
                </div>
                <span className="font-mono text-xs text-[var(--color-text-faint)] transition group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <div className="pt-2 pb-2">
                {view === "expanded"
                  ? items.map((entry) => <TimelineEntry key={entry.id} entry={entry} />)
                  : items.map((entry) => <CompactEntry key={entry.id} entry={entry} />)}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

function CompactEntry({ entry }: { entry: EntryRow }) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const time = formatTime(entry.published_at);
  return (
    <article
      className="border-l-2 pl-4 pb-3"
      style={{ borderColor: `var(--color-agent-${slug}, var(--color-border))` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: `var(--color-agent-${slug}, var(--color-text-muted))` }}
          >
            {agent?.name ?? slug}
          </span>
          <a
            href={entry.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            {entry.title}
          </a>
        </div>
        {time && (
          <span className="shrink-0 font-mono text-xs text-[var(--color-text-faint)]">
            {time}
          </span>
        )}
      </div>
      {entry.summary && (
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-[var(--color-text-muted)]">
          {entry.summary}
        </p>
      )}
    </article>
  );
}

function initialOpenMap(
  groups: DropsDay[],
  todayPT: string,
  dateOnly: string | undefined,
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const g of groups) {
    out[g.iso] = g.iso === todayPT || (dateOnly !== undefined && g.iso === dateOnly);
  }
  // If filtering to a single date and that date isn't in the open list yet (e.g., the only group in the result), make sure it opens.
  if (dateOnly && groups.length === 1) out[groups[0].iso] = true;
  return out;
}

function uniqueAgentNames(items: EntryRow[]): string[] {
  const slugs = new Set(items.map((e) => e.agent_slug));
  const out: string[] = [];
  for (const slug of slugs) {
    const a = getAgentBySlug(slug);
    out.push(a?.name ?? slug);
  }
  return out.sort();
}

function formatTime(iso: string): string | null {
  const t = new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return t === "00:00" ? null : `${t} PT`;
}
