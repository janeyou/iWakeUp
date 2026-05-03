import { fetchAndHash } from "../lib/fetch";
import { parseSource } from "../lib/scrape";
import { AGENTS } from "../content/agents";

async function main() {
  const claude = AGENTS.find((a) => a.slug === "claude")!;
  for (const source of claude.sources) {
    if (source.type === "x") continue;
    console.log(`\n=== ${source.label} (${source.url}) ===`);
    try {
      const fetched = await fetchAndHash(source.url);
      console.log(`HTTP ${fetched.status}, ${fetched.html.length} bytes`);
      const entries = parseSource(fetched.html, source);
      console.log(`Parsed ${entries.length} entries`);
      for (const e of entries.slice(0, 5)) {
        console.log(`  [${e.entry_type}] ${e.published_at.slice(0, 10)} ${e.title}`);
        console.log(`    ${e.source_url}`);
      }
    } catch (err) {
      console.error(`ERROR: ${err}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
