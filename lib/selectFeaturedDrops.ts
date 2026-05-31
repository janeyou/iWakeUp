import type { EntryRow } from "@/lib/db";

const THREAD_WINDOW_MS = 3 * 60 * 1000; // 3 minutes

/**
 * Default significance (0-10 scale) for entries with no LLM quality_score.
 * Only changelog/blog entries are unscored — X posts always carry a score.
 * A real shipped feature sits above-average, so routine tweets (4-6) rank
 * below official releases while genuinely huge news (7-10) can still lead.
 * Tunable: bump these to weight official releases harder vs X chatter.
 */
const UNSCORED_RANK: Record<EntryRow["entry_type"], number> = {
  release: 6,
  news: 5,
  post: 3,
};

/**
 * Signal rank: 10 = best. Uses the LLM quality_score when available (X posts),
 * falls back to entry_type for blog/changelog entries that are not LLM-scored.
 */
function signalRank(e: EntryRow): number {
  if (e.quality_score != null) return e.quality_score;
  return UNSCORED_RANK[e.entry_type];
}

/**
 * Within a list of entries, collapse tweet threads into a single entry.
 * A "thread" is 2+ X posts from the same agent published within 3 minutes
 * of each other. Only the earliest tweet in each cluster is kept.
 */
export function dedupeThreads(entries: EntryRow[]): EntryRow[] {
  const xPosts = entries.filter((e) => e.source_type === "x");
  const nonX = entries.filter((e) => e.source_type !== "x");

  // Sort x posts by agent + ascending time for window comparison.
  const sorted = [...xPosts].sort(
    (a, b) =>
      a.agent_slug.localeCompare(b.agent_slug) ||
      new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
  );

  const kept: EntryRow[] = [];
  const lastKeptMs = new Map<string, number>();

  for (const entry of sorted) {
    const ts = new Date(entry.published_at).getTime();
    const prev = lastKeptMs.get(entry.agent_slug) ?? -Infinity;
    if (ts - prev < THREAD_WINDOW_MS) continue; // thread continuation — skip
    lastKeptMs.set(entry.agent_slug, ts);
    kept.push(entry);
  }

  // Merge back with non-X entries, restore published_at DESC order.
  return [...nonX, ...kept].sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

/**
 * Selects up to `limit` entries for the home "Latest drops" panel.
 *
 * Strategy:
 *   1. Thread-deduplicate all X posts (3-minute window per agent).
 *   2. Pick one "champion" per agent — best by type priority, then recency.
 *   3. Sort champions: release > news > post, then recency.
 *   4. Fill remaining slots from runner-ups, same sort order.
 *
 * Result: as many distinct agents as possible, signal-first, no thread spam.
 */
export function selectFeaturedDrops(
  entries: EntryRow[],
  limit = 5
): EntryRow[] {
  if (entries.length === 0) return [];

  const sortFn = (a: EntryRow, b: EntryRow) =>
    signalRank(b) - signalRank(a) ||
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime();

  // 1. Pick the best overall entry as the lead.
  const allSorted = [...entries].sort(sortFn);
  const lead = allSorted[0];

  // 2. Group everything except the lead by agent, each queue sorted best-first.
  const byAgent = new Map<string, EntryRow[]>();
  for (const e of allSorted.slice(1)) {
    const arr = byAgent.get(e.agent_slug) ?? [];
    arr.push(e);
    byAgent.set(e.agent_slug, arr);
  }

  // 3. Build round-robin order: lead's agent goes last so it doesn't
  //    immediately take another consecutive slot.
  const agentOrder = Array.from(byAgent.keys()).sort((a, b) =>
    a === lead.agent_slug ? 1 : b === lead.agent_slug ? -1 : 0
  );
  const queues = agentOrder.map((slug) => byAgent.get(slug)!);
  const cursors = queues.map(() => 0);

  // 4. Round-robin fill positions 1..limit-1.
  const rest: EntryRow[] = [];
  while (rest.length < limit - 1) {
    let added = false;
    for (let i = 0; i < queues.length && rest.length < limit - 1; i++) {
      const idx = cursors[i];
      if (idx < queues[i].length) {
        rest.push(queues[i][idx]);
        cursors[i]++;
        added = true;
      }
    }
    if (!added) break;
  }

  return [lead, ...rest];
}
