export type ChangelogEntry = {
  date: string;        // ISO date "2026-04-27"
  title: string;
  bullets: string[];
  knownIssues?: string[];
  pr?: string;
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-04-27",
    title: "v0.7, framework consolidation, /learn becomes the landscape view",
    bullets: [
      "PMClaws's 4-Level Framework and AI Radar's 5-Level Autonomy Taxonomy were two views of the same idea. Merged into one canonical 5-level framework at pmclaws.com/framework.",
      "/learn shrunk to a focused landscape page: 5-level summary table + LandscapeMatrix (5×4 products by level + category) + CTA to pmclaws.com/framework for the full version.",
      "Homepage 'Agentic AI 101' pill now points to pmclaws.com/framework. The 'New here?' card has two CTAs: framework on pmclaws.com (definition) or live landscape on AI Radar.",
      "Removed orphaned components (LevelCard, LevelJumps, DecisionTable). They live on pmclaws.com now, with capability + PM-trust lenses on each level.",
      "pmclaws.com/framework includes the new 'How to pick a level' field guide and a cross-link to the live AI Radar landscape.",
    ],
  },
  {
    date: "2026-04-27",
    title: "v0.6, X fallback chain + watermark fix + agent dropdown",
    bullets: [
      "X is back on, via pay-per-usage. X moved off tiered pricing to $0.005/tweet read in 2025/26. AI Radar uses ~$1–3/month at current scope. $5 starting balance gives 6+ months of runway. See notes/X_API_SETUP.md.",
      "Built X read fallback chain in lib/x.ts: X API → Nitter mirrors → RSSHub. First success wins. Public mirrors all dead in 2026 testing, but code is ready for whenever they come back.",
      "scripts/smoke-x.ts to re-check X mirror health periodically.",
      "Watermark filter now respects ?force=true (was a bug: force was bypassing the cache but still filtering, so backfills returned 0 entries).",
      "/drops gets an agent dropdown: Claude selectable, Cursor greyed-out as 'coming soon'.",
      "Video embed pipeline: added entries.video_url, cheerio detects YouTube/Vimeo iframes in entry blocks, TimelineEntry renders a 16:9 lazy iframe when present.",
      "Homepage: 'Now tracking' renamed to 'Timelines'; Cursor's coming-soon card is now a clickable Link.",
    ],
    knownIssues: [
      "anthropic.com/news parser only catches the featured cards (~3 entries). Publication list cards below the fold are not yet captured.",
      "docs.claude.com / platform.claude.com is a Mintlify SPA: content loads client-side, cheerio sees only the shell. Out of scope until we add Playwright.",
      "Newsletter is in waitlist mode: signups auto-confirm but no emails are sent until `RESEND_API_KEY` is set and the sender domain is verified.",
    ],
  },
  {
    date: "2026-04-27",
    title: "v0.5, scraper-first ingestion (no LLM in the daily path)",
    bullets: [
      "Replaced the Claude API HTML parser with deterministic cheerio parsers per source.",
      "support.claude.com release notes: 37 entries extracted with anchored URLs (#h_xxx).",
      "anthropic.com/news: featured cards (Opus 4.7, Claude Design, etc.) extracted by walking from <time> elements.",
      "Dropped docs.claude.com from the registry (Mintlify SPA, content is client-rendered, would need Playwright).",
      "Old LLM HTML parser archived to notes/_archive/llm_html_parser.ts in case we need a fallback later.",
      "Ingestion cost: ~$0 per cron run for HTML sources. X path unchanged (still uses X API v2).",
      "scripts/smoke-scrape.ts to test parsers locally without writing to DB.",
    ],
    knownIssues: [
      "Schema migration required: run `pnpm seed` to add the `x_user_id` column on source_state. Without it, every cron source returns `column \"x_user_id\" does not exist`.",
    ],
  },
  {
    date: "2026-04-27",
    title: "v0.4, rebrand to AI Radar + cross-agent feed",
    bullets: [
      "Renamed from iWakeUp to AI Radar, with 'I wake up.' as the slogan (the meme lives on).",
      "New /drops page: cross-agent timeline of every release, news, and X post, paginated.",
      "Heatmap on agent pages no longer needs horizontal scroll.",
      "LevelCard on /learn reverted to the calmer earlier styling.",
      "Landscape matrix is fully flat reference: no links, no highlights.",
      "SiteFooter centered, with /drops + /changelog links.",
      "Newsletter signup works in waitlist mode (auto-confirms when Resend isn't configured).",
    ],
  },
  {
    date: "2026-04-27",
    title: "v0.3, joining the PMClaws ecosystem",
    bullets: [
      "Reachable at radar.pmclaws.com as the public face of AI Radar.",
      "Real X API v2 integration replaces flaky web search for X timelines.",
      "Releases-default filter on agent pages with type pills (Releases / News / Posts / All).",
      "Landscape matrix on /learn is informational only, no longer clickable.",
      "Shared SiteFooter on every page with X handle, GitHub repo, changelog.",
      "Em-dash purge across the codebase.",
    ],
  },
  {
    date: "2026-04-27",
    title: "v0.2, ingestion quality + cache",
    bullets: [
      "Direct HTML fetch for changelog/blog sources (no more web_search guesswork).",
      "SHA-256 content hash cache, unchanged pages skip the Claude call entirely.",
      "Per-source result reporting in the cron response (status + inserted/found per URL).",
      "?force=true on the cron route for backfills and post-bug-fix re-ingestion.",
      "Stricter date discipline, drop entries with date-only titles or missing timestamps.",
    ],
  },
  {
    date: "2026-04-26",
    title: "v0.1, first public preview",
    bullets: [
      "Daily ingest at 5am PT for Claude release notes and changelog entries.",
      "Agentic AI 101 explainer at /learn with 5-level taxonomy and decision table.",
      "5×4 landscape matrix mapping products by autonomy level and category.",
      "Dark-mode minimal UI with Inter + JetBrains Mono.",
    ],
  },
];
