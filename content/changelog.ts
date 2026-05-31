export type ChangelogEntry = {
  date: string; // ISO date, e.g. "2026-05-04"
  title: string;
  bullets: string[];
};

/** What shipped, newest first. User-facing only; internals live in notes. */
export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-31",
    title: "v0.11, weekly editorial digest + public issue archive",
    bullets: [
      "Issue 003 is out: 'i wake up, there is another milestone week of AI updates.' Covers Opus 4.8 and Anthropic's $65B Series H, across 5 themes.",
      "Past issues are now public at airadarapp.com/issues. Each one is a shareable permalink like /issues/2026-05-31.",
      "Weekly digest redesigned around an editorial layout: hub-and-spokes hub card, themed sections, CEO-scan headlines that name names when one story dominates the week.",
      "Drafts auto-generated each Saturday by Claude Opus 4.7. Sunday 6am PT, the digest goes out to subscribers.",
      "Theme count is now flexible (3 to 6 per week) instead of forced six, so quiet weeks earn fewer themes and loud weeks earn more.",
      "Continuous Issue + yearly Volume numbering. Issue 001 was May 17.",
      "New 'Issues' link in the top nav.",
    ],
  },
  {
    date: "2026-05-04",
    title: "v0.7, public beta",
    bullets: [
      "AI Radar is officially in public beta. Expect rough edges and fast changes.",
      "/drops gets a compact text-only default view, weekly Sunday rollup on the changelog, and click-a-cell-to-expand on the heatmap.",
      "Latest AI Drop always shows the top 5, even on quiet mornings.",
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
    date: "2026-06-30",
    title: "Per-entry actions",
    bullets: [
      "Mark items seen, save them for later, or react with a quick note.",
      "/me page to see what you've collected.",
    ],
  },
  {
    date: "2026-07-15",
    title: "More agents",
    bullets: [
      "Wiring in the next batch of tools. Have a suggestion? Send it from the footer.",
    ],
  },
  {
    date: "2026-07-30",
    title: "Pick your themes",
    bullets: [
      "Subscribe to the themes you care about, model launches, security, enterprise plumbing, builder profiles, and have the Sunday digest filter to those.",
    ],
  },
];
