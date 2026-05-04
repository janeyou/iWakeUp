import type { ActivityDay, AgentDayActivity } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";

const WEEKS = 26;
const DAYS = WEEKS * 7;
const CELL = 13;

type SingleProps = { mode?: "single"; agentSlug: string; data: ActivityDay[]; selectedDate?: string };
type GlobalProps = { mode: "global"; data: AgentDayActivity[]; agentSlugs: string[]; selectedDate?: string };

export function ActivityHeatmap(props: SingleProps | GlobalProps) {
  const cells = buildCells();
  const monthLabels = buildMonthLabels(cells);
  const single = props.mode !== "global";
  const aggregated = single
    ? aggregateSingle(props.data, (props as SingleProps).agentSlug)
    : aggregateGlobal(props.data);
  const dropsWeek = sumOverDays(aggregated, 7);
  const secondCallout = single
    ? { label: "Drops this month", value: `${sumOverDays(aggregated, 30)}`, unit: "" }
    : mostActiveToolThisWeek(props.data as AgentDayActivity[]);

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <h3 className="font-[family-name:var(--font-display)] font-normal text-xl tracking-[-0.02em]">Activity, last 6 months</h3>
          <div className="mt-0.5 font-mono text-[10.5px] uppercase tracking-wider text-[var(--color-text-faint)]">
            {single ? "by entry type" : "by tool · daily"}
          </div>
        </div>
        <div className="flex gap-6">
          <Callout label="Drops this week" value={`${dropsWeek}`} unit="" />
          <Callout label={secondCallout.label} value={secondCallout.value} unit={secondCallout.unit} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex">
          <div className="grid grid-rows-7 gap-[3px] pr-2 pt-[18px] font-mono text-[9.5px] text-[var(--color-text-faint)]" style={{ gridAutoRows: `${CELL}px` }}>
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => <div key={i} style={{ lineHeight: `${CELL}px` }}>{d}</div>)}
          </div>
          <div>
            <div className="mb-1 grid h-[14px] gap-[3px] font-mono text-[9.5px] text-[var(--color-text-faint)]" style={{ gridTemplateColumns: `repeat(${WEEKS}, ${CELL}px)`, gridAutoFlow: "column" }}>
              {monthLabels.map((m, i) => <div key={i}>{m}</div>)}
            </div>
            <div className="grid grid-rows-7 gap-[3px]" style={{ gridAutoFlow: "column", gridAutoColumns: `${CELL}px` }}>
              {cells.map((cell, idx) => {
                if (!cell) return <div key={`p${idx}`} style={{ width: CELL, height: CELL }} />;
                const day = aggregated.get(cell.date);
                const href = single
                  ? `/agents/${(props as SingleProps).agentSlug}?date=${cell.date}`
                  : `/drops?date=${cell.date}`;
                const isSelected = props.selectedDate === cell.date;
                return (
                  <a
                    key={cell.date}
                    href={href}
                    title={tooltipText(day, cell.date, single)}
                    className={[
                      "block rounded-[2px]",
                      isSelected
                        ? "outline outline-[2px] outline-offset-[2px] outline-[var(--color-accent)]"
                        : "hover:outline hover:outline-[1.5px] hover:outline-[var(--color-text)]",
                    ].join(" ")}
                    style={{ width: CELL, height: CELL, background: cellColor(day, single, single ? (props as SingleProps).agentSlug : undefined) }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[10px] text-[var(--color-text-faint)]">
        {single ? <IntensityLegend slug={(props as SingleProps).agentSlug} /> : <AgentLegend slugs={(props as GlobalProps).agentSlugs} />}
      </div>
    </section>
  );
}

function Callout({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-text-faint)]">{label}</div>
      <div className="font-[family-name:var(--font-display)] font-normal text-2xl tracking-[-0.02em] text-[var(--color-text)]">
        <span className="text-[var(--color-accent)]">{value}</span> {unit && <span className="text-base font-normal text-[var(--color-text-muted)]">{unit}</span>}
      </div>
    </div>
  );
}

type DayInfo = { total: number; hue: string; byAgent?: Record<string, number> };

function aggregateSingle(rows: ActivityDay[], slug: string): Map<string, DayInfo> {
  const map = new Map<string, DayInfo>();
  const hue = `var(--color-agent-${slug}, var(--color-accent))`;
  for (const r of rows) {
    map.set(r.date, { total: r.total, hue });
  }
  return map;
}

function aggregateGlobal(rows: AgentDayActivity[]): Map<string, DayInfo> {
  const tmp = new Map<string, { total: number; byAgent: Record<string, number> }>();
  for (const r of rows) {
    let b = tmp.get(r.date);
    if (!b) { b = { total: 0, byAgent: {} }; tmp.set(r.date, b); }
    b.total += r.count;
    b.byAgent[r.agent_slug] = (b.byAgent[r.agent_slug] ?? 0) + r.count;
  }
  const out = new Map<string, DayInfo>();
  for (const [d, b] of tmp) {
    let dom = ""; let max = -1;
    for (const [s, c] of Object.entries(b.byAgent)) if (c > max) { max = c; dom = s; }
    out.set(d, { total: b.total, hue: `var(--color-agent-${dom}, var(--color-accent))`, byAgent: b.byAgent });
  }
  return out;
}

function cellColor(day: DayInfo | undefined, _single: boolean, _slug?: string): string {
  if (!day || day.total === 0) return "var(--color-surface-2)";
  const i = day.total === 1 ? 0.35 : day.total === 2 ? 0.6 : day.total === 3 ? 0.85 : 1;
  return `color-mix(in oklch, ${day.hue} ${Math.round(i * 100)}%, var(--color-surface))`;
}

function tooltipText(day: DayInfo | undefined, date: string, single: boolean): string {
  const dt = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (!day || day.total === 0) return `Quiet on ${dt}`;
  if (single) {
    return `${day.total} drop${day.total > 1 ? "s" : ""} · ${dt}`;
  }
  if (day.byAgent) {
    const parts: string[] = [];
    for (const [s, n] of Object.entries(day.byAgent)) parts.push(`${n} ${getAgentBySlug(s)?.name ?? s}`);
    return `${parts.join(", ")} · ${dt}`;
  }
  return `${day.total} on ${dt}`;
}

function buildCells(): (null | { date: string })[] {
  const out: (null | { date: string })[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10) });
  }
  const firstDow = new Date(out[0]!.date + "T12:00:00").getDay();
  for (let i = 0; i < firstDow; i++) out.unshift(null);
  return out;
}

