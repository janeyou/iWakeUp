import Link from "next/link";
import { getLiveAgents, AGENTS } from "@/content/agents";
import {
  getRecentEntries,
  getLastIngestedAt,
  getLatestEntryForAgent,
  getActivityByDay,
  type EntryRow,
} from "@/lib/db";
import { Masthead } from "@/components/Masthead";
import { TodayPanel } from "@/components/TodayPanel";
import { TrackedAgentCard } from "@/components/TrackedAgentCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SubscribeForm } from "@/components/SubscribeForm";
import { SuggestToolForm } from "@/components/SuggestToolForm";

export const revalidate = 300;

export default async function HomePage() {
  const liveAgents = getLiveAgents();
  const queued = AGENTS.filter((a) => a.status === "coming_soon");

  const [recent, lastIngestedAt, ...rest] = await Promise.all([
    safe(() => getRecentEntries(24), [] as EntryRow[]),
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
        toolsTotal={AGENTS.length}
        lastIngestedAt={lastIngestedAt}
      />

      <section className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
        <SectionHead kicker="Lead drop" title="Today's AI Drop" right={<Link href="/drops" className="text-[var(--color-accent)] hover:underline">All drops →</Link>} />
        <TodayPanel entries={recent} />
      </section>

      <section className="mx-auto max-w-6xl px-8 sm:px-12 py-14">
        <SectionHead kicker="Tools we track" title="Timelines" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {perAgent.map(({ agent, latest, activity }) => (
            <TrackedAgentCard key={agent.slug} agent={agent} latest={latest} activity={activity} />
          ))}
        </div>
        {queued.length > 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-[var(--color-border-strong)] p-5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
              Coming soon · {queued.length} tools queued
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {queued.map((a) => (
                <span key={a.slug} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1 text-xs text-[var(--color-text-muted)]">
                  {a.name}
                  <span className="font-mono text-[9.5px] uppercase tracking-wider text-[var(--color-text-faint)]">queued</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="border-t border-b border-[var(--color-border)] bg-[var(--color-surface-2)] py-14">
        <div className="mx-auto max-w-2xl px-8 sm:px-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--color-accent)]">Stay in the loop</p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] font-normal text-2xl sm:text-3xl tracking-[-0.01em]">
            One email a week, with the highlights.
          </h3>
          <p className="mt-3 text-[var(--color-text-muted)]">
            We bundle the week&apos;s notable releases, news, and posts into a Sunday-evening digest. Free, no ads, unsubscribe in one click.
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
            className="rounded-lg border border-[var(--color-accent)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-transparent hover:text-[var(--color-accent)]"
          >
            Read the framework essay →
          </a>
          <Link href="/learn" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            Or scan the live landscape →
          </Link>
        </div>
      </section>

      <SiteFooter suggest={<SuggestToolForm compact />} />
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
