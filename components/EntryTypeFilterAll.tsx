import Link from "next/link";
import type { EntryType } from "@/lib/db";

const PILLS: { id: "all" | EntryType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "release", label: "Releases" },
  { id: "news", label: "News" },
  { id: "post", label: "Posts" },
];

const COLOR_BY_TYPE: Record<EntryType, string> = {
  release: "var(--color-release)",
  news: "var(--color-news)",
  post: "var(--color-post)",
};

export function EntryTypeFilterAll({
  basePath,
  current,
  counts,
  carry,
}: {
  basePath: string;
  current: "all" | EntryType;
  counts: Record<EntryType, number>;
  /** Extra query params to preserve when switching type. */
  carry?: Record<string, string | undefined>;
}) {
  const carryParts = carry
    ? Object.entries(carry).filter(([, v]) => v != null && v !== "")
    : [];

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {PILLS.map((pill) => {
        const isActive = pill.id === current;
        const count =
          pill.id === "all" ? counts.release + counts.news + counts.post : counts[pill.id];
        const accentColor =
          pill.id === "all" ? "var(--color-text)" : COLOR_BY_TYPE[pill.id];

        const params = new URLSearchParams();
        if (pill.id !== "all") params.set("type", pill.id);
        for (const [k, v] of carryParts) params.set(k, v as string);
        const qs = params.toString();
        const href = qs ? `${basePath}?${qs}` : basePath;

        return (
          <Link
            key={pill.id}
            href={href}
            className={[
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
              isActive
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-text)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]",
            ].join(" ")}
          >
            <span style={{ color: isActive ? accentColor : undefined }}>
              {pill.label}
            </span>
            <span className="ml-2 font-mono text-[10px] text-[var(--color-text-faint)]">
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
