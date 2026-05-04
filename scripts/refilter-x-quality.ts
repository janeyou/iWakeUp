/**
 * Retroactive cleanup: re-run the LLM x-quality filter against existing X
 * rows and either delete (score=0) or update (score>=1 with new
 * quality_score + quality_reason + entry_type).
 *
 * Targets rows where the filter hasn't been run yet:
 *   - quality_score IS NULL (rows ingested before the filter shipped), OR
 *   - quality_reason = 'fallback (no LLM)' (rows ingested while the LLM was
 *     unavailable, kept defensively).
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/refilter-x-quality.ts            # dry run
 *   pnpm tsx --env-file=.env.local scripts/refilter-x-quality.ts --apply    # actually mutate
 *
 * Or against production:
 *   vercel env pull .env.production.local --environment production --yes
 *   npx tsx --env-file=.env.production.local scripts/refilter-x-quality.ts --apply
 *   rm -f .env.production.local
 */
import { sql } from "@vercel/postgres";
import { getAgentBySlug } from "../content/agents";
import { filterTweetsForQuality } from "../lib/xQuality";
import type { XTweet } from "../lib/x";

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 25;

type Row = {
  id: number;
  agent_slug: string;
  title: string;
  summary: string | null;
  tweet_id: string | null;
  source_url: string;
  published_at: string;
  quality_reason: string | null;
};

function handleFromUrl(url: string): string {
  const m = url.match(/x\.com\/([^/?#]+)/i);
  return m ? m[1] : "unknown";
}

async function main() {
  console.log(APPLY ? "🟢 APPLY mode: will mutate the DB.\n" : "🔵 DRY RUN: no DB changes. Pass --apply to commit.\n");

  const { rows } = await sql<Row>`
    SELECT id, agent_slug, title, summary, tweet_id, source_url,
           published_at::text, quality_reason
    FROM entries
    WHERE source_type = 'x'
      AND (quality_score IS NULL OR quality_reason = 'fallback (no LLM)')
    ORDER BY agent_slug, id
  `;

  if (rows.length === 0) {
    console.log("Nothing to refilter. All X rows already LLM-scored.");
    return;
  }
  console.log(`Found ${rows.length} unscored X rows.\n`);

  // Group by (agent, handle) so the LLM gets the right context per batch
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = `${r.agent_slug}::${handleFromUrl(r.source_url)}`;
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  let totalKept = 0;
  let totalDropped = 0;
  let totalUpdated = 0;
  let totalSkippedFallback = 0;

  for (const [key, entries] of groups) {
    const [slug, handle] = key.split("::");
    const agent = getAgentBySlug(slug);
    if (!agent) {
      console.log(`(skipping unknown agent ${slug})`);
      continue;
    }
    console.log(`\n=== ${agent.name} via @${handle} (${entries.length} tweets) ===`);

    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batch = entries.slice(i, i + BATCH_SIZE);

      const tweets: XTweet[] = batch.map((r) => ({
        id: r.tweet_id ?? `entry-${r.id}`,
        text: (r.summary || r.title || "").slice(0, 1000),
        created_at: r.published_at,
        author_username: handle,
      }));

      const scored = await filterTweetsForQuality(tweets, {
        agentName: agent.name,
        handle,
      });

      const byTweetId = new Map(scored.map((s) => [s.tweet.id, s]));

      for (const r of batch) {
        const lookupId = r.tweet_id ?? `entry-${r.id}`;
        const s = byTweetId.get(lookupId);
        if (!s) continue;
        const q = s.quality;

        if (q.reason === "fallback (no LLM)") {
          totalSkippedFallback++;
          console.log(`  SKIP id=${r.id} (LLM unavailable)`);
          continue;
        }

        const head = `id=${r.id} score=${q.score} kind=${q.kind}`;
        const titleSnippet = r.title.slice(0, 60);

        if (!q.keep || q.score === 0) {
          console.log(`  DROP ${head}  ${titleSnippet}`);
          console.log(`       reason: ${q.reason}`);
          if (APPLY) {
            await sql`DELETE FROM entries WHERE id = ${r.id}`;
          }
          totalDropped++;
        } else {
          console.log(`  KEEP ${head}  ${titleSnippet}`);
          if (APPLY) {
            await sql`
              UPDATE entries
              SET quality_score = ${q.score},
                  quality_reason = ${q.reason},
                  entry_type = ${q.kind}
              WHERE id = ${r.id}
            `;
          }
          totalKept++;
          totalUpdated++;
        }
      }
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`SUMMARY (${APPLY ? "APPLIED" : "dry run"})`);
  console.log(`  Kept + updated: ${totalUpdated}`);
  console.log(`  Dropped:        ${totalDropped}`);
  console.log(`  Skipped (LLM unavailable): ${totalSkippedFallback}`);
  console.log(`  Total processed: ${totalKept + totalDropped + totalSkippedFallback}`);
  if (!APPLY) console.log(`\nRun again with --apply to commit these changes.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
