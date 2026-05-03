import Link from "next/link";
import type { Metadata } from "next";
import { CHANGELOG } from "@/content/changelog";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Changelog · AI Radar",
  description: "What shipped in AI Radar itself. Newest first.",
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
        <h1 className="mt-3 text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--color-text)]">
          What shipped in AI Radar
        </h1>
        <p className="mt-4 max-w-xl text-base text-[var(--color-text-muted)]">
          The release log for this app itself. Eating our own dog food: a release tracker that tracks its own releases.
        </p>
      </header>

      <div className="space-y-10">
        {CHANGELOG.map((entry) => {
          const date = new Date(entry.date).toLocaleDateString("en-US", {
            timeZone: "America/Los_Angeles",
            month: "long",
            day: "numeric",
            year: "numeric",
          });
          return (
            <article
              key={entry.date + entry.title}
              className="border-l-2 border-[var(--color-accent)] pl-6"
            >
              <p className="font-mono text-xs text-[var(--color-text-faint)]">{date}</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">
                {entry.title}
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-[var(--color-text-muted)]">
                {entry.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--color-text-faint)]">·</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              {entry.knownIssues && entry.knownIssues.length > 0 && (
                <div className="mt-5 rounded-lg border border-[var(--color-news-soft)] bg-[var(--color-news-soft)] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-[var(--color-news)]">
                    Known issues
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-muted)]">
                    {entry.knownIssues.map((issue, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-[var(--color-news)]">!</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {entry.pr && (
                <a
                  href={entry.pr}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs text-[var(--color-accent)] hover:underline"
                >
                  PR ↗
                </a>
              )}
            </article>
          );
        })}
      </div>

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8">
        <SiteFooter />
      </footer>
    </main>
  );
}
