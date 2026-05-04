import type { EntryType } from "@/lib/db";

const X_API = "https://api.x.com/2";
const TIMEOUT_MS = 15_000;

export type XTweet = {
  id: string;
  text: string;
  created_at: string;
  author_username: string;
};

export type XApiResult<T> = {
  ok: true;
  data: T;
} | {
  ok: false;
  status: number;
  error: string;
};

export function handleFromUrl(url: string): string {
  const m = url.match(/x\.com\/([^/?#]+)/i);
  if (!m) throw new Error(`Cannot extract handle from ${url}`);
  return m[1];
}

async function xFetch(path: string): Promise<Response> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN not set");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(`${X_API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveUserId(handle: string): Promise<XApiResult<string>> {
  const res = await xFetch(`/users/by/username/${encodeURIComponent(handle)}`);
  if (!res.ok) {
    return { ok: false, status: res.status, error: await res.text() };
  }
  const body = (await res.json()) as { data?: { id: string } };
  if (!body.data?.id) {
    return { ok: false, status: 200, error: "no user id in response" };
  }
  return { ok: true, data: body.data.id };
}

export async function fetchTimeline(
  userId: string,
  handle: string,
  opts: { sinceId?: string | null; sinceTime?: string } = {}
): Promise<XApiResult<XTweet[]>> {
  const params = new URLSearchParams({
    max_results: "10",
    exclude: "replies,retweets",
    "tweet.fields": "created_at",
  });
  if (opts.sinceId) params.set("since_id", opts.sinceId);
  else if (opts.sinceTime) params.set("start_time", opts.sinceTime);

  const res = await xFetch(`/users/${userId}/tweets?${params.toString()}`);
  if (!res.ok) {
    return { ok: false, status: res.status, error: await res.text() };
  }
  const body = (await res.json()) as {
    data?: Array<{ id: string; text: string; created_at: string }>;
  };
  const tweets: XTweet[] = (body.data ?? []).map((t) => ({
    id: t.id,
    text: t.text,
    created_at: t.created_at,
    author_username: handle,
  }));
  return { ok: true, data: tweets };
}

export function classifyTweet(text: string): EntryType {
  const lower = text.toLowerCase();
  if (
    /\b(launch|release|beta|introduc|now available|just shipped|rolling out|generally available|public preview|public beta|now in|today we|new model|version)\b/.test(
      lower
    )
  ) {
    return "release";
  }
  if (/\b(research|paper|partnership|hiring|conference|event|published|announce)\b/.test(lower)) {
    return "news";
  }
  return "post";
}

export function tweetTitle(text: string): string {
  const cleaned = text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = cleaned.split(/(?<=[.!?])\s/)[0];
  if (firstSentence.length <= 100) return firstSentence;
  return cleaned.slice(0, 97) + "...";
}

export function tweetSummary(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > 500 ? cleaned.slice(0, 497) + "..." : cleaned;
}

export function tweetUrl(handle: string, id: string): string {
  return `https://x.com/${handle}/status/${id}`;
}

// ===== Public/unauthenticated fallbacks =====
//
// X moved its v2 read endpoints behind the Basic tier ($100/mo) in late 2024.
// These fallbacks cover the gap. None are officially supported by X, all can
// break at any time, and reliability ranges from "great" to "blocked outright".

const TWITTER_RSS_HOSTS: Array<(h: string) => string> = [
  (h) => `https://nitter.net/${h}/rss`,
  (h) => `https://nitter.privacydev.net/${h}/rss`,
  (h) => `https://nitter.poast.org/${h}/rss`,
  (h) => `https://nitter.tiekoetter.com/${h}/rss`,
  (h) => `https://rsshub.app/twitter/user/${h}`,
];

export async function fetchTimelineNitter(
  handle: string,
  opts: { sinceId?: string | null } = {}
): Promise<XApiResult<XTweet[]>> {
  const errors: string[] = [];
  for (const buildUrl of TWITTER_RSS_HOSTS) {
    const url = buildUrl(handle);
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "AI Radar/0.1 (+https://airadarapp.com)",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        redirect: "follow",
      });
      clearTimeout(timer);
      if (!res.ok) {
        errors.push(`${hostOf(url)} HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      const tweets = parseTwitterRss(xml, handle);
      if (tweets.length === 0) {
        errors.push(`${hostOf(url)} parsed 0`);
        continue;
      }
      const filtered = opts.sinceId
        ? tweets.filter((t) => safeBigCompare(t.id, opts.sinceId!) > 0)
        : tweets;
      return { ok: true, data: filtered };
    } catch (err) {
      errors.push(`${hostOf(url)} ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return {
    ok: false,
    status: 0,
    error: `all RSS hosts failed: ${errors.slice(0, 4).join("; ")}`,
  };
}

function parseTwitterRss(xml: string, handle: string): XTweet[] {
  const tweets: XTweet[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = stripCdata(item.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = stripCdata(item.match(/<link>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    const pubDate = stripCdata(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] ?? "");
    const idMatch = link.match(/status\/(\d+)/);
    if (!idMatch) continue;
    const created = new Date(pubDate);
    if (isNaN(created.getTime())) continue;
    tweets.push({
      id: idMatch[1],
      text: stripHtml(title).trim(),
      created_at: created.toISOString(),
      author_username: handle,
    });
  }
  return tweets;
}

function stripCdata(s: string): string {
  return s.replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "").trim();
}
function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}
function hostOf(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}
function safeBigCompare(a: string, b: string): number {
  try {
    const da = BigInt(a) - BigInt(b);
    return da > 0n ? 1 : da < 0n ? -1 : 0;
  } catch {
    return a > b ? 1 : a < b ? -1 : 0;
  }
}

/** Unified entry point. Tries X API (if token + tier allow), then Nitter/RSSHub mirrors. */
export async function fetchTweetsForHandle(
  handle: string,
  opts: { sinceId?: string | null; xUserId?: string | null } = {}
): Promise<XApiResult<{ tweets: XTweet[]; strategy: string; xUserId?: string | null }>> {
  // Strategy 1: X API v2 (requires Basic tier as of 2024 for read endpoints)
  let lastXError: string | null = null;
  if (process.env.X_BEARER_TOKEN) {
    let userId = opts.xUserId ?? null;
    if (!userId) {
      const r = await resolveUserId(handle);
      if (r.ok) {
        userId = r.data;
      } else if (r.status !== 402 && r.status !== 403 && r.status !== 401) {
        // hard error, propagate (e.g. 404 for unknown handle)
        return { ok: false, status: r.status, error: `X resolveUserId ${r.status}: ${r.error.slice(0, 200)}` };
      } else {
        lastXError = `X resolveUserId ${r.status}: ${r.error.slice(0, 200)}`;
      }
      // 401/402/403 = Free tier paywall or rate-limit, fall through to Nitter
    }
    if (userId) {
      const tl = await fetchTimeline(userId, handle, { sinceId: opts.sinceId ?? undefined });
      if (tl.ok) {
        return { ok: true, data: { tweets: tl.data, strategy: "x_api", xUserId: userId } };
      }
      if (tl.status !== 402 && tl.status !== 403 && tl.status !== 401 && tl.status !== 429) {
        return { ok: false, status: tl.status, error: `X fetchTimeline ${tl.status}: ${tl.error.slice(0, 200)}` };
      }
      lastXError = `X fetchTimeline ${tl.status}: ${tl.error.slice(0, 200)}`;
    }
  }

  // Strategy 2: Nitter / RSSHub
  const nitter = await fetchTimelineNitter(handle, { sinceId: opts.sinceId });
  if (nitter.ok) {
    return { ok: true, data: { tweets: nitter.data, strategy: "nitter" } };
  }
  // Surface the upstream X API error (429/403/etc.) when it caused the
  // fallback. Without this, the operator-facing error reads "all RSS hosts
  // failed" with no signal that X itself was rate-limited or paywalled.
  const upstreamHint = lastXError ? ` (upstream: ${lastXError})` : "";
  return {
    ok: false,
    status: nitter.status,
    error: `${nitter.error}${upstreamHint}`,
  };
}
