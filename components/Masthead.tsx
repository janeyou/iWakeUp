import { getLastIngestedAt } from "@/lib/db";

type Props = {
  recentCount: number;
  toolsLive: number;
  lastIngestedAt: string | null;
};

export function Masthead({ recentCount, toolsLive, lastIngestedAt }: Props) {
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
        <span>Vol. 01 / Issue 001</span>
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

      <div className="flex flex-wrap items-baseline gap-3">
        <h1 className="font-[family-name:var(--font-display)] font-normal text-[clamp(28px,3.6vw,44px)] leading-[1.15] tracking-[-0.01em] text-[var(--color-text)]">
          i wake up, there is another <em className="italic text-[var(--color-accent)]">AI update</em>.
        </h1>
        <span className="rounded-full border border-[var(--color-accent)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Beta
        </span>
      </div>
      <div className="mt-4">
        <RadarCat />
      </div>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.4fr_1fr] items-end">
        <p className="text-xl leading-snug text-[var(--color-text-muted)] max-w-[28ch]">
          A daily public tracker of what the AI tools shipped while you slept. Updated every morning at 5am PT.
        </p>
        <div className="grid grid-cols-3 border-y border-[var(--color-border)]">
          <Stat label="Tools tracked" value={`${toolsLive}`} />
          <Stat label="Drops, last 24h" value={`${recentCount}`} />
          <Stat label="Last ingest" value={stamp ? stamp.split(",")[1].trim() : ","} />
        </div>
      </div>
    </header>
  );
}

/**
 * Terminal-text rendition of the tinfoil-hat-cat meme. Hat in accent teal,
 * cat body in muted text, cycle arrows in faint text. Uses Geist Mono so it
 * reads as a terminal block.
 */
function RadarCat() {
  return (
    <pre
      aria-label="i wake up, there is another AI update"
      className="font-mono text-[10px] sm:text-[11px] leading-[1.2] whitespace-pre text-[var(--color-text-muted)] select-none"
    >
      <span className="text-[var(--color-text-faint)]">{"  ↺   "}</span>
      <span className="text-[var(--color-accent)]">{"░▒▓▒░"}</span>
      <span className="text-[var(--color-text-faint)]">{"   ↻\n"}</span>
      {"      /\\_/\\\n"}
      {"     ( ◕ω◕ )\n"}
      {"      > ^ <\n"}
      <span className="text-[var(--color-text-faint)]">{"   i just wake up"}</span>
    </pre>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="border-r border-[var(--color-border)] last:border-r-0 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</div>
      <div className="mt-1 font-[family-name:var(--font-display)] font-normal text-2xl text-[var(--color-text)] leading-none tracking-[-0.02em]">
        {value}
        {suffix && <span className="text-sm text-[var(--color-text-faint)] ml-1">{suffix}</span>}
      </div>
    </div>
  );
}
