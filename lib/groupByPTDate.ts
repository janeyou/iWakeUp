import type { EntryRow } from "@/lib/db";
import { dedupeThreads } from "@/lib/selectFeaturedDrops";

export type DayGroup = {
  iso: string;
  displayDate: string;
  items: EntryRow[];
};

/**
 * Groups entries by PT calendar date (newest-first preserved).
 * Thread dedup is applied within each day so tweet threads count as one entry.
 */
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
  // Apply thread dedup per day after all entries are grouped.
  for (const g of map.values()) {
    g.items = dedupeThreads(g.items);
  }
  return Array.from(map.values());
}
