import { runDailyIngestion } from "../lib/ingest";

async function main() {
  console.log("Running ingestion...");
  const results = await runDailyIngestion();
  for (const r of results) {
    if (r.error) {
      console.error(`  ${r.agent}: ERROR — ${r.error}`);
    } else {
      console.log(`  ${r.agent}: found ${r.found}, inserted ${r.inserted}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
