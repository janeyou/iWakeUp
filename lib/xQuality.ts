import Anthropic from "@anthropic-ai/sdk";
import type { EntryType } from "@/lib/db";
import type { XTweet } from "@/lib/x";
import { classifyTweet } from "@/lib/x";

/**
 * Per-tweet editorial verdict from the LLM filter.
 *
 *   keep   = false → don't insert. Pure noise / off-topic.
 *   score  = 0 noise (always paired with keep=false)
 *            1 low signal but worth keeping (community color, soft commentary)
 *            2 medium signal (reactions to product news, soft launches)
 *            3 high signal (clear release / model / API change / launch)
 *   kind   = mapped onto our existing entry_type enum
 *   reason = one-sentence audit trail; surfaces in DB for the digest LLM
 */
export type TweetQuality = {
  keep: boolean;
  score: 0 | 1 | 2 | 3;
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
      score: 1,
      kind: classifyTweet(tweet.text),
      reason: "fallback (no LLM)",
    },
  };
}

function clampScore(n: unknown): 0 | 1 | 2 | 3 {
  const v = typeof n === "number" ? Math.round(n) : 1;
  if (v <= 0) return 0;
  if (v >= 3) return 3;
  return v as 1 | 2;
}

function clampKind(k: unknown): EntryType {
  if (k === "release" || k === "news" || k === "post") return k;
  return "post";
}

const SYSTEM_PROMPT = `You are AI Radar's X-tweet quality filter. AI Radar tracks releases, news, and shipping updates from AI agent products.

For each tweet you receive, decide:
- keep: true if it would matter to a reader following AI agent shipping news; false if pure noise / off-topic.
- score: 0 (noise, drop), 1 (low signal, keep), 2 (medium), 3 (high signal: clear release / model / API change / launch).
- kind: "release" (product / model / feature shipped), "news" (announcement / partnership / research / hiring), "post" (commentary, demo, community signal).
- reason: one short sentence explaining the call.

KEEP examples (score 2-3):
- Product launches, new models, feature shipments, API changes, pricing changes.
- Founder commentary about the product (roadmap hints, sneak peeks, philosophy applied to product).
- Major bug fix or known-issue acknowledgments.
- Partnership / acquisition involving the product.
- Shipping demos or "in production" videos with the product.

KEEP but lower (score 1):
- Reactions to other AI news where the agent is implicated.
- Hiring / company-culture posts that signal investment.
- Memes or jokes about the product (low score; keep for community color).
- Tweets with media (images / videos) but minimal text - if the media context likely shows the product, keep at 1.

DROP (score 0, keep=false):
- Pure off-topic content (sports, politics, food, personal life with no AI angle).
- Generic greetings, "thanks", "great work" without product content.
- Promotional spam not directly product-related.
- Random user replies that don't move the product story.

Return ONLY a JSON array (no prose). Schema:
[{"id": "...", "keep": true, "score": 2, "kind": "release", "reason": "..."}]`;

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
