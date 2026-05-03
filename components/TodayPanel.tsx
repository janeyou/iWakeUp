import Link from "next/link";
import type { EntryRow } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";
import { TypeBadge } from "@/components/TypeBadge";

export function TodayPanel({ entries }: { entries: EntryRow[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7">
        <p className="text-lg text-[var(--color-text-muted)]">Quiet morning. Check back tomorrow.</p>
        <Link href="/drops" className="mt-3 inline-block text-sm text-[var(--color-accent)] hover:underline">
          Browse all drops →
        </Link>
      </div>
    );
  }

  const lead = entries[0];
  const stack = entries.slice(1, 4);
  const hidden = Math.max(0, entries.length - 4);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Lead entry={lead} />
      <div className="flex flex-col gap-3">
        {stack.map((e) => <DropRow key={e.id} entry={e} />)}
        <Link href="/drops"
          className="flex items-center justify-between rounded-xl border border-dashed border-[var(--color-border-strong)] px-5 py-3 font-mono text-[11.5px] uppercase tracking-wide text-[var(--color-text-muted)] transition hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
        >
          <span>See all drops</span>
          {hidden > 0 && <span>+{hidden} more in 24h →</span>}
        </Link>
      </div>
    </div>
  );
}

function Lead({ entry }: { entry: EntryRow }) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const isTweet = entry.source_type === "x" && !!entry.tweet_id;
  return (
    <a
      href={entry.source_url}
      target="_blank"
      rel="noreferrer"
      className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-7 transition hover:border-[var(--color-border-strong)]"
      style={{
        // top-edge agent-tinted glow
        backgroundImage: `linear-gradient(180deg, var(--color-agent-${slug}-soft, transparent) 0%, transparent 35%)`,
      }}
    >
      <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
        <span className="font-semibold" style={{ color: `var(--color-agent-${slug}, var(--color-text))` }}>
          {agent?.name ?? slug}
        </span>
        <TypeBadge type={entry.entry_type} />
        <span className="ml-auto text-[var(--color-text-faint)]">{relTime(entry.published_at)}</span>
      </div>
      <h3 className="font-[family-name:var(--font-display)] italic text-[28px] leading-[1.15] tracking-tight text-[var(--color-text)]">
        {entry.title}
      </h3>
      {entry.summary && (
        <p className="text-base leading-relaxed text-[var(--color-text-muted)] max-w-[56ch]">{entry.summary}</p>
      )}
      {isTweet && entry.tweet_id && <EmbeddedTweet id={entry.tweet_id} size="xs" />}
      <div className="mt-auto inline-flex items-center gap-1.5 font-mono text-[11.5px] uppercase tracking-wide text-[var(--color-accent)]">
        Read source →
      </div>
    </a>
  );
}

function DropRow({ entry }: { entry: EntryRow }) {
  const slug = entry.agent_slug;
  const agent = getAgentBySlug(slug);
  const time = formatTime(entry.published_at);
  return (
    <a
      href={entry.source_url}
      target="_blank"
      rel="noreferrer"
      className="grid grid-cols-[auto_1fr_auto] items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]"
    >
      <span
        className="mt-1.5 inline-block h-2 w-2 rounded-full"
        style={{ background: `var(--color-agent-${slug}, var(--color-text-faint))` }}
        aria-hidden
      />
      <div>
        <div className="line-clamp-2 text-sm leading-snug text-[var(--color-text)]">{entry.title}</div>
        <div className="mt-1 flex gap-2 font-mono text-[10.5px] uppercase tracking-wide text-[var(--color-text-faint)]">
          <span className="font-semibold" style={{ color: `var(--color-agent-${slug}, var(--color-text-muted))` }}>
            {agent?.name ?? slug}
          </span>
          <span>·</span>
          <span>{entry.entry_type}</span>
        </div>
      </div>
      {time && <span className="font-mono text-[10.5px] text-[var(--color-text-faint)] whitespace-nowrap">{time}</span>}
    </a>
  );
}

function formatTime(iso: string): string | null {
  const t = new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return t === "00:00" ? null : t;
}

function relTime(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
