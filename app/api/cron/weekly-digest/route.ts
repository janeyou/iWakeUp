import { NextResponse } from "next/server";
import {
  getActiveSubscribers,
  getDigestApproval,
  getDigestIssue,
  markDigestSent,
} from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";
import { getCurrentWeekKey } from "@/lib/issue";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get("force") === "true";
  const weekKey = url.searchParams.get("week") ?? getCurrentWeekKey();

  // Approval gate — skip unless approved (or force=true for manual override)
  if (!force) {
    const approval = await getDigestApproval(weekKey);
    if (!approval?.approved_at) {
      return NextResponse.json({
        skipped: true,
        weekKey,
        reason: "digest not approved — check your inbox for the Saturday preview and click Approve",
      });
    }
    if (approval.sent_at) {
      return NextResponse.json({ alreadySent: true, weekKey, sentAt: approval.sent_at });
    }
  }

  const issueRow = await getDigestIssue(weekKey);
  if (!issueRow) {
    return NextResponse.json(
      {
        error: "no draft exists for this week — run /api/cron/weekly-preview first",
        weekKey,
      },
      { status: 409 },
    );
  }

  const subscribers = await getActiveSubscribers();
  const issue = issueRow.content;

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    try {
      await sendDigestEmail({
        to: sub.email,
        unsubscribeToken: sub.unsubscribe_token,
        issue,
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
    weekLabel: issue.weekRangeLabel,
    subscriberCount: subscribers.length,
    sent,
    failed,
    forced: force || undefined,
  });
}
