import { sql } from "@vercel/postgres";
import { RETENTION_DAYS } from "../lib/ingest";

/**
 * One-shot DB trim. Deletes entries whose `published_at` is older than
 * RETENTION_DAYS. Idempotent. Run once after deploying the parser PR so
 * the existing Claude history collapses to the same 90-day window the
 * ingest pipeline now enforces.
 *
 * Usage:
 *   pnpm tsx scripts/trim-90.ts          # dry-run, prints counts only
 *   pnpm tsx scripts/trim-90.ts --apply  # actually delete
 */
async function main() {
  const apply = process.argv.includes("--apply");
  const cutoff = `${RETENTION_DAYS} days`;

  const { rows: counts } = await sql<{
    agent_slug: string;
    count: string;
    oldest: string;
  }>`
    SELECT
      agent_slug,
      COUNT(*)::text AS count,
      MIN(published_at)::text AS oldest
    FROM entries
    WHERE published_at < now() - (${cutoff})::interval
    GROUP BY agent_slug
    ORDER BY agent_slug
  `;

  if (counts.length === 0) {
    console.log(`[trim-90] nothing older than ${RETENTION_DAYS} days; DB already trim.`);
    return;
  }

  let total = 0;
  console.log(`[trim-90] entries older than ${RETENTION_DAYS} days:`);
  for (const r of counts) {
    const n = Number(r.count);
    total += n;
    console.log(`  ${r.agent_slug}: ${n}  (oldest ${r.oldest.slice(0, 10)})`);
  }
  console.log(`  TOTAL: ${total}`);

  if (!apply) {
    console.log(`[trim-90] dry-run. Re-run with --apply to delete.`);
    return;
  }

  const { rowCount } = await sql`
    DELETE FROM entries
    WHERE published_at < now() - (${cutoff})::interval
  `;
  console.log(`[trim-90] deleted ${rowCount} rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
