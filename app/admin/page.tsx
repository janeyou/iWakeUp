import Link from "next/link";
import {
  getSubscriberStats,
  getActiveSubscribers,
  getDigestApproval,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function weekKey(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const sat = new Date(now);
  sat.setUTCDate(now.getUTCDate() + ((6 - day + 7) % 7));
  return sat.toISOString().split("T")[0];
}

export default async function AdminPage() {
  const [stats, subscribers, digest] = await Promise.all([
    getSubscriberStats(),
    getActiveSubscribers(),
    getDigestApproval(weekKey()),
  ]);

  const recentSubs = [...subscribers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="text-sm text-[var(--color-text-faint)] hover:text-[var(--color-text)]">
        ← AI Radar
      </Link>

      <header className="mt-10 mb-10">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent)]">Admin</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--color-text)]">
          Operations
        </h1>
      </header>

      {/* Subscriber tiles */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Subscribers
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <Tile label="Active" value={stats.confirmed} accent />
          <Tile label="Pending confirm" value={stats.total - stats.confirmed - stats.unsubscribed} />
          <Tile label="Unsubscribed" value={stats.unsubscribed} />
        </div>
      </section>

      {/* Recent signups */}
      {recentSubs.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
            Recent signups
          </h2>
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {recentSubs.map((s) => (
              <li key={s.email} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={[
                      "shrink-0 h-2 w-2 rounded-full",
                      s.confirmed_at ? "bg-[var(--color-accent)]" : "bg-[var(--color-text-faint)]",
                    ].join(" ")}
                  />
                  <span className="truncate font-mono text-sm text-[var(--color-text)]">
                    {s.email}
                  </span>
                </div>
                <div className="shrink-0 text-right font-mono text-xs text-[var(--color-text-faint)]">
                  <div>{s.source ?? "—"}</div>
                  <div>{fmtDate(s.created_at)}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-text-faint)]">
            Green dot = confirmed. Showing last {recentSubs.length}.
          </p>
        </section>
      )}

      {/* Digest state */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          This week&apos;s digest
        </h2>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-3 font-mono text-sm">
          <Row label="Week" value={weekKey()} />
          <Row label="Preview sent" value={digest ? "yes" : "not yet"} />
          <Row
            label="Approved"
            value={digest?.approved_at ? fmtDate(digest.approved_at) : "no"}
            highlight={!digest?.approved_at}
          />
          <Row
            label="Digest sent"
            value={digest?.sent_at ? fmtDate(digest.sent_at) : "pending"}
          />
          <Row label="Entries" value={digest?.entry_count ?? "—"} />
          <Row label="Recipients" value={digest?.subscriber_count ?? "—"} />
        </div>
      </section>

      {/* Cost links */}
      <section className="mb-10">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Monthly costs
        </h2>
        <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {COST_LINKS.map((c) => (
            <li key={c.label} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-text)] hover:text-[var(--color-accent)]"
                >
                  {c.label} ↗
                </a>
                <p className="mt-0.5 text-xs text-[var(--color-text-faint)]">{c.note}</p>
              </div>
              <span className="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
                {c.est}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const COST_LINKS = [
  { label: "Anthropic API", url: "https://console.anthropic.com/settings/usage", note: "LLM quality scoring", est: "~$0.30/mo" },
  { label: "X API", url: "https://developer.twitter.com/en/portal/dashboard", note: "Tweet ingestion", est: "~$1–3/mo" },
  { label: "Resend", url: "https://resend.com/emails", note: "Email sending", est: "free" },
  { label: "Neon Postgres", url: "https://console.neon.tech", note: "Database", est: "free" },
  { label: "Vercel", url: "https://vercel.com/janeyous-projects/iwakeup", note: "Hosting + crons", est: "free" },
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Tile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</p>
      <p className={[
        "mt-1 font-mono text-2xl font-semibold",
        accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]",
      ].join(" ")}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: string | number | null; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--color-text-faint)]">{label}</span>
      <span className={highlight ? "text-[var(--color-news)]" : "text-[var(--color-text)]"}>
        {value ?? "—"}
      </span>
    </div>
  );
}
