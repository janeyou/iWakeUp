import Link from "next/link";
import type { Metadata } from "next";
import { AGENTS, getAgentBySlug } from "@/content/agents";
import {
  getAllSourceStates,
  getEntryCountsByAgent,
  getLastIngestedAt,
  type SourceStateRow,
} from "@/lib/db";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Status · AI Radar",
  description: "Operator dashboard for ingestion state, entry counts, and subscribers.",
};

// Always fresh, never cache. This is the operator dashboard.
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const [states, counts, lastIngestedAt] = await Promise.all([
    safe(() => getAllSourceStates(), [] as SourceStateRow[]),
    safe(() => getEntryCountsByAgent(), [] as { agent_slug: string; count: number }[]),
    safe(() => getLastIngestedAt(), null as string | null),
  ]);

  const stamp = lastIngestedAt
    ? new Date(lastIngestedAt as string).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "never";

  const countsBySlug = new Map(
    (counts as { agent_slug: string; count: number }[]).map((c) => [c.agent_slug, c.count])
  );
  const sourcesByAgent = new Map<string, SourceStateRow[]>();
  for (const s of states as SourceStateRow[]) {
    const arr = sourcesByAgent.get(s.agent_slug) ?? [];
    arr.push(s);
    sourcesByAgent.set(s.agent_slug, arr);
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]"
      >
        ← AI Radar
      </Link>

      <header className="mt-10 mb-10">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">
          Status
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)]">
          Ingestion dashboard
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Last ingest: <span className="font-mono text-[var(--color-text)]">{stamp} PT</span>
        </p>
      </header>

      {/* Summary tiles */}
      <section className="mb-12 grid grid-cols-3 gap-4">
        <Tile label="Live agents" value={AGENTS.filter((a) => a.status === "live").length} />
        <Tile label="Total entries" value={Array.from(countsBySlug.values()).reduce((s, n) => s + n, 0)} />
        <Tile label="Sources tracked" value={(states as SourceStateRow[]).length} />
      </section>

      {/* Per-agent + sources */}
      <section className="mb-12">
        <h2 className="mb-6 text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Per agent
        </h2>
        <div className="space-y-6">
          {AGENTS.filter((a) => a.status === "live").map((agent) => {
            const sources = sourcesByAgent.get(agent.slug) ?? [];
            const entries = countsBySlug.get(agent.slug) ?? 0;
            return (
              <article
                key={agent.slug}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <header className="mb-4 flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-[var(--color-text)]">
                    {agent.name}
                  </h3>
                  <p className="font-mono text-xs text-[var(--color-text-faint)]">
                    {entries} entries
                  </p>
                </header>
                {sources.length === 0 ? (
                  <p className="text-sm text-[var(--color-text-faint)]">
                    No source state yet. Run the cron once to populate.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {sources.map((s) => (
                      <SourceRow key={s.url} state={s} />
                    ))}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* Schema migration hint */}
      <SchemaHint states={states as SourceStateRow[]} />

      {/* How to see progress */}
      <section className="mb-12 rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          How to see progress
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
          <li>
            <span className="font-mono text-[var(--color-accent)]">1.</span>{" "}
            Look at <b className="text-[var(--color-text)]">Last ingest</b> at the top. If it
            says <code>never</code> or is hours old, run the cron manually:
            <pre className="mt-2 overflow-x-auto rounded bg-[var(--color-bg)] p-3 font-mono text-xs">
              {`source .env.local\ncurl -s -H "Authorization: Bearer $CRON_SECRET" \\\n  "http://localhost:3000/api/cron/daily-update?force=true" | jq`}
            </pre>
          </li>
          <li>
            <span className="font-mono text-[var(--color-accent)]">2.</span> Refresh this page.
            Each source row shows <b className="text-[var(--color-text)]">last_fetched_at</b>,{" "}
            <b className="text-[var(--color-text)]">status</b>, and{" "}
            <b className="text-[var(--color-text)]">last_entry_count</b>. A red row means the
            source errored; the message is shown.
          </li>
          <li>
            <span className="font-mono text-[var(--color-accent)]">3.</span> Visit{" "}
            <Link href="/agents/claude" className="text-[var(--color-accent)] hover:underline">
              /agents/claude
            </Link>{" "}
            or{" "}
            <Link href="/drops" className="text-[var(--color-accent)] hover:underline">
              /drops
            </Link>{" "}
            to see the actual entries. Toggle the filter pills for News and Posts.
          </li>
        </ol>
      </section>

      <footer className="mt-20 border-t border-[var(--color-border)] pt-8">
        <SiteFooter />
      </footer>
    </main>
  );
}

function Tile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold text-[var(--color-text)]">
        {value}
        {suffix && (
          <span className="text-sm text-[var(--color-text-faint)]"> {suffix}</span>
        )}
      </p>
    </div>
  );
}

function SourceRow({ state }: { state: SourceStateRow }) {
  const isError = state.last_error !== null;
  const fetched = new Date(state.last_fetched_at).toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li
      className={[
        "rounded-lg border p-3",
        isError
          ? "border-[var(--color-news-soft)] bg-[var(--color-news-soft)]"
          : "border-[var(--color-border)]",
      ].join(" ")}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-[11px] text-[var(--color-text-faint)]">
          [{state.source_type}]
        </p>
        <p className="font-mono text-[11px] text-[var(--color-text-faint)]">
          {fetched} PT
        </p>
      </div>
      <p className="mt-1 break-all text-sm text-[var(--color-text)]">
        <a
          href={state.url}
          target="_blank"
          rel="noreferrer"
          className="hover:text-[var(--color-accent)]"
        >
          {state.url}
        </a>
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--color-text-muted)]">
        <span>http {state.last_status ?? "—"}</span>
        <span>last batch: {state.last_entry_count}</span>
        {state.x_user_id && <span>x_user_id {state.x_user_id}</span>}
        {state.content_hash && (
          <span>hash {state.content_hash.slice(0, 12)}…</span>
        )}
      </div>
      {isError && (
        <p className="mt-2 text-xs text-[var(--color-news)]">{state.last_error}</p>
      )}
    </li>
  );
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[status] db query failed:", err);
    return fallback;
  }
}

function SchemaHint({ states }: { states: SourceStateRow[] }) {
  const errors = states.filter(
    (s) =>
      s.last_error &&
      (/column .* does not exist/i.test(s.last_error) ||
        /relation .* does not exist/i.test(s.last_error))
  );
  if (errors.length === 0) return null;
  const sample = errors[0].last_error ?? "";

  return (
    <section className="mb-12 rounded-xl border border-[var(--color-news-soft)] bg-[var(--color-news-soft)] p-5">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-news)]">
        Schema migration pending
      </p>
      <p className="mt-2 text-sm text-[var(--color-text)]">
        {errors.length} {errors.length === 1 ? "source" : "sources"} report a missing
        column / relation. Sample error:
      </p>
      <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">{sample}</p>
      <p className="mt-3 text-sm text-[var(--color-text-muted)]">
        Run <code className="rounded bg-[var(--color-bg)] px-1 py-0.5 font-mono">pnpm seed</code> to apply the latest schema (idempotent). Then re-trigger the cron with{" "}
        <code className="rounded bg-[var(--color-bg)] px-1 py-0.5 font-mono">?force=true</code>.
      </p>
    </section>
  );
}
