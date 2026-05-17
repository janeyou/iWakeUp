import { NextResponse } from "next/server";
import { approveDigest } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const week = url.searchParams.get("week");
  const token = url.searchParams.get("token");

  if (!week || token !== process.env.CRON_SECRET) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await approveDigest(week);

  if (!result) {
    return new NextResponse(html("Not Found",
      `<div class="icon">⚠️</div>
       <h1 class="warn">No digest found</h1>
       <p>No preview was generated for week <strong>${week}</strong>.</p>
       <p>The Sunday preview cron needs to run first.</p>`
    ), { status: 404, headers: { "Content-Type": "text/html" } });
  }

  if (result.sent_at) {
    return new NextResponse(html("Already Sent",
      `<div class="icon">📬</div>
       <h1>Already sent</h1>
       <p>The digest for week of <strong>${week}</strong> was already sent.</p>`
    ), { headers: { "Content-Type": "text/html" } });
  }

  const subs = result.subscriber_count ?? "?";
  const entries = result.entry_count ?? "?";

  return new NextResponse(html("Digest Approved ✓",
    `<div class="icon">✅</div>
     <h1>Digest approved</h1>
     <p>The AI Radar digest for week of <strong>${week}</strong><br>
     will send to <strong>${subs} subscriber${subs === 1 ? "" : "s"}</strong> Sunday at 6am PT.</p>
     <p class="small">${entries} entries · you can close this tab</p>`
  ), { headers: { "Content-Type": "text/html" } });
}

function html(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0e1014;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;
       display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .card{max-width:440px;width:100%;text-align:center;padding:48px 32px;
        background:#131313;border:1px solid #1f2937;border-radius:12px}
  .icon{font-size:48px;margin-bottom:20px}
  h1{font-size:22px;font-weight:600;letter-spacing:-.02em;margin-bottom:12px;color:#4ec989}
  h1.warn{color:#f0a644}
  p{color:#9ca3af;font-size:15px;line-height:1.7;margin-bottom:8px}
  p strong{color:#e5e7eb}
  .small{font-size:12px;color:#4b5563;margin-top:16px;font-family:ui-monospace,monospace}
</style>
</head>
<body><div class="card">${body}</div></body>
</html>`;
}
