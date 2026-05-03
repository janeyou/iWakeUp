import { runDailyIngestion } from "../lib/ingest";

async function main() {
  const force = process.argv.includes("--force");
  console.log(`Running ingestion${force ? " (force)" : ""}...`);
  const results = await runDailyIngestion({ force });
  for (const r of results) {
    console.log(`\n${r.agent}: ${r.totalInserted} inserted total`);
    for (const s of r.sources) {
      const tag = `[${s.type}]`;
      if (s.status === "error") {
        console.error(`  ${tag} ${s.url}\n    ERROR: ${s.error}`);
      } else if (s.status === "skipped_cache") {
        console.log(`  ${tag} ${s.url}\n    skipped (cache)`);
      } else {
        console.log(
          `  ${tag} ${s.url}\n    ${s.status}, found ${s.found ?? 0}, inserted ${s.inserted ?? 0}`
        );
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
