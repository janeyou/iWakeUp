import Link from "next/link";
import type { Metadata } from "next";
import { CHANGELOG, UPCOMING, type ChangelogEntry } from "@/content/changelog";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Changelog · AI Radar",
  description: "What shipped in AI Radar, and what's next.",
};

export default function ChangelogPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-12">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          Changelog
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] font-normal text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[-0.01em] text-[var(--color-text)]">
          What shipped, what&apos;s next.
        </h1>
        <p className="mt-4 max-w-xl text-base text-[var(--color-text-muted)]">
          Direction may shift; dates are best-guess targets.
        </p>
      </header>

      <Timeline
        title="What's next"
        entries={UPCOMING}
        upcoming
      />

      <Timeline
        title="What shipped"
        entries={CHANGELOG}
      />

      <SiteFooter />
    </main>
  );
}

function Timeline({
  title,
  entries,
  upcoming = false,
}: {
  title: string;
  entries: ChangelogEntry[];
  upcoming?: boolean;
}) {
  if (entries.length === 0) return null;
  return (
    <section className="mb-14 last:mb-0">
      <h2 className="mb-6 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        {title}
      </h2>
      <ol className="relative ml-2">
        {/* Vertical rail */}
        <span
          aria-hidden
          className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--color-border)]"
        />
        {entries.map((entry, i) => (
          <TimelineItem key={entry.date + entry.title} entry={entry} upcoming={upcoming} last={i === entries.length - 1} />
        ))}
      </ol>
    </section>
  );
}

function TimelineItem({
  entry,
  upcoming,
  last,
}: {
  entry: ChangelogEntry;
  upcoming: boolean;
  last: boolean;
}) {
  const date = new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <li className={["relative pl-7", last ? "pb-0" : "pb-8"].join(" ")}>
      {/* Dot on the rail */}
      <span
        aria-hidden
        className={[
          "absolute left-0 top-1.5 inline-block h-[11px] w-[11px] rounded-full ring-4 ring-[var(--color-bg)]",
          upcoming
            ? "border border-dashed border-[var(--color-accent)] bg-[var(--color-bg)]"
            : "bg-[var(--color-accent)]",
        ].join(" ")}
      />
      <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        {date}
      </div>
      <h3 className="mt-1 text-base font-medium text-[var(--color-text)]">
        {entry.title}
      </h3>
      {entry.bullets.length > 0 && (
        <ul className="mt-2 space-y-1.5 text-sm text-[var(--color-text-muted)]">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-[6px] inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-text-faint)]" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
