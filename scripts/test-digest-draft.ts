import { draftIssueForWeek } from "@/lib/digest-draft";

async function main() {
  const weekKey = process.argv[2] ?? "2026-05-24";
  console.log(`[test-digest-draft] drafting weekKey=${weekKey} (dry-run)`);
  const t0 = Date.now();
  const { issue, modelUsed } = await draftIssueForWeek(weekKey, { dryRun: true });
  const ms = Date.now() - t0;
  console.log(`\n[test-digest-draft] model=${modelUsed} elapsed=${(ms / 1000).toFixed(1)}s`);
  console.log(`headline: "${issue.headlinePre}<${issue.headlineAccent}>${issue.headlinePost}"`);
  console.log(`stats: ${issue.stats.drops} drops / ${issue.stats.tools} tools / ${issue.stats.themes} themes`);
  console.log(`themes:`);
  for (const t of issue.themes) {
    console.log(`  ${t.num} ${t.label.toUpperCase()} (${t.count}) — ${t.headline}`);
    console.log(`     lede: ${t.lede.slice(0, 100)}${t.lede.length > 100 ? "..." : ""}`);
  }
  console.log(`footer: "${issue.footerPunchPre}<${issue.footerPunchAccent}>${issue.footerPunchPost}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
