import type { EntryRow } from "@/lib/db";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";
import { TypeBadge } from "@/components/TypeBadge";

const COLOR_BY_TYPE = {
  release: "var(--color-release)",
  news: "var(--color-news)",
  post: "var(--color-post)",
};

export function TimelineEntry({
  entry,
  agentName,
}: {
  entry: EntryRow;
  agentName?: string;
}) {
  const time = formatTimeIfMeaningful(entry.published_at);
  const borderColor = COLOR_BY_TYPE[entry.entry_type] ?? "var(--color-border)";

  return (
    <article className="border-l-2 pl-4 pb-4" style={{ borderColor }}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <TypeBadge type={entry.entry_type} />
          {agentName && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
              {agentName}
            </span>
          )}
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
        <p className="mt-1.5 text-sm leading-snug text-[var(--color-text-muted)]">
          {entry.summary}
        </p>
      )}
      {entry.video_url && (
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
      {entry.source_type === "x" && entry.tweet_id && (
        <EmbeddedTweet id={entry.tweet_id} />
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
