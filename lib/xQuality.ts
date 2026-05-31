import Anthropic from "@anthropic-ai/sdk";
import type { EntryType } from "@/lib/db";
import type { XTweet } from "@/lib/x";
import { classifyTweet } from "@/lib/x";

/**
 * Per-tweet editorial verdict from the LLM filter.
 *
 *   keep   = false → don't insert. Pure noise / off-topic.
 *   score  = 0-10 significance (0 noise, always paired with keep=false):
 *            1-2  community color (memes, reactions) — keep but bury
 *            3-4  minor / incremental (small feature, soft commentary, hiring)
 *            5-6  solid (notable feature release, meaningful update / partnership)
 *            7-8  major (significant new capability, big platform expansion)
 *            9-10 landscape-defining (frontier model launch, mega funding round)
 *   kind   = mapped onto our existing entry_type enum
 *   reason = one-sentence audit trail; surfaces in DB for the digest LLM
 */
export type TweetQuality = {
  keep: boolean;
  score: number; // 0-10, see scale above
  kind: EntryType;
  reason: string;
};

export type ScoredTweet = { tweet: XTweet; quality: TweetQuality };

const MODEL = "claude-sonnet-4-6";
const MAX_TWEETS_PER_CALL = 25;

/**
 * Score a batch of tweets via Claude in a single call. Single batched
 * call per ingestXSource invocation keeps cost negligible (~50 tweets/day
 * across the whole site at current scope, ~$0.05/day on Sonnet).
 *
 * Falls back to the heuristic classifier (keep all, mid-low score) if the
 * LLM is unavailable or returns malformed output. We never lose data
 * because of a filter failure.
 */
export async function filterTweetsForQuality(
  tweets: XTweet[],
  context: { agentName: string; handle: string }
): Promise<ScoredTweet[]> {
  if (tweets.length === 0) return [];
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return tweets.map(fallback);
  }

  const batch = tweets.slice(0, MAX_TWEETS_PER_CALL);
  try {
    const verdicts = await scoreBatch(batch, context, apiKey);
    const byId = new Map(verdicts.map((v) => [v.id, v]));
    return tweets.map((t) => {
      const v = byId.get(t.id);
      if (!v) return fallback(t);
      return {
        tweet: t,
        quality: {
          keep: v.keep === true,
          score: clampScore(v.score),
          kind: clampKind(v.kind),
          reason: typeof v.reason === "string" ? v.reason.slice(0, 500) : "",
        },
      };
    });
  } catch (err) {
    console.error("[xQuality] LLM filter failed, falling back:", err);
    return tweets.map(fallback);
  }
}

/* ───────────── internals ───────────── */

type LLMVerdict = {
  id: string;
  keep: boolean;
  score: number;
  kind: string;
  reason: string;
};

function fallback(tweet: XTweet): ScoredTweet {
  return {
    tweet,
    quality: {
      keep: true,
      // Neutral mid so an LLM outage doesn't bury every tweet under the
      // type-based fallback scores used for changelog/blog entries.
      score: 4,
      kind: classifyTweet(tweet.text),
      reason: "fallback (no LLM)",
    },
  };
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? Math.round(n) : 4;
  if (v <= 0) return 0;
  if (v >= 10) return 10;
  return v;
}

function clampKind(k: unknown): EntryType {
  if (k === "release" || k === "news" || k === "post") return k;
  return "post";
}

const SYSTEM_PROMPT = `You are AI Radar's X-tweet quality filter. AI Radar tracks releases, news, and shipping updates from AI agent products. Your score drives which drop leads the homepage, so spread scores across the full range — most tweets are ordinary and should land in the middle, not the top.

For each tweet you receive, decide:
- keep: true if it would matter to a reader following AI agent shipping news; false if pure noise / off-topic.
- score: 0-10 significance to that reader (use the full range, anchors below).
- kind: "release" (product / model / feature shipped), "news" (announcement / partnership / research / hiring), "post" (commentary, demo, community signal).
- reason: one short sentence explaining the call.

SCORE ANCHORS:
- 9-10: landscape-defining. Frontier model launch, category-defining product, mega funding round / acquisition that resets the competitive picture.
- 7-8: major. A significant new capability shipped, big platform expansion, flagship feature that unlocks new workflows for many users.
- 5-6: solid. A notable feature release, meaningful product update, real partnership — useful but not headline-moving.
- 3-4: minor / incremental. Small feature, soft launch, roadmap hint, hiring that signals investment, substantive founder commentary.
- 1-2: community color. Memes, jokes, reactions to others' news, low-text media posts. Keep for texture, but bury.
- 0: noise — set keep=false. Off-topic (sports, politics, personal), generic thanks/greetings, promo spam, replies that don't move the product story.

Judge significance, not enthusiasm: a calm "X now works on Windows" can outrank a hype-filled minor tweak. Reserve 9-10 for genuinely rare, industry-level events.

Return ONLY a JSON array (no prose). Schema:
[{"id": "...", "keep": true, "score": 6, "kind": "release", "reason": "..."}]`;

async function scoreBatch(
  tweets: XTweet[],
  context: { agentName: string; handle: string },
  apiKey: string
): Promise<LLMVerdict[]> {
  const client = new Anthropic({ apiKey });
  const userPayload = JSON.stringify(
    {
      context,
      tweets: tweets.map((t) => ({ id: t.id, text: t.text })),
    },
    null,
    0
  );

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPayload }],
  });

  const text = res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  // Strip optional ```json fences if the model adds them despite instructions.
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed: unknown = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error("LLM returned non-array");
  return parsed as LLMVerdict[];
}
