import type { EntryRow } from "@/lib/db";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";
import { getAgentBySlug } from "@/content/agents";

export function TimelineEntry({
  entry,
  agentName,
  compact = false,
  tinted = false,
}: {
  entry: EntryRow;
  agentName?: string;
  /** Suppress embed + video, clamp summary. Used for /drops compact view. */
  compact?: boolean;
  /** Use per-tool brand colors for rail and label. Off everywhere except /drops. */
  tinted?: boolean;
}) {
  const time = formatTimeIfMeaningful(entry.published_at);
  const slug = entry.agent_slug;
  const resolvedAgent = agentName ?? getAgentBySlug(slug)?.name ?? slug;
  const railColor = tinted
    ? `var(--color-agent-${slug}, var(--color-border))`
    : "var(--color-border)";
  const labelColor = tinted
    ? `var(--color-agent-${slug}, var(--color-text-muted))`
    : "var(--color-text-muted)";

  return (
    <article className="border-l-2 pl-4 pb-3" style={{ borderColor: railColor }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <span
            className="font-mono text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: labelColor }}
          >
            {resolvedAgent}
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
          <span className="shrink-0 font-mono text-[11px] text-[var(--color-text-faint)]">
            {time}
          </span>
        )}
      </div>
      {entry.summary && (
        <p
          className={[
            "mt-1 text-xs leading-snug text-[var(--color-text-muted)]",
            compact ? "line-clamp-2" : "",
          ].join(" ")}
        >
          {entry.summary}
        </p>
      )}
      {!compact && entry.video_url && (
        <div className="mt-2 aspect-video w-full max-w-xl overflow-hidden rounded-lg border border-[var(--color-border)]">
          <iframe
            src={entry.video_url}
            title={entry.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            className="h-full w-full"
          />
        </div>
      )}
      {!compact && entry.source_type === "x" && entry.tweet_id && (
        <div className="mt-2">
          <EmbeddedTweet id={entry.tweet_id} />
        </div>
      )}
    </article>
  );
}

function formatTimeIfMeaningful(iso: string): string | null {
  const time = new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return time === "00:00" ? null : `${time} PT`;
}
