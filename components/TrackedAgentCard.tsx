import Link from "next/link";
import type { Agent } from "@/content/agents";
import type { EntryRow } from "@/lib/db";

type Props = {
  agent: Agent;
  latest: EntryRow | null;
  /** Last 30 days, ordered any way; we re-bucket by date. */
  activity: { date: string; total: number }[];
};

export function TrackedAgentCard({ agent, latest, activity }: Props) {
  const recent7 = activity
    .filter((d) => withinDays(d.date, 7))
    .reduce((n, d) => n + d.total, 0);
  const cells = buildSparkCells(activity, 30);
  const slug = agent.slug;

  return (
    <Link
      href={`/agents/${slug}`}
      className="group relative isolate flex flex-col gap-4 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition hover:-translate-y-px"
      style={{
        backgroundImage: `radial-gradient(220px circle at calc(100% + 50px) -50px, var(--color-accent-soft), transparent 65%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-display)] font-normal text-2xl tracking-[-0.02em]">{agent.name}</h3>
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
          <span className="pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-current" aria-hidden />
          Live
        </span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{agent.blurb}</p>

      <div className="grid h-[22px] grid-cols-30 gap-[2px]" style={{ gridTemplateColumns: "repeat(30, minmax(0, 1fr))" }}>
        {cells.map((v, i) => (
          <div
            key={i}
            className="rounded-[2px]"
            style={{
              background:
                v === 0
                  ? "var(--color-surface-2)"
                  : `color-mix(in oklch, var(--color-accent) ${[35, 65, 100][Math.min(v - 1, 2)]}%, var(--color-surface))`,
            }}
          />
        ))}
      </div>

      {latest && (
        <p className="line-clamp-2 text-sm leading-snug text-[var(--color-text)]">{latest.title}</p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3 font-mono text-[10.5px] uppercase tracking-wide text-[var(--color-text-faint)]">
        <span>
          <span className="font-medium text-[var(--color-text)]">{recent7}</span> drops · 7d
        </span>
        <span className="text-[var(--color-accent)]">View profile →</span>
      </div>
    </Link>
  );
}

function withinDays(date: string, n: number): boolean {
  const ms = (Date.now() - new Date(date + "T12:00:00").getTime()) / 86_400_000;
  return ms >= 0 && ms < n;
}

function buildSparkCells(activity: { date: string; total: number }[], days: number): number[] {
  const map = new Map(activity.map((d) => [d.date, d.total]));
  const out: number[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const t = map.get(k) || 0;
    out.push(t === 0 ? 0 : t === 1 ? 1 : t === 2 ? 2 : 3);
  }
  return out;
}
