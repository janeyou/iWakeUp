import { ISSUE_001 } from "@/lib/digest-content";
import { saveDigestIssue } from "@/lib/db";

async function main() {
  const result = await saveDigestIssue(ISSUE_001.weekKey, ISSUE_001, "seed:hand-curated");
  console.log(
    `[seed-issue-001] ${result.regenerated ? "regenerated" : "inserted"} week_key=${ISSUE_001.weekKey}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
