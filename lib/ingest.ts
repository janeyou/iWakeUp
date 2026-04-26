import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { Agent } from "@/content/agents";
import { getLiveAgents } from "@/content/agents";
import { getWatermark, insertEntries } from "@/lib/db";

const SYSTEM_PROMPT = `You are a release-tracking research agent.

Given a product, find official release notes, changelog entries, blog posts, and notable announcement X/Twitter posts published after a given date.

Use the web_search tool to discover recent posts. Prefer canonical sources: the product's own changelog page, official blog, or verified X account. Skip third-party coverage.

Return ONLY valid JSON in this exact shape, with no commentary outside the JSON:
{
  "entries": [
    {
      "title": "<concise title, ~10 words max>",
      "summary": "<one sentence — what changed, launched, or was announced>",
      "source_url": "<canonical URL of the post>",
      "source_type": "changelog" | "blog" | "x",
      "tweet_id": "<numeric tweet ID, X posts only, otherwise null>",
      "published_at": "<ISO 8601 timestamp with timezone>"
    }
  ]
}

If no new entries since the given date, return {"entries": []}.
Aim for high precision: only include items you can verify on the canonical source. Drop anything ambiguous.`;

const EntrySchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  source_url: z.string().url(),
  source_type: z.enum(["changelog", "blog", "x"]),
  tweet_id: z.string().nullable(),
  published_at: z.string().datetime({ offset: true }),
});

const ResponseSchema = z.object({
  entries: z.array(EntrySchema),
});

export type IngestResult = {
  agent: string;
  inserted: number;
  found: number;
  error?: string;
};

export async function ingestAgent(
  client: Anthropic,
  agent: Agent
): Promise<IngestResult> {
  const watermark = await getWatermark(agent.slug);
  const since = watermark ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const userPrompt = [
    `Product: ${agent.name}`,
    `Official site: ${agent.officialUrl}`,
    agent.changelogUrl ? `Changelog: ${agent.changelogUrl}` : null,
    agent.xHandle ? `X account: @${agent.xHandle}` : null,
    `Last known entry timestamp: ${since}`,
    "",
    "Find new entries published strictly after that timestamp.",
  ]
    .filter(Boolean)
    .join("\n");

  let response;
  try {
    response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 4096,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 5,
        },
      ],
      messages: [{ role: "user", content: userPrompt }],
    });
  } catch (err) {
    return {
      agent: agent.slug,
      inserted: 0,
      found: 0,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      agent: agent.slug,
      inserted: 0,
      found: 0,
      error: "no JSON in response",
    };
  }

  let parsed;
  try {
    parsed = ResponseSchema.parse(JSON.parse(jsonMatch[0]));
  } catch (err) {
    return {
      agent: agent.slug,
      inserted: 0,
      found: 0,
      error: `parse failed: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  const inserted = await insertEntries(
    parsed.entries.map((e) => ({
      agent_slug: agent.slug,
      title: e.title,
      summary: e.summary,
      source_url: e.source_url,
      source_type: e.source_type,
      tweet_id: e.tweet_id,
      published_at: e.published_at,
    }))
  );

  return { agent: agent.slug, inserted, found: parsed.entries.length };
}

export async function runDailyIngestion(): Promise<IngestResult[]> {
  const client = new Anthropic();
  const agents = getLiveAgents();
  const results: IngestResult[] = [];
  for (const agent of agents) {
    results.push(await ingestAgent(client, agent));
  }
  return results;
}
