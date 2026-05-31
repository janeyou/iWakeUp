import { render } from "@react-email/components";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WeeklyDigest, { DARK_BODY_CSS, MOBILE_CSS } from "@/emails/WeeklyDigest";
import { SiteFooter } from "@/components/SiteFooter";
import { SubscribeForm } from "@/components/SubscribeForm";
import { getDigestIssue } from "@/lib/db";
import { getIssueNumbers } from "@/lib/issue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEEK_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ weekKey: string }>;
}): Promise<Metadata> {
  const { weekKey } = await params;
  if (!WEEK_KEY_RE.test(weekKey)) return {};
  const row = await getDigestIssue(weekKey);
  if (!row) return {};
  const { formatted } = getIssueNumbers(row.content.weekKey);
  return {
    title: `AI Radar · ${formatted} · ${row.content.weekRangeLabel}`,
    description: row.content.deck,
    openGraph: {
      title: `AI Radar · ${formatted}`,
      description: row.content.deck,
      type: "article",
    },
    alternates: {
      canonical: `https://airadarapp.com/issues/${weekKey}`,
    },
  };
}

export default async function IssuePage({
  params,
}: {
  params: Promise<{ weekKey: string }>;
}) {
  const { weekKey } = await params;
  if (!WEEK_KEY_RE.test(weekKey)) notFound();
  const row = await getDigestIssue(weekKey);
  if (!row) notFound();

  const { vol, issue: issueNum } = getIssueNumbers(row.content.weekKey);

  const fullEmailHtml = await render(
    WeeklyDigest({
      issue: row.content,
      unsubscribeUrl: "https://airadarapp.com",
    }),
  );

  // Strip the outer <html><head>...</head><body>...</body></html> wrappers; we just
  // want the body's inner content so the email renders inside the Next.js page
  // shell (TopNav, favicon, theme, footer) instead of as a standalone document.
  const bodyMatch = fullEmailHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const innerEmailContent = bodyMatch ? bodyMatch[1] : fullEmailHtml;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `${MOBILE_CSS}\n${DARK_BODY_CSS}`,
        }}
      />

      <main className="bg-[var(--color-bg)]">
        <section className="border-b border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-3 text-xs font-mono uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
            <span>
              Vol {vol} · Issue {issueNum} · {row.content.weekRangeLabel}
            </span>
            <a
              href="/issues"
              className="hover:text-[var(--color-text)]"
            >
              All past issues →
            </a>
          </div>
        </section>

        <section className="bg-[color-mix(in_oklch,_var(--color-accent)_70%,_var(--color-bg))]">
          <div className="mx-auto max-w-2xl px-6 py-8 text-center">
            <p className="text-base font-medium tracking-[-0.01em] text-white sm:text-lg">
              Like this? Get next Sunday&apos;s issue.
            </p>
            <p className="mt-1 text-xs text-white/80 sm:text-sm">
              AI Radar lands every Sunday 6am PT. One email, every drop linked.
            </p>
            <div className="mt-4 flex justify-center">
              <SubscribeForm source={`issue:${weekKey}`} />
            </div>
          </div>
        </section>

        <article
          className="aw-issue-content mx-auto max-w-[680px]"
          dangerouslySetInnerHTML={{ __html: innerEmailContent }}
        />

        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-2)]">
          <div className="mx-auto max-w-2xl px-6 py-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Made it to the end?
            </p>
            <p className="mt-2 text-base font-normal tracking-[-0.01em]">
              Get next Sunday&apos;s issue in your inbox.
            </p>
            <div className="mt-4 flex justify-center">
              <SubscribeForm source={`issue-footer:${weekKey}`} />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              <a
                href="/issues"
                className="hover:text-[var(--color-text)]"
              >
                All issues →
              </a>
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
