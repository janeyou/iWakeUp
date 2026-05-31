import { render } from "@react-email/components";
import { NextResponse } from "next/server";
import WeeklyDigest, { DARK_BODY_CSS } from "@/emails/WeeklyDigest";
import { getDigestIssue } from "@/lib/db";
import { getIssueNumbers } from "@/lib/issue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> },
) {
  const { weekKey } = await params;
  if (!WEEK_KEY_RE.test(weekKey)) {
    return NextResponse.json({ error: "invalid week_key" }, { status: 404 });
  }

  const row = await getDigestIssue(weekKey);
  if (!row) {
    return NextResponse.json({ error: "issue not found" }, { status: 404 });
  }

  const { vol, issue: issueNum, formatted } = getIssueNumbers(row.content.weekKey);

  const body = await render(
    WeeklyDigest({
      issue: row.content,
      unsubscribeUrl: "https://airadarapp.com",
    }),
  );

  // Inject Open Graph + canonical tags into the rendered <head>. Also inject the
  // dark-mode CSS unconditionally: web visitors get dark by default (matches the
  // rest of airadarapp.com), regardless of their OS color-scheme preference.
  const ogTags = [
    `<meta property="og:title" content="AI Radar · ${formatted}">`,
    `<meta property="og:description" content="${escapeHtml(row.content.deck)}">`,
    `<meta property="og:type" content="article">`,
    `<meta name="description" content="${escapeHtml(row.content.deck)}">`,
    `<title>AI Radar · ${formatted} · ${row.content.weekRangeLabel}</title>`,
    `<link rel="canonical" href="https://airadarapp.com/issues/${weekKey}">`,
    `<style>${DARK_BODY_CSS}</style>`,
  ].join("");

  const withOg = body.replace(/<head>/i, `<head>${ogTags}`);

  // Inject a subscribe banner + archive link right after <body> so visitors
  // arriving from a shared link have a clear next step.
  const archiveBar = archiveBarHtml();
  const subscribeBanner = subscribeBannerHtml(weekKey);
  const subscribeFooter = subscribeFooterHtml(weekKey);
  const withTopChrome = withOg.replace(
    /(<body[^>]*>)/i,
    `$1${archiveBar}${subscribeBanner}`,
  );
  // Append a quieter secondary CTA just before </body> for readers who scroll all the way.
  const html = withTopChrome.replace(/<\/body>/i, `${subscribeFooter}</body>`);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, stale-while-revalidate=3600",
      "x-issue": `vol-${vol}-issue-${issueNum}`,
    },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function subscribeFooterHtml(weekKey: string): string {
  // Dark-native colors so the section doesn't collide with the auto dark overrides
  // applied to the email content above it. Hex values here are deliberately not
  // members of the override map: #f0f0f0, #14171f, #1a1f2a, #2a3140, etc.
  return `<section style="background-color:#14171f;color:#f0f0f0;padding:28px 24px;font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;border-top:1px solid #2a3140;">
  <div style="max-width:540px;margin:0 auto;text-align:center;">
    <div style="font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6f7686;margin-bottom:8px;">Made it to the end?</div>
    <div style="font-size:16px;font-weight:400;margin-bottom:14px;letter-spacing:-0.01em;color:#f0f0f0;">Get next Sunday's issue in your inbox.</div>
    <form id="ai-radar-subscribe-footer" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
      <input type="text" name="hp" tabindex="-1" autocomplete="off" style="display:none;">
      <input type="email" name="email" placeholder="you@example.com" required style="padding:8px 12px;border:1px solid #2a3140;border-radius:6px;font-size:13px;min-width:220px;font-family:inherit;color:#f0f0f0;background-color:#1a1f2a;">
      <button type="submit" style="background-color:#7c5fb8;color:#ffffff;border:0;border-radius:6px;padding:8px 18px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;">Subscribe</button>
    </form>
    <div id="ai-radar-subscribe-footer-msg" style="font-size:12px;margin-top:10px;min-height:16px;color:#9aa3b2;"></div>
    <div style="margin-top:14px;font-family:'Geist Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.14em;text-transform:uppercase;">
      <a href="https://www.airadarapp.com/issues" style="color:#9aa3b2;text-decoration:none;">All issues &rarr;</a>
    </div>
  </div>
</section>
<script>
(function(){
  var f = document.getElementById('ai-radar-subscribe-footer');
  var m = document.getElementById('ai-radar-subscribe-footer-msg');
  if (!f) return;
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var email = f.email.value;
    var hp = f.hp.value;
    m.textContent = 'Sending...';
    try {
      var res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email: email, honeypot: hp, source: 'issue-footer:${weekKey}'})
      });
      var data = await res.json();
      if (res.ok) {
        m.textContent = data.message || 'Check your inbox to confirm.';
        f.style.display = 'none';
      } else {
        m.textContent = data.error || 'Something went wrong, try again.';
      }
    } catch(err) {
      m.textContent = 'Network error. Try again.';
    }
  });
})();
</script>`;
}

function archiveBarHtml(): string {
  return `<div style="background:#11151c;color:#9ca3af;text-align:center;padding:8px 16px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;border-bottom:1px solid #1f2937;">
  <a href="https://www.airadarapp.com/issues" style="color:#9ca3af;text-decoration:none;">&larr; All past issues</a>
  <span style="padding:0 12px;color:#374151;">&middot;</span>
  <a href="https://www.airadarapp.com" style="color:#9ca3af;text-decoration:none;">airadarapp.com</a>
</div>`;
}

function subscribeBannerHtml(weekKey: string): string {
  return `<section id="subscribe-banner" style="background:linear-gradient(135deg,#7c5fb8 0%,#5a3f9a 100%);color:#fff;padding:20px 24px;font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;text-align:center;">
    <div style="font-size:18px;font-weight:500;margin-bottom:4px;letter-spacing:-0.01em;">Like this? Get next Sunday's issue.</div>
    <div style="font-size:13px;color:rgba(255,255,255,0.78);margin-bottom:14px;">AI Radar lands every Sunday 6am PT. One email, every drop linked.</div>
    <form id="ai-radar-subscribe" style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">
      <input type="text" name="hp" tabindex="-1" autocomplete="off" style="display:none;">
      <input type="email" name="email" placeholder="you@example.com" required style="padding:10px 14px;border:0;border-radius:6px;font-size:14px;min-width:260px;font-family:inherit;color:#1a1a1a;">
      <button type="submit" style="background:#fff;color:#5a3f9a;border:0;border-radius:6px;padding:10px 20px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Subscribe</button>
    </form>
    <div id="ai-radar-subscribe-msg" style="font-size:13px;margin-top:10px;min-height:18px;color:rgba(255,255,255,0.95);"></div>
  </div>
</section>
<script>
(function(){
  var f = document.getElementById('ai-radar-subscribe');
  var m = document.getElementById('ai-radar-subscribe-msg');
  if (!f) return;
  f.addEventListener('submit', async function(e){
    e.preventDefault();
    var email = f.email.value;
    var hp = f.hp.value;
    m.textContent = 'Sending...';
    try {
      var res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({email: email, honeypot: hp, source: 'issue:${weekKey}'})
      });
      var data = await res.json();
      if (res.ok) {
        m.textContent = data.message || 'Check your inbox to confirm.';
        f.style.display = 'none';
      } else {
        m.textContent = data.error || 'Something went wrong, try again.';
      }
    } catch(err) {
      m.textContent = 'Network error. Try again.';
    }
  });
})();
</script>`;
}
