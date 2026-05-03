import { NextResponse } from "next/server";
import { unsubscribeSubscriber } from "@/lib/db";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) {
    return NextResponse.redirect(`${siteUrl()}/?unsubscribe=error`, { status: 302 });
  }
  const row = await unsubscribeSubscriber(token);
  if (!row) {
    return NextResponse.redirect(`${siteUrl()}/?unsubscribe=error`, { status: 302 });
  }
  return NextResponse.redirect(`${siteUrl()}/?unsubscribe=done`, { status: 302 });
}

export async function POST(request: Request) {
  return GET(request);
}
