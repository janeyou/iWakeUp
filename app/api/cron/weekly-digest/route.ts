import { NextResponse } from "next/server";
import { AGENTS } from "@/content/agents";
import {
  getActiveSubscribers,
  getDigestApproval,
  getRecentEntries,
  markDigestSent,
} from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 300;

// Returns the coming Monday's date as YYYY-MM-DD (consistent with weekly-preview)
function getWeekKey(): string {
  const now = new Date();
  const monday = new Date(now);
  const day = now.getUTCDay();
  if (day === 0) monday.setUTCDate(now.getUTCDate() + 1);
  return monday.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";
  const weekKey = getWeekKey();

  // Approval gate — skip unless approved (or force=true for manual override)
  if (!force) {
    const approval = await getDigestApproval(weekKey);
    if (!approval?.approved_at) {
      return NextResponse.json({
        skipped: true,
        weekKey,
        reason: "digest not approved — check your inbox for the Sunday preview and click Approve",
      });
    }
    if (approval.sent_at) {
      return NextResponse.json({ alreadySent: true, weekKey, sentAt: approval.sent_at });
    }
  }

  const entries = await getRecentEntries(24 * 7);
  const subscribers = await getActiveSubscribers();

  const agentNameBySlug = Object.fromEntries(AGENTS.map((a) => [a.slug, a.name]));
  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/Los_Angeles",
  });

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    try {
      await sendDigestEmail({
        to: sub.email,
        unsubscribeToken: sub.unsubscribe_token,
        entries,
        agentNameBySlug,
        weekLabel,
      });
      sent++;
    } catch (err) {
      console.error(`[digest] failed for ${sub.email}:`, err);
      failed++;
    }
  }

  await markDigestSent(weekKey);

  return NextResponse.json({
    weekKey,
    weekLabel,
    entryCount: entries.length,
    subscriberCount: subscribers.length,
    sent,
    failed,
    forced: force || undefined,
  });
}
