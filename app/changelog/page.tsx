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
          Releases roll up to the week&apos;s Sunday. Direction may shift; future dates are best-guess targets.
        </p>
      </header>

      <Timeline title="What's next" entries={UPCOMING} upcoming />

      <Timeline title="What shipped" entries={CHANGELOG} />

      <SiteFooter />
    </main>
  );
}

type WeekGroup = { sundayISO: string; sundayLabel: string; entries: ChangelogEntry[] };

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
  const groups = groupByWeekSunday(entries, { rollbackFutureToPast: !upcoming });
  return (
    <section className="mb-14 last:mb-0">
      <h2 className="mb-6 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        {title}
      </h2>
      <ol className="relative ml-2">
        <span
          aria-hidden
          className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[var(--color-border)]"
        />
        {groups.map((group, gi) => (
          <li
            key={group.sundayISO}
            className={["relative pl-7", gi === groups.length - 1 ? "pb-0" : "pb-10"].join(" ")}
          >
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
              {group.sundayLabel}
            </div>
            <div className="mt-3 space-y-6">
              {group.entries.map((entry) => (
                <div key={entry.date + entry.title}>
                  <h3 className="text-base font-medium text-[var(--color-text)]">
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
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function groupByWeekSunday(
  entries: ChangelogEntry[],
  opts: { rollbackFutureToPast: boolean },
): WeekGroup[] {
  const todayISO = todayPTISODate();
  const map = new Map<string, WeekGroup>();
  for (const entry of entries) {
    let sundayISO = weekEndingSundayISO(entry.date);
    if (opts.rollbackFutureToPast && sundayISO > todayISO) {
      sundayISO = shiftDaysISO(sundayISO, -7);
    }
    let g = map.get(sundayISO);
    if (!g) {
      g = {
        sundayISO,
        sundayLabel: formatSundayLabel(sundayISO),
        entries: [],
      };
      map.set(sundayISO, g);
    }
    g.entries.push(entry);
  }
  // Each group's entries: keep input order (entries are already date-sorted by author).
  // Groups: order by sundayISO, descending for shipped, ascending for upcoming.
  const ordered = Array.from(map.values()).sort((a, b) =>
    opts.rollbackFutureToPast ? b.sundayISO.localeCompare(a.sundayISO) : a.sundayISO.localeCompare(b.sundayISO),
  );
  return ordered;
}

function weekEndingSundayISO(dateISO: string): string {
  // JS getDay: 0=Sunday ... 6=Saturday. Days until next Sunday = (7 - getDay()) % 7.
  const d = new Date(dateISO + "T12:00:00Z");
  const dow = d.getUTCDay();
  const daysToSunday = (7 - dow) % 7;
  if (daysToSunday === 0) return dateISO;
  return shiftDaysISO(dateISO, daysToSunday);
}

function shiftDaysISO(dateISO: string, days: number): string {
  const d = new Date(dateISO + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatSundayLabel(dateISO: string): string {
  const d = new Date(dateISO + "T12:00:00Z");
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();
  return `${month} ${day}, ${year} · Sunday`;
}

function todayPTISODate(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
}
