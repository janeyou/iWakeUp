import { NextResponse } from "next/server";
import { AGENTS } from "@/content/agents";
import { getActiveSubscribers, getRecentEntries } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const entries = await getRecentEntries(24 * 7);
  const subscribers = await getActiveSubscribers();

  const agentNameBySlug = Object.fromEntries(AGENTS.map((a) => [a.slug, a.name]));
  const weekLabel = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

  return NextResponse.json({
    weekLabel,
    entryCount: entries.length,
    subscriberCount: subscribers.length,
    sent,
    failed,
  });
}
