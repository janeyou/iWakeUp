import { sql } from "@vercel/postgres";
import type { Agent, AgentSource } from "@/content/agents";
import { getLiveAgents } from "@/content/agents";
import {
  getSourceState,
  getWatermark,
  insertEntries,
  setSourceXUserId,
  upsertSourceState,
} from "@/lib/db";
import { fetchAndHash } from "@/lib/fetch";
import { NoParserError, parseSource, type ParsedEntry } from "@/lib/scrape";
import {
  classifyTweet,
  fetchTweetsForHandle,
  handleFromUrl,
  tweetSummary,
  tweetTitle,
  tweetUrl,
  type XTweet,
} from "@/lib/x";
import { filterTweetsForQuality, type TweetQuality } from "@/lib/xQuality";

export type SourceResult = {
  url: string;
  label: string;
  type: AgentSource["type"];
  status: "inserted" | "skipped_cache" | "no_new" | "error";
  inserted?: number;
  found?: number;
  error?: string;
};

export type IngestResult = {
  agent: string;
  totalInserted: number;
  sources: SourceResult[];
};

export type RunOptions = {
  force?: boolean;
};

const X_TTL_MS = 60 * 60 * 1000;

export async function ingestAgent(
  agent: Agent,
  opts: RunOptions = {}
): Promise<IngestResult> {
  const watermark =
    (await getWatermark(agent.slug)) ??
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const results: SourceResult[] = [];
  let totalInserted = 0;

  for (const source of agent.sources) {
    const r = await ingestSource(agent, source, watermark, opts);
    results.push(r);
    if (r.inserted) totalInserted += r.inserted;
  }

  const dedup = await dedupeChangelogVsBlog(agent.slug);
  if (dedup.deleted > 0) {
    console.log(`[ingest] ${agent.slug}: deduped ${dedup.deleted} changelog/blog overlap`);
  }

  return { agent: agent.slug, totalInserted, sources: results };
}

const TITLE_STOPWORDS = new Set([
  "the", "a", "an", "of", "by", "and", "or", "with", "in", "for", "to", "is", "on",
  "our", "new", "see", "more", "introducing", "now", "are", "this", "that", "we",
  "us", "you", "your", "it", "be", "as", "at", "from", "get", "started", "all",
]);

function titleTokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}.\s]/gu, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && !TITLE_STOPWORDS.has(t))
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * When an agent posts the same release on both a blog and a release-notes
 * changelog the same day, drop the changelog copy. Match is fuzzy: same PT
 * date, both `release`, and Jaccard token overlap >= threshold on titles.
 */
export async function dedupeChangelogVsBlog(
  agentSlug: string,
  threshold = 0.4
): Promise<{ deleted: number }> {
  const { rows } = await sql<{
    cl_id: number;
    cl_title: string;
    bl_title: string;
  }>`
    SELECT cl.id AS cl_id, cl.title AS cl_title, bl.title AS bl_title
    FROM entries cl
    JOIN entries bl
      ON cl.agent_slug = bl.agent_slug
     AND (cl.published_at AT TIME ZONE 'America/Los_Angeles')::date
       = (bl.published_at AT TIME ZONE 'America/Los_Angeles')::date
    WHERE cl.agent_slug = ${agentSlug}
      AND cl.entry_type = 'release' AND bl.entry_type = 'release'
      AND cl.source_type = 'changelog' AND bl.source_type = 'blog'
  `;

  const ids: number[] = [];
  for (const r of rows) {
    if (jaccard(titleTokens(r.cl_title), titleTokens(r.bl_title)) >= threshold) {
      ids.push(r.cl_id);
    }
  }
  if (ids.length === 0) return { deleted: 0 };

  let deleted = 0;
  for (const id of ids) {
    const { rowCount } = await sql`DELETE FROM entries WHERE id = ${id}`;
    deleted += rowCount ?? 0;
  }
  return { deleted };
}

