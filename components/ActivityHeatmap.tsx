import type { ActivityDay, AgentDayActivity } from "@/lib/db";
import { getAgentBySlug } from "@/content/agents";

const WEEKS = 26;
const DAYS = WEEKS * 7;

type SingleProps = {
  mode?: "single";
  agentSlug: string;
  data: ActivityDay[];
};

type GlobalProps = {
  mode: "global";
  data: AgentDayActivity[];
  agentSlugs: string[];
};

export function ActivityHeatmap(props: SingleProps | GlobalProps) {
  const cells = buildCells();
  const monthLabels = buildMonthLabels(cells);

  const single = props.mode !== "global";
  const aggregated = single
    ? aggregateSingle(props.data)
    : aggregateGlobal(props.data);

  return (
    <section>
      <div className="py-2">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--color-text-faint)]">
            Last 6 months
          </h2>
          {single ? <IntensityLegend /> : <AgentLegend slugs={props.agentSlugs} />}
        </div>

        <div className="flex gap-2">
          <div className="flex flex-col gap-[3px] pt-[14px] pr-1 text-[9px] text-[var(--color-text-faint)] font-mono">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div key={i} className="h-[12px] leading-[12px]">
                {d}
              </div>
            ))}
          </div>

          <div className="flex-1">
            <div className="flex h-[14px] gap-[3px] mb-[2px] text-[9px] text-[var(--color-text-faint)] font-mono">
              {monthLabels.map((label, i) => (
                <div key={i} className="w-[12px] shrink-0">
                  {label}
                </div>
              ))}
            </div>
            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${WEEKS}, 12px)` }}
            >
              {cells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`pad-${idx}`} className="w-[12px] h-[12px]" />;
                }
                const day = aggregated.get(cell.date);
                const href = single
                  ? `/agents/${(props as SingleProps).agentSlug}?type=all&date=${cell.date}`
                  : `/drops?date=${cell.date}`;
                return (
                  <a
                    key={cell.date}
                    href={href}
                    title={tooltipText(day, cell.date, single)}
                    className="block w-[12px] h-[12px] rounded-sm"
                    style={{ backgroundColor: cellColor(day, single) }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type DayInfo = {
  total: number;
  hue: string;
  byAgent?: Record<string, number>;
  byType?: { releases: number; news: number; posts: number };
};

function aggregateSingle(rows: ActivityDay[]): Map<string, DayInfo> {
  const map = new Map<string, DayInfo>();
  for (const r of rows) {
    const max = Math.max(r.releases, r.news, r.posts);
    const hue =
      max === r.releases
        ? "var(--color-release)"
        : max === r.news
          ? "var(--color-news)"
          : "var(--color-post)";
    map.set(r.date, {
      total: r.total,
      hue,
      byType: { releases: r.releases, news: r.news, posts: r.posts },
    });
  }
  return map;
}

function aggregateGlobal(rows: AgentDayActivity[]): Map<string, DayInfo> {
  // Group by date, sum total, pick dominant agent.
  const tmp = new Map<string, { total: number; byAgent: Record<string, number> }>();
  for (const r of rows) {
    let bucket = tmp.get(r.date);
    if (!bucket) {
      bucket = { total: 0, byAgent: {} };
      tmp.set(r.date, bucket);
    }
    bucket.total += r.count;
    bucket.byAgent[r.agent_slug] = (bucket.byAgent[r.agent_slug] ?? 0) + r.count;
  }
  const out = new Map<string, DayInfo>();
  for (const [date, b] of tmp) {
    let dominant = "";
    let max = -1;
    for (const [slug, c] of Object.entries(b.byAgent)) {
      if (c > max) {
        max = c;
        dominant = slug;
      }
    }
    out.set(date, {
      total: b.total,
      hue: agentHue(dominant),
      byAgent: b.byAgent,
    });
  }
  return out;
}

function agentHue(slug: string): string {
  return `var(--color-agent-${slug}, var(--color-accent))`;
}

function cellColor(day: DayInfo | undefined, single: boolean): string {
  if (!day || day.total === 0) return "var(--color-surface)";
  const intensity =
    day.total === 1 ? 0.35 : day.total === 2 ? 0.6 : day.total === 3 ? 0.85 : 1;
  void single;
  return `color-mix(in oklch, ${day.hue} ${Math.round(intensity * 100)}%, var(--color-surface))`;
}

function tooltipText(day: DayInfo | undefined, date: string, single: boolean): string {
  const dt = new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  if (!day || day.total === 0) return `Nothing on ${dt}`;
  if (single && day.byType) {
    const parts: string[] = [];
    const t = day.byType;
    if (t.releases) parts.push(`${t.releases} release${t.releases > 1 ? "s" : ""}`);
    if (t.news) parts.push(`${t.news} news`);
    if (t.posts) parts.push(`${t.posts} post${t.posts > 1 ? "s" : ""}`);
    return `${parts.join(", ")} on ${dt}`;
  }
  if (day.byAgent) {
    const parts: string[] = [];
    for (const [slug, n] of Object.entries(day.byAgent)) {
      const name = getAgentBySlug(slug)?.name ?? slug;
      parts.push(`${n} from ${name}`);
    }
    return `${parts.join(", ")} on ${dt}`;
  }
  return `${day.total} on ${dt}`;
}

function buildCells(): { date: string }[] | (null | { date: string })[] {
  const cells: (null | { date: string })[] = [];
  const today = new Date();
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    cells.push({ date: toISODate(d) });
  }
  const firstDow = new Date(cells[0]!.date).getDay();
  for (let i = 0; i < firstDow; i++) cells.unshift(null);
  return cells;
}

function buildMonthLabels(cells: (null | { date: string })[]): string[] {
  const out: string[] = [];
  let prevMonth = "";
  for (let w = 0; w < WEEKS; w++) {
    let label = "";
    for (let r = 0; r < 7; r++) {
      const cell = cells[w * 7 + r];
      if (cell) {
        const month = new Date(cell.date).toLocaleDateString("en-US", { month: "short" });
        if (month !== prevMonth) {
          label = month;
          prevMonth = month;
        }
        break;
      }
    }
    out.push(label);
  }
  return out;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function IntensityLegend() {
  return (
    <div className="flex items-center gap-3 text-[10px] text-[var(--color-text-faint)] font-mono">
      <span>less</span>
      {[0.15, 0.35, 0.6, 0.85, 1].map((i) => (
        <span
          key={i}
          className="block w-[10px] h-[10px] rounded-sm"
          style={{
            backgroundColor: `color-mix(in oklch, var(--color-release) ${Math.round(i * 100)}%, var(--color-surface))`,
          }}
        />
      ))}
      <span>more</span>
    </div>
  );
}

function AgentLegend({ slugs }: { slugs: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--color-text-faint)] font-mono">
      {slugs.map((slug) => {
        const name = getAgentBySlug(slug)?.name ?? slug;
        return (
          <span key={slug} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="block w-[10px] h-[10px] rounded-sm"
              style={{ backgroundColor: agentHue(slug) }}
            />
            {name}
          </span>
        );
      })}
    </div>
  );
}
