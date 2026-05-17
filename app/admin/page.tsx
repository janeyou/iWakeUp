import Link from "next/link";
import {
  getSubscriberStats,
  getAllSubscribers,
  getDigestApproval,
  type SubscriberRow,
} from "@/lib/db";

export const dynamic = "force-dynamic";

function weekKey(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const sat = new Date(now);
  sat.setUTCDate(now.getUTCDate() + ((6 - day + 7) % 7));
  return sat.toISOString().split("T")[0];
}

type Filter = "active" | "pending" | "unsubscribed" | "all";

function applyFilter(subs: SubscriberRow[], filter: Filter): SubscriberRow[] {
  if (filter === "active") return subs.filter((s) => s.confirmed_at && !s.unsubscribed_at);
  if (filter === "pending") return subs.filter((s) => !s.confirmed_at && !s.unsubscribed_at);
  if (filter === "unsubscribed") return subs.filter((s) => !!s.unsubscribed_at);
  return subs;
}

const SOURCE_LABELS: Record<string, string> = {
  "waitlist:home":    "AI Radar · home page",
  "waitlist:learn":   "AI Radar · /learn page",
  "radar:home":       "AI Radar · home page",
  "jb:waitlist":      "janeyoubradley.com · waitlist",
  "jb:home":          "janeyoubradley.com · home page",
  "pmclaws:waitlist": "pmclaws.com · waitlist",
};

function formatSource(raw: string | null): string {
  if (!raw) return "unknown";
  return SOURCE_LABELS[raw] ?? raw;
}

function getsRadarDigest(s: SubscriberRow): boolean {
  return !!s.confirmed_at && !s.unsubscribed_at && !(s.source ?? "").startsWith("jb:");
}

function getsJbDigest(s: SubscriberRow): boolean {
  return !!s.confirmed_at && !s.unsubscribed_at && (s.source ?? "").startsWith("jb:");
}

function buildSourceBreakdown(subs: SubscriberRow[]): { label: string; total: number; radarDigest: number; jbDigest: number }[] {
  const map = new Map<string, { total: number; radarDigest: number; jbDigest: number }>();
  for (const s of subs) {
    const label = formatSource(s.source);
    const entry = map.get(label) ?? { total: 0, radarDigest: 0, jbDigest: 0 };
    entry.total++;
    if (getsRadarDigest(s)) entry.radarDigest++;
    if (getsJbDigest(s)) entry.jbDigest++;
    map.set(label, entry);
  }
  return Array.from(map.entries())
    .map(([label, counts]) => ({ label, ...counts }))
    .sort((a, b) => b.total - a.total);
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: rawFilter } = await searchParams;
  const filter: Filter =
    rawFilter === "active" || rawFilter === "pending" || rawFilter === "unsubscribed"
      ? rawFilter
      : "all";

  const [stats, allSubs, digest] = await Promise.all([
    getSubscriberStats(),
    getAllSubscribers(),
    getDigestApproval(weekKey()),
  ]);

  const displayed = applyFilter(allSubs, filter);
  const pending = stats.total - stats.confirmed - stats.unsubscribed;
  const sourceBreakdown = buildSourceBreakdown(allSubs);

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
      <section className="mb-6">
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
          Subscribers
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <TileLink label="Active" value={stats.confirmed} href="/admin?filter=active" active={filter === "active"} accent />
          <TileLink label="Pending confirm" value={pending} href="/admin?filter=pending" active={filter === "pending"} />
          <TileLink label="Unsubscribed" value={stats.unsubscribed} href="/admin?filter=unsubscribed" active={filter === "unsubscribed"} />
        </div>
        {filter !== "all" && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-[var(--color-text-faint)]">
              Showing {displayed.length} {filter}
            </span>
            <Link href="/admin" className="text-xs text-[var(--color-accent)] hover:underline">
              Clear filter
            </Link>
          </div>
        )}
      </section>

      {/* Source breakdown */}
      {sourceBreakdown.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
            Signups by source
          </h2>
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {sourceBreakdown.map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="text-sm text-[var(--color-text)]">{row.label}</span>
                <div className="flex items-center gap-4 font-mono text-xs text-[var(--color-text-faint)]">
                  {row.radarDigest > 0 && <span className="text-[var(--color-accent)]">{row.radarDigest} AI Radar</span>}
                  {row.jbDigest > 0 && <span className="text-[var(--color-news)]">{row.jbDigest} JB</span>}
                  <span>{row.total} total</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--color-text-faint)]">
            Digest counts = confirmed + not unsubscribed. JB digest not yet active.
          </p>
        </section>
      )}

      {/* Subscriber list */}
      {displayed.length > 0 ? (
        <section className="mb-10">
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {displayed.map((s) => (
              <li key={s.email} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={["shrink-0 h-2 w-2 rounded-full", getsRadarDigest(s) ? "bg-[var(--color-accent)]" : getsJbDigest(s) ? "bg-[var(--color-news)]" : "bg-[var(--color-border-strong)]"].join(" ")} />
                  <span className="truncate font-mono text-sm text-[var(--color-text)] ml-1">
                    {s.email}
                  </span>
                </div>
                <div className="shrink-0 text-right font-mono text-xs text-[var(--color-text-faint)]">
                  <div>{formatSource(s.source)}</div>
                  <div>{fmtDate(s.created_at)}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-4 text-xs text-[var(--color-text-faint)]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-accent)] inline-block" /> AI Radar digest</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-news)] inline-block" /> JB digest (not yet active)</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[var(--color-border-strong)] inline-block" /> not active</span>
          </p>
        </section>
      ) : (
        <p className="mb-10 text-sm text-[var(--color-text-faint)]">No subscribers in this group.</p>
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

function TileLink({
  label, value, href, active, accent,
}: {
  label: string; value: number; href: string; active: boolean; accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "block rounded-xl border p-4 transition hover:border-[var(--color-accent)]",
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      ].join(" ")}
    >
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</p>
      <p className={[
        "mt-1 font-mono text-2xl font-semibold",
        accent ? "text-[var(--color-accent)]" : "text-[var(--color-text)]",
      ].join(" ")}>
        {value}
      </p>
    </Link>
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