async function ingestSource(
  agent: Agent,
  source: AgentSource,
  watermark: string,
  opts: RunOptions
): Promise<SourceResult> {
  const base: Pick<SourceResult, "url" | "label" | "type"> = {
    url: source.url,
    label: source.label,
    type: source.type,
  };

  try {
    const cached = await getSourceState(source.url);

    if (source.type === "x") {
      if (
        !opts.force &&
        cached &&
        Date.now() - new Date(cached.last_fetched_at).getTime() < X_TTL_MS
      ) {
        console.log(`[ingest] skip ${agent.slug}/${source.url}: x debounce <1h`);
        return { ...base, status: "skipped_cache" };
      }
      return await ingestXSource(agent, source, cached, watermark);
    }

    // changelog | blog: HTML fetch + cheerio parse
    const fetched = await fetchAndHash(source.url);

    if (
      !opts.force &&
      cached &&
      cached.content_hash === fetched.hash &&
      cached.last_status === fetched.status
    ) {
      console.log(`[ingest] skip ${agent.slug}/${source.url}: hash unchanged`);
      return { ...base, status: "skipped_cache" };
    }

    if (fetched.status >= 400) {
      await upsertSourceState({
        url: source.url,
        agent_slug: agent.slug,
        source_type: source.type,
        content_hash: fetched.hash,
        last_status: fetched.status,
        last_entry_count: 0,
        last_error: `HTTP ${fetched.status}`,
      });
      return { ...base, status: "error", error: `HTTP ${fetched.status}` };
    }

    let parsed: ParsedEntry[];
    try {
      parsed = parseSource(fetched.html, source);
    } catch (err) {
      const msg = err instanceof NoParserError ? err.message : `parse failed: ${err}`;
      await upsertSourceState({
        url: source.url,
        agent_slug: agent.slug,
        source_type: source.type,
        content_hash: fetched.hash,
        last_status: fetched.status,
        last_entry_count: 0,
        last_error: msg.slice(0, 500),
      });
      return { ...base, status: "error", error: msg };
    }

    // Filter by watermark, unless force=true (backfill mode)
    const watermarkMs = new Date(watermark).getTime();
    const filtered = opts.force
      ? parsed
      : parsed.filter((e) => new Date(e.published_at).getTime() > watermarkMs);

    const inserted = await persistEntries(agent.slug, filtered);

    await upsertSourceState({
      url: source.url,
      agent_slug: agent.slug,
      source_type: source.type,
      content_hash: fetched.hash,
      last_status: fetched.status,
      last_entry_count: filtered.length,
      last_error: null,
    });

    return {
      ...base,
      status: filtered.length === 0 ? "no_new" : "inserted",
      inserted,
      found: filtered.length,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await upsertSourceState({
      url: source.url,
      agent_slug: agent.slug,
      source_type: source.type,
      content_hash: null,
      last_status: null,
      last_entry_count: 0,
      last_error: msg.slice(0, 500),
    }).catch(() => {});
    return { ...base, status: "error", error: msg };
  }
}

async function ingestXSource(
  agent: Agent,
  source: AgentSource,
  cached: Awaited<ReturnType<typeof getSourceState>>,
  _watermark: string
): Promise<SourceResult> {
  const base: Pick<SourceResult, "url" | "label" | "type"> = {
    url: source.url,
    label: source.label,
    type: source.type,
  };

  const handle = handleFromUrl(source.url);
  const sinceId = cached?.content_hash ?? null;

  const r = await fetchTweetsForHandle(handle, { sinceId, xUserId: cached?.x_user_id });
  if (!r.ok) {
    await upsertSourceState({
      url: source.url,
      agent_slug: agent.slug,
      source_type: "x",
      content_hash: cached?.content_hash ?? null,
      last_status: r.status,
      last_entry_count: 0,
      last_error: r.error.slice(0, 500),
    });
    return { ...base, status: "error", error: r.error };
  }

  const { tweets, strategy, xUserId } = r.data;
  if (xUserId && cached?.x_user_id !== xUserId) {
    await setSourceXUserId(source.url, xUserId);
  }

  // LLM quality pass. Drops noise; tags everything kept with score+kind+reason.
  // Always advance the since_id watermark over the FULL tweet set, even the
  // dropped ones, so we don't re-evaluate them next ingest.
  const scored = await filterTweetsForQuality(tweets, {
    agentName: agent.name,
    handle,
  });
  const kept = scored.filter((s) => s.quality.keep && s.quality.score > 0);
  const dropped = scored.length - kept.length;

  const entries = kept.map(({ tweet, quality }) =>
    tweetToEntry(tweet, handle, quality)
  );
  const inserted = await persistEntries(agent.slug, entries);

  const newestId =
    tweets.length > 0
      ? tweets.reduce((acc, t) => (safeBigCompare(t.id, acc) > 0 ? t.id : acc), tweets[0].id)
      : (cached?.content_hash ?? null);

  const note =
    dropped > 0
      ? `via ${strategy}; LLM kept ${kept.length}/${tweets.length}`
      : `via ${strategy}`;

  await upsertSourceState({
    url: source.url,
    agent_slug: agent.slug,
    source_type: "x",
    content_hash: newestId,
    last_status: 200,
    last_entry_count: kept.length,
    last_error: note,
  });

  return {
    ...base,
    status: tweets.length === 0 ? "no_new" : "inserted",
    inserted,
    found: kept.length,
  };
}

function safeBigCompare(a: string, b: string): number {
  try {
    const d = BigInt(a) - BigInt(b);
    return d > 0n ? 1 : d < 0n ? -1 : 0;
  } catch {
    return a > b ? 1 : a < b ? -1 : 0;
  }
}

function tweetToEntry(t: XTweet, handle: string, quality?: TweetQuality) {
  return {
    title: tweetTitle(t.text),
    summary: tweetSummary(t.text),
    source_url: tweetUrl(handle, t.id),
    source_type: "x" as const,
    entry_type: quality?.kind ?? classifyTweet(t.text),
    tweet_id: t.id,
    video_url: null,
    published_at: t.created_at,
    quality_score: quality?.score ?? null,
    quality_reason: quality?.reason ?? null,
  };
}

async function persistEntries(
  agentSlug: string,
  entries: Array<{
    title: string;
    summary: string;
    source_url: string;
    source_type: "changelog" | "blog" | "x";
    entry_type: ReturnType<typeof classifyTweet>;
    tweet_id: string | null;
    video_url?: string | null;
    published_at: string;
    quality_score?: number | null;
    quality_reason?: string | null;
  }>
): Promise<number> {
  if (entries.length === 0) return 0;
  return insertEntries(
    entries.map((e) => ({
      agent_slug: agentSlug,
      title: e.title.replace(/[—–]/g, ",").trim(),
      summary: e.summary.replace(/[—–]/g, ",").trim(),
      source_url: e.source_url,
      source_type: e.source_type,
      entry_type: e.entry_type,
      tweet_id: e.tweet_id,
      video_url: e.video_url ?? null,
      published_at: e.published_at,
      quality_score: e.quality_score ?? null,
      quality_reason: e.quality_reason ?? null,
    }))
  );
}

export async function runDailyIngestion(opts: RunOptions = {}): Promise<IngestResult[]> {
  const agents = getLiveAgents();
  const results: IngestResult[] = [];
  for (const agent of agents) {
    results.push(await ingestAgent(agent, opts));
  }
  return results;
}
