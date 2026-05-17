// Issue 001 = Sunday 2026-05-17. Continuous Issue + yearly Volume (52 issues/vol).
export const LAUNCH_DATE = "2026-05-17";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Returns the upcoming-or-current Sunday in America/Los_Angeles as YYYY-MM-DD.
 * Used as the canonical issue key. Saturday cron returns tomorrow's Sunday;
 * Sunday cron returns today.
 */
export function getCurrentWeekKey(now: Date = new Date()): string {
  // Get the PT date components for `now`
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
  const parts = fmt.formatToParts(now);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  const weekday = parts.find((p) => p.type === "weekday")!.value;
  // weekday is short name: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const order: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const offset = order[weekday] === 0 ? 0 : 7 - order[weekday];
  const today = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const sunday = new Date(today.getTime() + offset * 86400_000);
  return sunday.toISOString().split("T")[0];
}

export type IssueNumbers = {
  vol: string;        // "01"
  issue: string;      // "001"
  formatted: string;  // "Vol 01 · Issue 001"
};

/**
 * Given the Sunday of an issue (YYYY-MM-DD), return zero-padded volume and issue
 * numbers. Inputs not aligned to a Sunday are floored to the nearest Sunday before
 * the date.
 */
export function getIssueNumbers(sundayKey: string): IssueNumbers {
  const launch = Date.parse(`${LAUNCH_DATE}T00:00:00Z`);
  const target = Date.parse(`${sundayKey}T00:00:00Z`);
  const weeksSinceLaunch = Math.max(0, Math.floor((target - launch) / WEEK_MS));
  const issueNum = weeksSinceLaunch + 1;
  const volNum = Math.floor((issueNum - 1) / 52) + 1;
  const vol = String(volNum).padStart(2, "0");
  const issue = String(issueNum).padStart(3, "0");
  return { vol, issue, formatted: `Vol ${vol} · Issue ${issue}` };
}
