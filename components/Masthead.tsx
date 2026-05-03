import { getLastIngestedAt } from "@/lib/db";

type Props = {
  recentCount: number;
  toolsLive: number;
  toolsTotal: number;
  lastIngestedAt: string | null;
};

export function Masthead({ recentCount, toolsLive, toolsTotal, lastIngestedAt }: Props) {
  const today = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const stamp = lastIngestedAt
    ? new Date(lastIngestedAt).toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="mx-auto max-w-6xl px-8 sm:px-12 pt-14 pb-8 border-b border-[var(--color-border)]">
      <div className="mb-6 flex flex-wrap items-baseline gap-3 font-mono text-[11px] uppercase tracking-wider text-[var(--color-text-faint)]">
        <span>Vol. 03 / Issue 124</span>
        <span className="text-[var(--color-border-strong)]">/</span>
        <span>{today} · PT</span>
        {stamp && (
          <>
            <span className="text-[var(--color-border-strong)]">/</span>
            <span className="inline-flex items-center gap-2 text-[var(--color-accent)]">
              <span className="pulse-dot inline-block h-[6px] w-[6px] rounded-full bg-current" aria-hidden />
              Live · ingested {stamp} PT
            </span>
          </>
        )}
      </div>

      <h1 className="font-[family-name:var(--font-display)] text-[clamp(40px,6vw,76px)] leading-[0.98] tracking-[-0.025em] text-[var(--color-text)]">
        i wake up,
        <br />
        there is another <em className="text-[var(--color-accent)]">AI update</em>.
      </h1>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr] items-end">
        <p className="font-[family-name:var(--font-display)] italic text-xl leading-snug text-[var(--color-text-muted)] max-w-[28ch]">
          A daily public tracker of what the AI agents shipped while you slept. Updated every morning at 5am PT.
        </p>
        <div className="grid grid-cols-3 border-y border-[var(--color-border)]">
          <Stat label="Tools tracked" value={`${toolsLive}`} suffix={` / ${toolsTotal}`} />
          <Stat label="Drops, last 24h" value={`${recentCount}`} />
          <Stat label="Last ingest" value={stamp ? stamp.split(",")[1].trim() : "—"} />
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="border-r border-[var(--color-border)] last:border-r-0 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</div>
      <div className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--color-text)] leading-none">
        {value}
        {suffix && <span className="text-sm text-[var(--color-text-faint)] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
