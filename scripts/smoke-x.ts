// Periodic health check for X read access.
// Run: pnpm tsx scripts/smoke-x.ts
// If any path returns "ok", uncomment the X sources in content/agents.ts.

import { fetchTweetsForHandle } from "../lib/x";

const HANDLES = ["claudeai", "AnthropicAI"];

async function main() {
  for (const handle of HANDLES) {
    console.log(`\n=== @${handle} ===`);
    const r = await fetchTweetsForHandle(handle);
    if (r.ok) {
      console.log(`  ok via ${r.data.strategy}, ${r.data.tweets.length} tweets`);
      for (const t of r.data.tweets.slice(0, 3)) {
        console.log(`    [${t.created_at.slice(0, 10)}] ${t.text.slice(0, 80)}`);
      }
    } else {
      console.log(`  failed: ${r.error}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
