/**
 * Re-score the X rows that currently feed the homepage onto the new 1-10
 * significance scale, so today's view is accurate immediately (new ingests
 * carry the scale forward on their own).
 *
 * Default: mirrors app/page.tsx's pool selection exactly (recent-24h if it
 * has >= 20 rows, otherwise latest-20). Pass --hours=N to instead target a
 * fixed ingested-at window, e.g. --hours=168 matches the weekly digest's
 * getRecentEntries(24*7) so the coming digest reads a consistent scale.
 *
 * Only X rows carry an LLM score, so non-X rows are left untouched. Rows the
 * rescorer now judges as noise (score 0 / keep=false, including duplicates)
 * are deleted, matching refilter-x-quality.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/rescore-current.ts            # dry run, homepage pool
 *   npx tsx --env-file=.env.local scripts/rescore-current.ts --hours=168 # dry run, 7-day digest window
 *   npx tsx --env-file=.env.local scripts/rescore-current.ts --apply    # mutate
 */
import { sql } from "@vercel/postgres";
import { getRecentEntries, getLatestEntries, type EntryRow } from "../lib/db";
import { getAgentBySlug } from "../content/agents";
import { filterTweetsForQuality } from "../lib/xQuality";
import type { XTweet } from "../lib/x";

const APPLY = process.argv.includes("--apply");
const HOURS_ARG = process.argv.find((a) => a.startsWith("--hours="));
const HOURS = HOURS_ARG ? Number(HOURS_ARG.split("=")[1]) : null;

// When provided, delete ONLY these ids; every other row is updated to its new
// score (even ones the rescorer would otherwise drop), so a curated cleanup
// doesn't silently lose rows. Without it, falls back to auto-delete on noise.
const DELETE_IDS_ARG = process.argv.find((a) => a.startsWith("--delete-ids="));
const DELETE_ALLOWLIST = DELETE_IDS_ARG
  ? new Set(DELETE_IDS_ARG.split("=")[1].split(",").map((s) => Number(s.trim())))
  : null;

function handleFromUrl(url: string): string {
  const m = url.match(/x\.com\/([^/?#]+)/i);
  return m ? m[1] : "unknown";
}

async function main() {
  console.log(APPLY ? "🟢 APPLY mode: will mutate the DB.\n" : "🔵 DRY RUN: no DB changes. Pass --apply to commit.\n");

  let pool: EntryRow[];
  let poolDesc: string;
  if (HOURS != null) {
    // Match the weekly digest's window: getRecentEntries(24*7).
    pool = await getRecentEntries(HOURS);
    poolDesc = `last ${HOURS}h by ingested_at`;
  } else {
    // Same pool the homepage builds (see app/page.tsx).
    const r24 = await getRecentEntries(24);
    pool = r24.length >= 20 ? r24 : await getLatestEntries(20);
    poolDesc = r24.length >= 20 ? "recent-24h" : "latest-20";
  }
  const xRows = pool.filter((e) => e.source_type === "x" && e.tweet_id);

  console.log(`Pool: ${pool.length} rows (${poolDesc}), ${xRows.length} are X tweets.\n`);
  if (xRows.length === 0) {
    console.log("No X rows in the current pool. Nothing to re-score.");
    return;
  }

  // Group by (agent, handle) so the LLM gets the right context per batch.
  const groups = new Map<string, EntryRow[]>();
  for (const r of xRows) {
    const key = `${r.agent_slug}::${handleFromUrl(r.source_url)}`;
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  let updated = 0;
  let dropped = 0;
  let skipped = 0;

  for (const [key, entries] of groups) {
    const [slug, handle] = key.split("::");
    const agent = getAgentBySlug(slug);
    if (!agent) {
      console.log(`(skipping unknown agent ${slug})`);
      continue;
    }
    console.log(`\n=== ${agent.name} via @${handle} (${entries.length} tweets) ===`);

    const tweets: XTweet[] = entries.map((r) => ({
      id: r.tweet_id ?? `entry-${r.id}`,
      text: (r.summary || r.title || "").slice(0, 1000),
      created_at: r.published_at,
      author_username: handle,
    }));

    const scored = await filterTweetsForQuality(tweets, { agentName: agent.name, handle });
    const byId = new Map(scored.map((s) => [s.tweet.id, s]));

    for (const r of entries) {
      const s = byId.get(r.tweet_id ?? `entry-${r.id}`);
      if (!s) continue;
      const q = s.quality;

      if (q.reason === "fallback (no LLM)") {
        skipped++;
        console.log(`  SKIP id=${r.id} (LLM unavailable) — left as-is`);
        continue;
      }

      const head = `id=${r.id} ${r.quality_score ?? "null"}→${q.score} kind=${r.entry_type}→${q.kind}`;
      const snip = r.title.slice(0, 60);

      // With an allowlist, delete only listed ids and update everything else.
      // Without one, fall back to auto-deleting noise (score 0 / keep=false).
      const shouldDelete = DELETE_ALLOWLIST
        ? DELETE_ALLOWLIST.has(r.id)
        : !q.keep || q.score === 0;

      if (shouldDelete) {
        console.log(`  DROP ${head}  ${snip}\n       reason: ${q.reason}`);
        if (APPLY) await sql`DELETE FROM entries WHERE id = ${r.id}`;
        dropped++;
      } else {
        // Floor kept rows at 1 so a force-kept low-signal row isn't written as
        // 0 (which reads as noise) when we deliberately chose to keep it.
        const score = Math.max(q.score, 1);
        console.log(`  KEEP ${head}  ${snip}`);
        if (APPLY) {
          await sql`
            UPDATE entries
            SET quality_score = ${score}, quality_reason = ${q.reason}, entry_type = ${q.kind}
            WHERE id = ${r.id}
          `;
        }
        updated++;
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`SUMMARY (${APPLY ? "APPLIED" : "dry run"})`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Dropped: ${dropped}`);
  console.log(`  Skipped (LLM unavailable): ${skipped}`);
  if (!APPLY) console.log(`\nRun again with --apply to commit these changes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
