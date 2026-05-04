import { createHash } from "node:crypto";

// Some publishers (e.g. openai.com) 403 unrecognised bot UAs. Send a
// browser-shaped UA so fetch goes through, plus an X-Identity header that
// preserves attribution for site owners who care to look.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
const X_IDENTITY = "AI Radar/0.1 (+https://airadarapp.com)";
const TIMEOUT_MS = 15_000;
const MAX_BYTES = 200_000;

export type FetchResult = {
  status: number;
  html: string;
  hash: string;
};

export async function fetchAndHash(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "X-Identity": X_IDENTITY,
      },
      signal: controller.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(timeout);
  }

  const fullBody = await res.text();
  const hash = createHash("sha256").update(fullBody).digest("hex");
  const cleaned = stripNoise(fullBody);
  const html = cleaned.length > MAX_BYTES ? cleaned.slice(0, MAX_BYTES) : cleaned;

  return { status: res.status, html, hash };
}

function stripNoise(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");
}
