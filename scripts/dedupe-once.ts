import { getLiveAgents } from "../content/agents";
import { dedupeChangelogVsBlog } from "../lib/ingest";

async function main() {
  for (const a of getLiveAgents()) {
    const r = await dedupeChangelogVsBlog(a.slug);
    console.log(`${a.slug}: deleted ${r.deleted}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
