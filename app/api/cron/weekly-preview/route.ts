import { NextResponse } from "next/server";
import { AGENTS } from "@/content/agents";
import {
  getActiveSubscribers,
  getRecentEntries,
  upsertDigestPreview,
} from "@/lib/db";
import { sendDigestEmail, siteUrl } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

// Returns the coming Monday's date as YYYY-MM-DD (works whether called Sunday or Monday)
function getWeekKey(): string {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay(); // 0=Sun, 1=Mon
  if (day === 0) monday.setUTCDate(now.getUTCDate() + 1);
  return monday.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const weekKey = getWeekKey();
  const adminEmail = process.env.ADMIN_EMAIL ?? "raeyayotta@gmail.com";

  const entries = await getRecentEntries(24 * 7);
  const subscribers = await getActiveSubscribers();

  await upsertDigestPreview(weekKey, entries.length, subscribers.length);

  const agentNameBySlug = Object.fromEntries(
    AGENTS.map((a) => [a.slug, a.name]),
  );
  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });

  const approveUrl = `${siteUrl()}/api/digest/approve?week=${weekKey}&token=${process.env.CRON_SECRET}`;

  await sendDigestEmail({
    to: adminEmail,
    unsubscribeToken: "preview-mode",
    entries,
    agentNameBySlug,
    weekLabel,
    approveUrl,
  });

  return NextResponse.json({
    weekKey,
    weekLabel,
    previewSentTo: adminEmail,
    entryCount: entries.length,
    subscriberCount: subscribers.length,
  });
}
