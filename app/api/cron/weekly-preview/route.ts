import { NextResponse } from "next/server";
import {
  getActiveSubscribers,
  getDigestIssue,
  getRecentEntries,
  upsertDigestPreview,
} from "@/lib/db";
import { sendDigestEmail, siteUrl } from "@/lib/email";
import { draftIssueForWeek } from "@/lib/digest-draft";
import { getCurrentWeekKey } from "@/lib/issue";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const forceDraft = url.searchParams.get("draft") === "true";
  const weekKey = url.searchParams.get("week") ?? getCurrentWeekKey();
  const adminEmail = process.env.ADMIN_EMAIL ?? "raeyayotta@gmail.com";

  const entries = await getRecentEntries(24 * 7);
  const subscribers = await getActiveSubscribers();

  await upsertDigestPreview(weekKey, entries.length, subscribers.length);

  // Load existing draft, or run the LLM if missing (or ?draft=true forces a fresh draft)
  let issueRow = await getDigestIssue(weekKey);
  let drafted = false;
  if (!issueRow || forceDraft) {
    const { issue } = await draftIssueForWeek(weekKey);
    issueRow = await getDigestIssue(weekKey);
    if (!issueRow) {
      return NextResponse.json(
        { error: "draft persisted but could not be reloaded", weekKey },
        { status: 500 },
      );
    }
    drafted = true;
    void issue;
  }

  const approveUrl = `${siteUrl()}/api/digest/approve?week=${weekKey}&token=${process.env.CRON_SECRET}`;

  const { dryRun } = await sendDigestEmail({
    to: adminEmail,
    unsubscribeToken: "preview-mode",
    issue: issueRow.content,
    approveUrl,
  });

  return NextResponse.json({
    weekKey,
    weekLabel: issueRow.content.weekRangeLabel,
    previewSentTo: dryRun ? null : adminEmail,
    dryRun: dryRun || undefined,
    dryRunReason: dryRun ? "RESEND_API_KEY missing or empty" : undefined,
    entryCount: entries.length,
    subscriberCount: subscribers.length,
    drafted,
    modelUsed: issueRow.model_used,
    regeneratedCount: issueRow.regenerated_count,
  });
}
