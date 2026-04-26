import type { EntryRow } from "@/lib/db";
import { EmbeddedTweet } from "@/components/EmbeddedTweet";

const SOURCE_LABEL: Record<EntryRow["source_type"], string> = {
  changelog: "Changelog",
  blog: "Blog",
  x: "X",
};

export function TimelineEntry({ entry }: { entry: EntryRow }) {
  const time = new Date(entry.published_at).toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <article className="flex gap-4">
      <div className="shrink-0 w-16 pt-0.5 font-mono text-xs text-[var(--color-text-faint)]">
        {time} PT
      </div>
      <div className="flex-1 border-l border-[var(--color-border)] pl-5 pb-6">
        <div className="flex items-start gap-3">
          <a
            href={entry.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-base font-medium text-[var(--color-text)] hover:text-[var(--color-accent)]"
          >
            {entry.title}
          </a>
          <span className="mt-0.5 shrink-0 rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
            {SOURCE_LABEL[entry.source_type]}
          </span>
        </div>
        {entry.summary && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{entry.summary}</p>
        )}
        {entry.source_type === "x" && entry.tweet_id && (
          <EmbeddedTweet id={entry.tweet_id} />
        )}
      </div>
    </article>
  );
}
