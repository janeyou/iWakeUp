import Link from "next/link";
import { getLiveAgents } from "@/content/agents";
import {
  getRecentEntries,
  getLatestEntries,
  getLastIngestedAt,
  getLatestEntryForAgent,
  getActivityByDay,
  type EntryRow,
} from "@/lib/db";
import { selectFeaturedDrops } from "@/lib/selectFeaturedDrops";
import { Masthead } from "@/components/Masthead";
import { TodayPanel } from "@/components/TodayPanel";
import { TrackedAgentCard } from "@/components/TrackedAgentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SubscribeForm } from "@/components/SubscribeForm";

export const revalidate = 300;

export default async function HomePage() {
  const liveAgents = getLiveAgents();

  const [recent, lastIngestedAt, ...rest] = await Promise.all([
    safe(async () => {
      // Fetch a wider window so selectFeaturedDrops has enough diversity to pick from.
      const r24 = await getRecentEntries(24);
      const pool = r24.length >= 20 ? r24 : await getLatestEntries(20);
      return selectFeaturedDrops(pool, 5);
    }, [] as EntryRow[]),
    safe(() => getLastIngestedAt(), null as string | null),
    ...liveAgents.flatMap((a) => [
      safe(() => getLatestEntryForAgent(a.slug), null as EntryRow | null),
      safe(() => getActivityByDay(a.slug, 30), [] as { date: string; total: number }[]),
    ]),
  ]);

  const perAgent = liveAgents.map((a, i) => ({
    agent: a,
    latest: rest[i * 2] as EntryRow | null,
    activity: rest[i * 2 + 1] as { date: string; total: number }[],
  }));

  return (
    <main>
      <Masthead
        recentCount={recent.length}
        toolsLive={liveAgents.length}
        lastIngestedAt={lastIngestedAt}
      />

      <section className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
        <SectionHead kicker="Lead drop" title="Latest AI Drop" right={<Link href="/drops" className="text-[var(--color-accent)] hover:underline">All drops →</Link>} />
        <TodayPanel entries={recent} />
      </section>

      <section className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
        <SectionHead kicker="Tools we track" title="Timelines" right={<Link href="/agents" className="text-[var(--color-accent)] hover:underline">All tools →</Link>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perAgent.map(({ agent, latest, activity }) => (
            <TrackedAgentCard key={agent.slug} agent={agent} latest={latest} activity={activity} />
          ))}
        </div>
      </section>

      <section className="border-t border-b border-[var(--color-border)] bg-[var(--color-surface-2)] py-14">
        <div className="mx-auto max-w-2xl px-8 sm:px-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)]">Stay in the loop</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] font-normal text-2xl sm:text-3xl tracking-[-0.01em]">
            One email a week, with the highlights.
          </h3>
          <p className="mt-3 text-[var(--color-text-muted)]">
            We bundle the week&apos;s notable releases, news, and posts into a Sunday morning digest. Free, no ads, unsubscribe in one click.
          </p>
          <div className="mt-5 flex justify-center">
            <SubscribeForm source="home" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
        <SectionHead kicker="New here?" title={`Not sure what an "AI agent" really means?`} />
        <p className="max-w-prose text-[var(--color-text-muted)]">
          The word covers everything from autocomplete to autonomous deputies. Jane wrote a 5-level framework, with capability and PM-trust ratings on each, so you can tell what&apos;s what.
        </p>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 items-center">
          <a
            href="https://www.janeyoubradley.com/#/blog/agentic-ai-landscape-2026"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-[var(--color-border-strong)] bg-[#e7e5e1] px-4 py-2 text-sm font-medium text-[#1a1a1a] transition hover:border-[var(--color-text)] hover:bg-[var(--color-surface-hover)] dark:border-[var(--color-border-strong)] dark:bg-transparent dark:text-[var(--color-text)] dark:hover:bg-[var(--color-surface-hover)] dark:hover:text-[var(--color-text)]"
          >
            Read the framework essay →
          </a>
          <Link href="/learn" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Or scan the agentic ai landscape →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}

function SectionHead({ kicker, title, right }: { kicker: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)]">{kicker}</p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] font-normal text-3xl tracking-[-0.02em] text-[var(--color-text)]">
          {title}
        </h2>
      </div>
      {right && <div className="ml-auto font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">{right}</div>}
    </div>
  );
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[home] db query failed:", err);
    return fallback;
  }
}
