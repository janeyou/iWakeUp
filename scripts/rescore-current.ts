/**
 * Re-score the X rows that currently feed the homepage onto the new 1-10
 * significance scale, so today's view is accurate immediately (new ingests
 * carry the scale forward on their own).
 *
 * Mirrors app/page.tsx's pool selection exactly: recent-24h if it has >= 20
 * rows, otherwise latest-20. Only X rows carry an LLM score, so non-X rows
 * are left untouched. Rows the rescorer now judges as noise (score 0 /
 * keep=false, including duplicates) are deleted, matching refilter-x-quality.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/rescore-current.ts            # dry run
 *   npx tsx --env-file=.env.local scripts/rescore-current.ts --apply    # mutate
 */
import { sql } from "@vercel/postgres";
import { getRecentEntries, getLatestEntries, type EntryRow } from "../lib/db";
import { getAgentBySlug } from "../content/agents";
import { filterTweetsForQuality } from "../lib/xQuality";
import type { XTweet } from "../lib/x";

const APPLY = process.argv.includes("--apply");

function handleFromUrl(url: string): string {
  const m = url.match(/x\.com\/([^/?#]+)/i);
  return m ? m[1] : "unknown";
}

async function main() {
  console.log(APPLY ? "🟢 APPLY mode: will mutate the DB.\n" : "🔵 DRY RUN: no DB changes. Pass --apply to commit.\n");

  // Same pool the homepage builds (see app/page.tsx).
  const r24 = await getRecentEntries(24);
  const pool = r24.length >= 20 ? r24 : await getLatestEntries(20);
  const xRows = pool.filter((e) => e.source_type === "x" && e.tweet_id);

  console.log(`Homepage pool: ${pool.length} rows (${r24.length >= 20 ? "recent-24h" : "latest-20"}), ${xRows.length} are X tweets.\n`);
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

      if (!q.keep || q.score === 0) {
        console.log(`  DROP ${head}  ${snip}\n       reason: ${q.reason}`);
        if (APPLY) await sql`DELETE FROM entries WHERE id = ${r.id}`;
        dropped++;
      } else {
        console.log(`  KEEP ${head}  ${snip}`);
        if (APPLY) {
          await sql`
            UPDATE entries
            SET quality_score = ${q.score}, quality_reason = ${q.reason}, entry_type = ${q.kind}
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
