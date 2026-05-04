/**
 * Quick health check for the X-quality LLM path. Calls
 * `filterTweetsForQuality` with one synthetic tweet. If the result has
 * `quality_reason === "fallback (no LLM)"`, the Anthropic key is bad
 * or the API call failed. Otherwise the LLM responded.
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/ping-llm.ts
 *   # or against production:
 *   vercel env pull .env.production.local --environment production --yes
 *   npx tsx --env-file=.env.production.local scripts/ping-llm.ts
 *   rm -f .env.production.local
 */
import { filterTweetsForQuality } from "../lib/xQuality";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("✗ ANTHROPIC_API_KEY not set in env. Will hit fallback path.");
  }

  const fakeTweet = {
    id: "ping-tweet-id",
    text: "OpenAI ships GPT-5.5 with new agent capabilities and a Codex update.",
    created_at: new Date().toISOString(),
    author_username: "ping",
  };

  const t0 = Date.now();
  const result = await filterTweetsForQuality([fakeTweet], {
    agentName: "Test",
    handle: "ping",
  });
  const elapsed = Date.now() - t0;

  const q = result[0]?.quality;
  if (!q) {
    console.log("✗ no result returned");
    process.exit(1);
  }
  if (q.reason === "fallback (no LLM)") {
    console.log(`✗ FALLBACK triggered after ${elapsed}ms`);
    console.log(`  ANTHROPIC_API_KEY is missing/invalid OR the call failed.`);
    process.exit(1);
  }

  console.log(`✓ LLM healthy (${elapsed}ms)`);
  console.log(`  score=${q.score}  keep=${q.keep}  kind=${q.kind}`);
  console.log(`  reason: ${q.reason}`);
}

main().catch((e) => {
  console.error("✗ unexpected error:", e);
  process.exit(1);
});
