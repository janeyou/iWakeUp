export type ChangelogEntry = {
  date: string; // ISO date, e.g. "2026-05-04"
  title: string;
  bullets: string[];
};

/** What shipped, newest first. User-facing only; internals live in notes. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-04",
    title: "New look: Geist, light by default, teal accent",
    bullets: [
      "Quieter masthead and footer, less display-shouty.",
      "Compact embedded tweet on the lead drop so the timeline tiles stay above the fold.",
      "Top nav: Drops, Landscape, Framework, Changelog. Status moved to the footer.",
    ],
  },
  {
    date: "2026-05-03",
    title: "Live at airadarapp.com + real email",
    bullets: [
      "Custom domain attached: the site now lives at airadarapp.com.",
      "Newsletter signup sends a real confirmation email.",
      "Weekly digest goes out Sunday evenings.",
    ],
  },
  {
    date: "2026-04-29",
    title: "Cursor + Codex, plus a cross-agent firehose",
    bullets: [
      "Now tracking Claude, Cursor, and Codex.",
      "/drops shows a cross-agent activity heatmap and foldable day groups; click any day to scope.",
      "Per-tool pages: header, heatmap, recent drops.",
    ],
  },
  {
    date: "2026-04-28",
    title: "Suggest a tool",
    bullets: [
      "A small form in the footer to send us an agent worth tracking.",
    ],
  },
  {
    date: "2026-04-27",
    title: "First public version: AI Radar",
    bullets: [
      "A daily timeline of what the AI agents shipped while you slept.",
      "Updated every morning at 5am PT.",
      "Newsletter signup + 6-month activity heatmap on each tool's page.",
    ],
  },
];

/** What's next. Direction, not deadline; dates may shift. */
export const UPCOMING: ChangelogEntry[] = [
  {
    date: "2026-05-15",
    title: "Per-entry actions",
    bullets: [
      "Mark items seen, save them for later, or react with a quick note.",
      "/me page to see what you've collected.",
    ],
  },
  {
    date: "2026-05-30",
    title: "More agents",
    bullets: [
      "Wiring in the next batch of tools. Have a suggestion? Send it from the footer.",
    ],
  },
];
