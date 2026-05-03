import { NextResponse } from "next/server";
import { confirmSubscriber } from "@/lib/db";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.redirect(`${siteUrl()}/?subscribe=error`, { status: 302 });
  }
  const row = await confirmSubscriber(token);
  if (!row) {
    return NextResponse.redirect(`${siteUrl()}/?subscribe=error`, { status: 302 });
  }
  return NextResponse.redirect(`${siteUrl()}/?subscribe=confirmed`, { status: 302 });
}
