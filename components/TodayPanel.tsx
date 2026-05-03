import Link from "next/link";
import type { EntryRow } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";

const VISIBLE = 12;

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
          Latest drops, {today}
        </h2>
        <p className="mt-3 text-lg text-[var(--color-text-muted)]">
          Nothing new in the last 24 hours. Check back tomorrow.
        </p>
        <Link
          href="/drops"
          className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline"
        >
          Browse all drops →
        </Link>
      </section>
    );
  }

  const visible = entries.slice(0, VISIBLE);
  const hidden = entries.length - visible.length;

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
      <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-accent)]">
        Latest drops, {today}
      </h2>

      <div className="mt-5 -mx-6 sm:-mx-8 overflow-x-auto scrollbar-hide pb-1">
        <ul className="flex gap-3 snap-x snap-mandatory px-6 sm:px-8">
          {visible.map((e) => (
            <DropCard key={e.id} entry={e} />
          ))}
          <SeeAllCard hidden={hidden} />
        </ul>
      </div>
    </section>
  );
}

function DropCard({ entry }: { entry: EntryRow }) {
  const agent = getAgentBySlug(entry.agent_slug);
  const time = formatTime(entry.published_at);
  const brandColor = `var(--color-agent-${entry.agent_slug}, var(--color-text-muted))`;
  const isTweet = entry.source_type === "x" && !!entry.tweet_id;

  return (
    <li className="snap-start shrink-0 w-64">
      <a
        href={entry.source_url}
        target="_blank"
        rel="noreferrer"
        className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
      >
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: brandColor }}
          >
            {agent?.name ?? entry.agent_slug}
          </span>
          {time && (
            <span className="font-mono text-[10px] text-[var(--color-text-faint)]">
              {time}
            </span>
          )}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-snug text-[var(--color-text)]">
          {entry.title}
        </p>
        {isTweet && (
          <EmbeddedTweet id={entry.tweet_id as string} size="xs" />
        )}
      </a>
    </li>
  );
}

function SeeAllCard({ hidden }: { hidden: number }) {
  return (
    <li className="snap-start shrink-0 w-64">
      <Link
        href="/drops"
        className="group flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-4 text-center transition hover:bg-[var(--color-accent)]"
      >
        <span className="text-base font-semibold text-[var(--color-accent)] group-hover:text-white">
          See all drops →
        </span>
        {hidden > 0 && (
          <span className="mt-1 text-xs text-[var(--color-text-muted)] group-hover:text-white/80">
            +{hidden} more in last 24h
          </span>
        )}
      </Link>
    </li>
  );
}

function formatTime(iso: string): string | null {
  const time = new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return time === "00:00" ? null : time;
}
