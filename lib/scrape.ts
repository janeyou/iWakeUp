import * as cheerio from "cheerio";
import type { AgentSource } from "@/content/agents";
import type { EntryType } from "@/lib/db";

export type ParsedEntry = {
  title: string;
  summary: string;
  source_url: string;
  source_type: "changelog" | "blog";
  entry_type: EntryType;
  tweet_id: null;
  video_url: string | null;
  published_at: string;
};

export class NoParserError extends Error {
  constructor(url: string) {
    super(`No parser registered for source ${url}`);
  }
}

export function parseSource(html: string, source: AgentSource): ParsedEntry[] {
  switch (source.parser) {
    case "claude-support":
      return parseClaudeSupport(html, source);
    case "anthropic-news":
      return parseAnthropicNews(html, source);
    default:
      throw new NoParserError(source.url);
  }
}

/**
 * support.claude.com release notes (Intercom-hosted).
 * Structure: <h2>Month Year</h2> per month, <h3 id="h_xxx">Date</h3> per entry,
 * then <p><b>Entry Title</b></p> + <p>body...</p> until the next h3 or h2.
 */
function parseClaudeSupport(html: string, source: AgentSource): ParsedEntry[] {
  const $ = cheerio.load(html);
  const entries: ParsedEntry[] = [];

  $('h3[id^="h_"]').each((_, el) => {
    const $h3 = $(el);
    const dateText = $h3.text().trim();
    const date = parseLooseDate(dateText);
    if (!date) return;

    const id = $h3.attr("id");
    const sourceUrl = id ? `${source.url}#${id}` : source.url;

    const $wrapper = $h3.parent();
    let title = "";
    let videoUrl: string | null = null;
    const summaryParts: string[] = [];

    let cursor = $wrapper.next();
    while (cursor.length && cursor.find("h2, h3").length === 0) {
      const text = cursor.text().replace(/\s+/g, " ").trim();
      if (text) {
        if (!title) {
          const bold = cursor.find("b, strong").first().text().trim();
          title = bold || text.split(/[.!?]\s/)[0].slice(0, 200);
        } else {
          summaryParts.push(text);
        }
      }
      if (!videoUrl) {
        const detected = detectVideo(cursor);
        if (detected) videoUrl = detected;
      }
      cursor = cursor.next();
    }

    if (!title) return;
    const summary = summaryParts.join(" ").slice(0, 500).trim() || title;

    entries.push({
      title: cleanText(title),
      summary: cleanText(summary),
      source_url: sourceUrl,
      source_type: "changelog",
      entry_type: classifyText(title + " " + summary),
      tweet_id: null,
      video_url: videoUrl,
      published_at: date.toISOString(),
    });
  });

  return entries;
}

/**
 * anthropic.com/news index page. Each post is an <a> linking to /news/<slug>
 * with an inner heading and a <time> element.
 */
function parseAnthropicNews(html: string, source: AgentSource): ParsedEntry[] {
  const $ = cheerio.load(html);
  const entries: ParsedEntry[] = [];
  const seen = new Set<string>();

  // Each card has a <time> with a date. Walk up to find the link + heading.
  $("time").each((_, el) => {
    const $time = $(el);
    const dateText = $time.text().trim();
    const date = parseLooseDate(dateText);
    if (!date) return;

    // Find the nearest enclosing <a> with an internal href (the card link).
    let $a = $time.closest("a");
    if (!$a.length || !$a.attr("href")) {
      // Some layouts: the link is a sibling of the <time>'s parent.
      $a = $time.parent().find("a[href^='/']").first();
    }
    const href = $a.attr("href");
    if (!href || !href.startsWith("/")) return;

    // Skip nav/category links: must be a content URL.
    if (!/^\/(news|research|customers|company|index)\b/.test(href)) return;

    // Title: nearest heading, either inside the link or a sibling.
    const $card = $a.length ? $a : $time.parent();
    let title = $card.find("h2, h3, h4").first().text().trim();
    if (!title) {
      // Try sibling: <time> followed by heading
      const $sibHeading = $time.next().is("h2, h3, h4")
        ? $time.next()
        : $time.parent().find("h2, h3, h4").first();
      title = $sibHeading.text().trim();
    }
    title = title.replace(/\s+/g, " ");
    if (!title) return;

    const sourceUrl = `https://www.anthropic.com${href.split("#")[0]}`;
    if (seen.has(sourceUrl)) return;
    seen.add(sourceUrl);

    let summary = "";
    const $body = $card.find("p").first();
    if ($body.length) summary = $body.text().replace(/\s+/g, " ").trim();
    if (!summary) summary = title;

    const videoUrl = detectVideo($card);

    entries.push({
      title: cleanText(title),
      summary: cleanText(summary).slice(0, 500),
      source_url: sourceUrl,
      source_type: "blog",
      entry_type: classifyText(title + " " + summary),
      tweet_id: null,
      video_url: videoUrl,
      published_at: date.toISOString(),
    });
  });

  return entries;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectVideo($block: cheerio.Cheerio<any>): string | null {
  const iframe = $block
    .find('iframe[src*="youtube.com"], iframe[src*="youtu.be"], iframe[src*="vimeo.com"]')
    .first()
    .attr("src");
  if (iframe) {
    const normalized = toEmbedUrl(iframe);
    if (normalized) return normalized;
  }
  const link = $block
    .find('a[href*="youtube.com/watch"], a[href*="youtu.be/"], a[href*="vimeo.com/"]')
    .first()
    .attr("href");
  if (link) {
    const normalized = toEmbedUrl(link);
    if (normalized) return normalized;
  }
  return null;
}

function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw, "https://example.com");
    if (u.hostname.includes("youtube.com") && u.pathname === "/watch") {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname === "youtu.be") {
      const v = u.pathname.replace(/^\//, "").split("/")[0];
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      const v = u.pathname.split("/").pop();
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.hostname.includes("vimeo.com")) {
      const m = u.pathname.match(/\/(\d+)/);
      return m ? `https://player.vimeo.com/video/${m[1]}` : null;
    }
    return null;
  } catch {
    return null;
  }
}

/** Accepts "April 17, 2026", "Apr 17, 2026", "Apr 17 2026", "2026-04-17".
 *  Returns a Date at 07:00 UTC = 00:00 PDT for that day. */
function parseLooseDate(s: string): Date | null {
  const trimmed = s.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return null;
  d.setUTCHours(7, 0, 0, 0);
  return d;
}

function classifyText(text: string): EntryType {
  const lower = text.toLowerCase();
  if (
    /\b(launch|launching|releas|beta|introduc|now available|just shipped|rolling out|generally available|public preview|public beta|new model|version|ship|update|deliver)/i.test(
      lower
    )
  ) {
    return "release";
  }
  if (/\b(research|paper|partnership|hiring|conference|event|published|announce)/i.test(lower)) {
    return "news";
  }
  return "release";
}

function cleanText(s: string): string {
  return s.replace(/[—–]/g, ",").replace(/\s+/g, " ").trim();
}
