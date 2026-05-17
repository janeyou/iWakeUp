import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { addSubscriber, confirmSubscriber } from "@/lib/db";
import { sendConfirmEmail } from "@/lib/email";
import { corsHeaders, preflight } from "@/lib/cors";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OPTIONS(request: Request) {
  return preflight(request);
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: { email?: unknown; honeypot?: unknown; source?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers });
  }

  if (typeof body.honeypot === "string" && body.honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { headers });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid email" }, { status: 400, headers });
  }

  const source = typeof body.source === "string" ? body.source.slice(0, 64) : "form";
  const isWaitlistMode = !process.env.RESEND_API_KEY;

  const result = await addSubscriber({
    email,
    confirmToken: randomUUID(),
    unsubscribeToken: randomUUID(),
    source: isWaitlistMode ? `waitlist:${source}` : source,
  });

  const isJb = source.startsWith("jb:");

  if (result.existed && !isJb) {
    return NextResponse.json(
      { ok: true, message: "Already on the list. Welcome back." },
      { headers }
    );
  }

  // JB signup for an email already confirmed — no need to re-verify
  if (isJb && result.alreadyJb) {
    return NextResponse.json(
      { ok: true, message: "Already on the list. Welcome back." },
      { headers }
    );
  }
  if (isJb && result.row.confirmed_at) {
    return NextResponse.json(
      { ok: true, message: "Added to the list — no confirmation needed, your email is already verified." },
      { headers }
    );
  }

  if (isWaitlistMode) {
    await confirmSubscriber(result.row.confirm_token);
    return NextResponse.json(
      {
        ok: true,
        message: "You're on the waitlist. First digest lands when the newsletter goes live.",
      },
      { headers }
    );
  }

  try {
    await sendConfirmEmail(email, result.row.confirm_token);
  } catch (err) {
    console.error("[subscribe] send confirm failed:", err);
    return NextResponse.json(
      { error: "failed to send confirmation email" },
      { status: 500, headers }
    );
  }

  return NextResponse.json(
    { ok: true, message: "Check your email for a confirmation link." },
    { headers }
  );
}
