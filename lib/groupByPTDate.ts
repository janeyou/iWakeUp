import type { EntryRow } from "@/lib/db";

export type DayGroup = {
  iso: string;
  displayDate: string;
  items: EntryRow[];
};

/** Groups entries by PT calendar date (newest-first preserved from input). */
export function groupByPTDate(entries: EntryRow[]): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const e of entries) {
    const d = new Date(e.published_at);
    const iso = d.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
    let g = map.get(iso);
    if (!g) {
      g = {
        iso,
        displayDate: d.toLocaleDateString("en-US", {
          timeZone: "America/Los_Angeles",
          weekday: "long",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        items: [],
      };
      map.set(iso, g);
    }
    g.items.push(e);
  }
  return Array.from(map.values());
}
