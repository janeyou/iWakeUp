import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import WeeklyDigest from "@/emails/WeeklyDigest";
import { getDigestIssue } from "@/lib/db";
import { getIssueNumbers } from "@/lib/issue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> },
) {
  const { weekKey } = await params;
  if (!WEEK_KEY_RE.test(weekKey)) {
    return NextResponse.json({ error: "invalid week_key" }, { status: 404 });
  }

  const row = await getDigestIssue(weekKey);
  if (!row) {
    return NextResponse.json({ error: "issue not found" }, { status: 404 });
  }

  const { vol, issue: issueNum, formatted } = getIssueNumbers(row.content.weekKey);

  const body = await render(
    WeeklyDigest({
      issue: row.content,
      unsubscribeUrl: "https://airadarapp.com",
    }),
  );

  // Inject Open Graph + canonical tags into the rendered <head>.
  const ogTags = [
    `<meta property="og:title" content="AI Radar · ${formatted}">`,
    `<meta property="og:description" content="${escapeHtml(row.content.deck)}">`,
    `<meta property="og:type" content="article">`,
    `<meta name="description" content="${escapeHtml(row.content.deck)}">`,
    `<title>AI Radar · ${formatted} · ${row.content.weekRangeLabel}</title>`,
    `<link rel="canonical" href="https://airadarapp.com/issues/${weekKey}">`,
  ].join("");

  const html = body.replace(/<head>/i, `<head>${ogTags}`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-issue": `vol-${vol}-issue-${issueNum}`,
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
