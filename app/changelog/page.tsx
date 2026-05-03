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
          A simple timeline. Direction may shift; dates are best-guess targets.
        </p>
      </header>

      {UPCOMING.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
            What&apos;s next
          </h2>
          <div className="space-y-6">
            {UPCOMING.map((entry) => (
              <Item key={entry.date + entry.title} entry={entry} muted />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
          What shipped
        </h2>
        <div className="space-y-6">
          {CHANGELOG.map((entry) => (
            <Item key={entry.date + entry.title} entry={entry} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function Item({ entry, muted = false }: { entry: ChangelogEntry; muted?: boolean }) {
  const date = new Date(entry.date + "T12:00:00").toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <article
      className={[
        "rounded-xl border bg-[var(--color-surface)] p-5",
        muted ? "border-dashed border-[var(--color-border-strong)]" : "border-[var(--color-border)]",
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-medium text-[var(--color-text)]">{entry.title}</h3>
        <span className="font-mono text-[11px] text-[var(--color-text-faint)]">{date}</span>
      </div>
      {entry.bullets.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-[var(--color-text-muted)]">
          {entry.bullets.map((b, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--color-text-faint)]">·</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