function buildMonthLabels(cells: (null | { date: string })[]): string[] {
  const out: string[] = []; let prev = "";
  for (let w = 0; w < WEEKS; w++) {
    let label = "";
    for (let r = 0; r < 7; r++) {
      const c = cells[w * 7 + r];
      if (c) {
        const m = new Date(c.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" });
        if (m !== prev) { label = m; prev = m; }
        break;
      }
    }
    out.push(label);
  }
  return out;
}

function sumOverDays(map: Map<string, DayInfo>, days: number): number {
  let total = 0;
  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const k = cursor.toISOString().slice(0, 10);
    total += map.get(k)?.total ?? 0;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
}

function mostActiveToolThisWeek(rows: AgentDayActivity[]): { label: string; value: string; unit: string } {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  const totals = new Map<string, number>();
  for (const r of rows) {
    if (r.date < cutoffISO) continue;
    totals.set(r.agent_slug, (totals.get(r.agent_slug) ?? 0) + r.count);
  }
  let bestSlug = ""; let best = 0;
  for (const [s, n] of totals) if (n > best) { best = n; bestSlug = s; }
  if (!bestSlug) return { label: "Most active tool this week", value: "—", unit: "" };
  return {
    label: "Most active tool this week",
    value: getAgentBySlug(bestSlug)?.name ?? bestSlug,
    unit: `· ${best}`,
  };
}

function IntensityLegend({ slug }: { slug: string }) {
  return (
    <>
      <span>Less</span>
      {[0.15, 0.35, 0.55, 0.78, 1].map((v) => (
        <span key={v} className="inline-block h-[10px] w-[10px] rounded-[2px]" style={{
          background: `color-mix(in oklch, var(--color-agent-${slug}, var(--color-accent)) ${Math.round(v * 100)}%, var(--color-surface))`,
        }} />
      ))}
      <span>More</span>
    </>
  );
}

function AgentLegend({ slugs }: { slugs: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {slugs.map((s) => (
        <span key={s} className="inline-flex items-center gap-1.5">
          <span className="inline-block h-[9px] w-[9px] rounded-[2px]" style={{ background: `var(--color-agent-${s}, var(--color-accent))` }} />
          {getAgentBySlug(s)?.name ?? s}
        </span>
      ))}
    </div>
  );
}
