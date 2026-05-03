import { NextResponse } from "next/server";
import { insertToolSuggestion } from "@/lib/db";
import { corsHeaders, preflight } from "@/lib/cors";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/.+/i;

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: {
    toolName?: unknown;
    sourceUrl?: unknown;
    xHandle?: unknown;
    note?: unknown;
    contactEmail?: unknown;
    honeypot?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers });
  }

  if (typeof body.honeypot === "string" && body.honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const toolName = clean(body.toolName, 80);
  if (!toolName) {
    return NextResponse.json(
      { error: "tool name required" },
      { status: 400, headers }
    );
  }

  const sourceUrl = clean(body.sourceUrl, 500);
  if (sourceUrl && !URL_RE.test(sourceUrl)) {
    return NextResponse.json(
      { error: "source URL must start with http(s)://" },
      { status: 400, headers }
    );
  }

  const xHandle = clean(body.xHandle, 32);
  const note = clean(body.note, 1000);
  const contactEmail = clean(body.contactEmail, 254);
  if (contactEmail && !EMAIL_RE.test(contactEmail)) {
    return NextResponse.json(
      { error: "invalid email" },
      { status: 400, headers }
    );
  }

  try {
    await insertToolSuggestion({
      toolName,
      sourceUrl: sourceUrl || null,
      xHandle: xHandle || null,
      note: note || null,
      contactEmail: contactEmail || null,
    });
  } catch (err) {
    console.error("[suggest] insert failed:", err);
    return NextResponse.json(
      { error: "failed to save suggestion" },
      { status: 500, headers }
    );
  }

  return NextResponse.json(
    { ok: true, message: "Got it. Thanks for the tip." },
    { headers }
  );
}

function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}
