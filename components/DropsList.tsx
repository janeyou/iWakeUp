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
};

type View = "compact" | "expanded";

const PAGE = 5;

export function DropsList({ groups }: Props) {
  const [view, setView] = useState<View>("expanded");
  const [visibleCount, setVisibleCount] = useState(() => Math.min(PAGE, groups.length));
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => allOpenForFirstN(groups, PAGE));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("drops:view");
    if (saved === "compact" || saved === "expanded") setView(saved);
  }, []);

  // Reset on prop change (filters / pagination / date).
  useEffect(() => {
    setVisibleCount(Math.min(PAGE, groups.length));
    setOpenMap(allOpenForFirstN(groups, PAGE));
  }, [groups]);

  function toggleView() {
    setView((prev) => {
      const next = prev === "compact" ? "expanded" : "compact";
      if (typeof window !== "undefined") window.localStorage.setItem("drops:view", next);
      return next;
    });
  }

  function showMore() {
    setVisibleCount((prev) => {
      const next = Math.min(prev + PAGE, groups.length);
      // Auto-open the newly revealed groups too.
      setOpenMap((m) => {
        const out = { ...m };
        for (let i = prev; i < next; i++) out[groups[i].iso] = true;
        return out;
      });
      return next;
    });
  }

  const toggleLabel = view === "compact" ? "Expanded view" : "Compact view";
  const visibleGroups = groups.slice(0, visibleCount);
  const remaining = groups.length - visibleCount;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleView}
          className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          aria-label={`Switch to ${view === "compact" ? "expanded" : "compact"} view`}
        >
          {toggleLabel}
        </button>
      </div>

      <div className="space-y-4">
        {visibleGroups.map(({ iso, displayDate, items }) => {
          const agentNames = uniqueAgentNames(items);
          const open = openMap[iso] ?? false;
          return (
            <details
              key={iso}
              open={open}
              onToggle={(e) => {
                const next = (e.currentTarget as HTMLDetailsElement | null)?.open;
                if (typeof next !== "boolean") return;
                setOpenMap((prev) => (prev[iso] === next ? prev : { ...prev, [iso]: next }));
              }}
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
                {view === "compact" ? (
                  <CompactDay items={items} />
                ) : (
                  items.map((entry) => (
                    <TimelineEntry key={entry.id} entry={entry} tinted />
                  ))
                )}
              </div>
            </details>
          );
        })}
      </div>

      {remaining > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={showMore}
            className="rounded-full border border-[var(--color-border)] px-5 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Show {Math.min(PAGE, remaining)} more {remaining === 1 ? "date" : "dates"} →
          </button>
        </div>
      )}
    </>
  );
}

function CompactDay({ items }: { items: EntryRow[] }) {
  return (
    <ol className="relative ml-2 mt-2">
      <span
        aria-hidden
        className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--color-border)]"
      />
      {items.map((entry, i) => (
        <CompactEntry key={entry.id} entry={entry} last={i === items.length - 1} />
      ))}
    </ol>
  );
}

function CompactEntry({ entry, last }: { entry: EntryRow; last: boolean }) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const time = formatTimePT(entry.published_at);
  const dotColor = `var(--color-agent-${slug}, var(--color-accent))`;
  const meta = time ? `${agent?.name ?? slug} · ${time}` : (agent?.name ?? slug);
  return (
    <li className={["relative pl-7", last ? "pb-1" : "pb-7"].join(" ")}>
      <span
        aria-hidden
        className="absolute left-0 top-1.5 inline-block h-[11px] w-[11px] rounded-full ring-4 ring-[var(--color-bg)]"
        style={{ background: dotColor }}
      />
      <a
        href={entry.source_url}
        target="_blank"
        rel="noreferrer"
        className="block group"
      >
        <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
          {meta}
        </div>
        <h3 className="mt-1 text-base font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)]">
          {entry.title}
        </h3>
        {entry.summary && (
          <p className="mt-2 text-sm leading-snug text-[var(--color-text-muted)]">
            {entry.summary}
          </p>
        )}
      </a>
    </li>
  );
}

function allOpenForFirstN(groups: DropsDay[], n: number): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const lim = Math.min(n, groups.length);
  for (let i = 0; i < lim; i++) out[groups[i].iso] = true;
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

function formatTimePT(iso: string): string | null {
  const t = new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return t === "00:00" ? null : `${t} PT`;
}
