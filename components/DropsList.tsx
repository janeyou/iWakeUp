"use client";

import { useEffect, useState } from "react";
import type { EntryRow } from "@/lib/db";
import type { DayGroup } from "@/lib/groupByPTDate";
import { getAgentBySlug } from "@/content/agents";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";

type View = "compact" | "expanded";

type Props = {
  groups: DayGroup[];
  /** When true, render a Compact ↔ Expanded toggle button. Defaults to compact-only. */
  expandable?: boolean;
  /** Initial view; only honored when expandable. */
  defaultView?: View;
  /** localStorage key for persisting the toggle. Only used when expandable. */
  storageKey?: string;
  /** Per-tool brand color on the compact rail dot. Off everywhere except /drops. */
  tinted?: boolean;
};

const PAGE = 5;

export function DropsList({
  groups,
  expandable = false,
  defaultView = "compact",
  storageKey,
  tinted = false,
}: Props) {
  const [view, setView] = useState<View>(defaultView);
  const [visibleCount, setVisibleCount] = useState(() => Math.min(PAGE, groups.length));
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    allOpenForFirstN(groups, PAGE),
  );

  useEffect(() => {
    if (!expandable || !storageKey || typeof window === "undefined") return;
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "compact" || saved === "expanded") setView(saved);
  }, [expandable, storageKey]);

  useEffect(() => {
    setVisibleCount(Math.min(PAGE, groups.length));
    setOpenMap(allOpenForFirstN(groups, PAGE));
  }, [groups]);

  function toggleView() {
    setView((prev) => {
      const next: View = prev === "compact" ? "expanded" : "compact";
      if (storageKey && typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, next);
      }
      return next;
    });
  }

  function showMore() {
    setVisibleCount((prev) => {
      const next = Math.min(prev + PAGE, groups.length);
      setOpenMap((m) => {
        const out = { ...m };
        for (let i = prev; i < next; i++) out[groups[i].iso] = true;
        return out;
      });
      return next;
    });
  }

  const effectiveView: View = expandable ? view : "compact";
  const toggleLabel = view === "compact" ? "Expanded view" : "Compact view";
  const visibleGroups = groups.slice(0, visibleCount);
  const remaining = groups.length - visibleCount;

  return (
    <>
      {expandable && (
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
      )}

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
                setOpenMap((prev) =>
                  prev[iso] === next ? prev : { ...prev, [iso]: next },
                );
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
              <div className="pt-2 pb-4">
                {effectiveView === "compact" ? (
                  <CompactDay items={items} tinted={tinted} />
                ) : (
                  <ExpandedDay items={items} />
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
            See more →
          </button>
        </div>
      )}
    </>
  );
}

function CompactDay({ items, tinted }: { items: EntryRow[]; tinted: boolean }) {
  return (
    <ol className="relative ml-2 mt-2">
      <span
        aria-hidden
        className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--color-border)]"
      />
      {items.map((entry, i) => (
        <CompactEntry
          key={entry.id}
          entry={entry}
          last={i === items.length - 1}
          tinted={tinted}
        />
      ))}
    </ol>
  );
}

function CompactEntry({
  entry,
  last,
  tinted,
}: {
  entry: EntryRow;
  last: boolean;
  tinted: boolean;
}) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const time = formatTimePT(entry.published_at);
  const dotColor = tinted
    ? `var(--color-agent-${slug}, var(--color-accent))`
    : "var(--color-accent)";
  const meta = time ? `${agent?.name ?? slug} · ${time}` : agent?.name ?? slug;
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
        className="block group/entry"
      >
        <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
          {meta}
        </div>
        <h3 className="mt-1 text-base font-medium text-[var(--color-text)] group-hover/entry:text-[var(--color-accent)]">
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

function ExpandedDay({ items }: { items: EntryRow[] }) {
  // -mr-6 lets the queue scroll past main's px-6 to the page edge.
  return (
    <div className="-mr-6 flex gap-4 overflow-x-auto pb-3">
      {items.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

function EntryCard({ entry }: { entry: EntryRow }) {
  const isTweet = entry.source_type === "x" && !!entry.tweet_id;
  return isTweet ? <TweetCard entry={entry} /> : <ContentCard entry={entry} />;
}

function TweetCard({ entry }: { entry: EntryRow }) {
  // X embed renders its own header (handle, time, link). Card just frames it.
  return (
    <article className="w-[400px] shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 transition hover:border-[var(--color-accent)]">
      {entry.tweet_id && <EmbeddedTweet id={entry.tweet_id} />}
    </article>
  );
}

function ContentCard({ entry }: { entry: EntryRow }) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const time = formatTimePT(entry.published_at);
  return (
    <article className="flex w-[320px] shrink-0 flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-accent)]">
      <div className="flex items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        <span>{agent?.name ?? slug}</span>
        {time && <span>{time}</span>}
      </div>
      <a
        href={entry.source_url}
        target="_blank"
        rel="noreferrer"
        className="group/card flex items-baseline gap-1.5"
      >
        <h3 className="text-base font-medium leading-snug text-[var(--color-text)] group-hover/card:text-[var(--color-accent)]">
          {entry.title}
        </h3>
        <ExternalIcon />
      </a>
      {entry.summary && (
        <p className="line-clamp-4 text-sm leading-snug text-[var(--color-text-muted)]">
          {entry.summary}
        </p>
      )}
    </article>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="shrink-0 text-[var(--color-text-faint)] transition group-hover/card:text-[var(--color-accent)]"
      aria-hidden
    >
      <path d="M5 11L11 5M11 5H6.5M11 5v4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function allOpenForFirstN(groups: DayGroup[], n: number): Record<string, boolean> {
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
