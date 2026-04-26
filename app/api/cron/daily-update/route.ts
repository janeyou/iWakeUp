import { NextResponse } from "next/server";
import { runDailyIngestion } from "@/lib/ingest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = new Date().toISOString();
  const results = await runDailyIngestion();
  const finishedAt = new Date().toISOString();

  return NextResponse.json({
    startedAt,
    finishedAt,
    results,
  });
}
