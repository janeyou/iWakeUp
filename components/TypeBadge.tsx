import type { EntryType } from "@/lib/db";

const LABELS: Record<EntryType, string> = {
  release: "Release",
  news: "News",
  post: "Post",
};

const COLORS: Record<EntryType, { fg: string; bg: string }> = {
  release: { fg: "var(--color-release)", bg: "var(--color-release-soft)" },
  news: { fg: "var(--color-news)", bg: "var(--color-news-soft)" },
  post: { fg: "var(--color-post)", bg: "var(--color-post-soft)" },
};

export function TypeBadge({ type }: { type: EntryType }) {
  const { fg, bg } = COLORS[type];
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{ color: fg, backgroundColor: bg }}
    >
      {LABELS[type]}
    </span>
  );
}
