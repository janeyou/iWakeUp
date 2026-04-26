# iWakeUp — AI Agents Landscape Tracker

## Context

The "Agentic AI Landscape 2026" essay just shipped. The premise — *"the autonomy ladder is a design decision, not a leaderboard"* — is hard to feel in a static piece. **iWakeUp** is the live counterpart: a public web app that tracks what each agent product actually shipped, when, and links to the source. A Vercel Cron job runs every day at 5am PT, calls Claude with web search to discover new releases on each product's official channels, and writes them to the timeline. By the time Jane (and other readers) wake up, the homepage shows "what dropped overnight."

This is also a working demo of the L3→L4 thesis: a persistent, self-triggering ingestion agent with a human-reviewable trail. Two products are live in v1 — **Claude** and **Cursor** — with the rest of the landscape (Windsurf, Lovable, Replit Agent, Claude Cowork, Devin, OpenHands, OpenClaw, Hermes Agent, OpenAI Operator, Copilot, Jules) shown as greyed-out "coming soon" cards.

## Stack

Match `janeyou.me` conventions (already her gold standard):

- **Next.js 16** App Router + React 19 + TypeScript
- **Tailwind v4** with `@theme` palette in `app/globals.css`
- **Dark mode** as the only mode (no toggle in v1) — `<html class="dark">`
- **Vercel** hosting (gives us Cron + Postgres + KV in one place)
- **Vercel Postgres** (Neon-backed) for entries
- **`react-tweet`** ([vercel/react-tweet](https://github.com/vercel/react-tweet)) for embedded X posts — no auth, no X API costs, just needs the tweet ID
- **`@anthropic-ai/sdk`** for ingestion, using `claude-opus-4-7` with the `web_search` tool and prompt caching (per global CLAUDE.md)

## File structure

```
iWakeUp/
├── app/
│   ├── layout.tsx              # dark-mode root, Inter font
│   ├── globals.css             # Tailwind v4 @theme palette
│   ├── page.tsx                # homepage: "Today" panel + agent grid
│   ├── agents/[slug]/page.tsx  # per-agent timeline
│   └── api/cron/daily-update/route.ts  # 5am PT ingestion handler
├── components/
│   ├── TodayPanel.tsx          # "What dropped overnight" hero
│   ├── AgentCard.tsx           # grid card (live or greyed)
│   ├── TimelineEntry.tsx       # one entry — handles changelog, blog, or tweet
│   └── EmbeddedTweet.tsx       # thin wrapper around react-tweet
├── lib/
│   ├── db.ts                   # Vercel Postgres client + typed queries
│   ├── ingest.ts               # Claude web-search call + dedupe + insert
│   └── agents.ts               # static agent registry (slug, name, status, sources, logo)
├── content/
│   └── agents.ts               # the registry — hand-edited TS, matches janeyou.me pattern
├── scripts/
│   └── seed.ts                 # one-off: seed `agents` table from registry
├── vercel.json                 # cron schedule
└── package.json
```

## Data model (Postgres)

```sql
CREATE TABLE agents (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,           -- 'live' | 'coming_soon'
  official_url TEXT,
  x_handle TEXT,
  changelog_url TEXT,
  logo_path TEXT
);

CREATE TABLE entries (
  id SERIAL PRIMARY KEY,
  agent_slug TEXT NOT NULL REFERENCES agents(slug),
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL UNIQUE,   -- dedupe key
  source_type TEXT NOT NULL,         -- 'changelog' | 'blog' | 'x'
  tweet_id TEXT,                     -- only when source_type = 'x'
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX entries_agent_published ON entries(agent_slug, published_at DESC);
CREATE INDEX entries_ingested ON entries(ingested_at DESC);
```

`source_url UNIQUE` is the dedupe guarantee: re-running the cron twice in a day inserts nothing new.

## Ingestion pipeline (`lib/ingest.ts`)

Cron handler at `app/api/cron/daily-update/route.ts`:

1. Auth: reject if `Authorization: Bearer ${process.env.CRON_SECRET}` doesn't match (Vercel Cron sends this automatically).
2. For each agent where `status = 'live'`:
   1. Read `MAX(published_at)` from `entries` for that agent — the watermark.
   2. Call Claude (`claude-opus-4-7`) with the `web_search` tool. Prompt:
      > "Find official release notes, changelog entries, and notable X posts from `${name}` (`${officialUrl}`, X: @`${xHandle}`, changelog: `${changelogUrl}`) published after `${watermark}`. For each, return: title, 1-sentence summary, canonical source_url, source_type (`changelog` | `blog` | `x`), tweet_id if X, published_at (ISO 8601). Return `{entries: [...]}` JSON. If nothing new, return `{entries: []}`."
   3. Run the SDK tool-use loop until the model returns a final JSON message. Parse with Zod; drop malformed entries with a warning.
   4. Bulk insert with `ON CONFLICT (source_url) DO NOTHING`.
3. Return `{ agent: slug, inserted: N }[]` for the cron log.

Use prompt caching on the system message (`cache_control: { type: 'ephemeral' }`).

## Cron schedule (`vercel.json`)

```json
{
  "crons": [
    { "path": "/api/cron/daily-update", "schedule": "0 12 * * *" }
  ]
}
```

`12:00 UTC` = **5am PDT** (Mar–Nov) / 4am PST (Nov–Mar). Acceptable drift; the brief asks for "around 5am." If exact 5am PT year-round matters later, run twice (`0 12,13 * * *`) — dedupe makes the second run a no-op.

## Pages

### `/` — Homepage

1. **Header.** Wordmark "iWakeUp" + tagline: *"What the AI agents shipped while you slept."* Tiny "as of <last cron timestamp> PT" stamp.
2. **Today panel.** Queries `entries WHERE ingested_at > now() - interval '24 hours'`, groups by `agent_slug`. Heading: *"What dropped overnight — Sat Apr 25 → Sun Apr 26."* Empty state: *"Nothing new overnight. Check back tomorrow."*
3. **Bird's-eye grid.** All agents from the registry as cards.
   - **Live cards** (Claude, Cursor): logo, name, latest entry title, "View timeline →" link.
   - **Coming-soon cards**: same shape, `opacity-40`, no link, small "Coming soon" badge.
4. **Footer.** Links to landscape essay, GitHub repo, "Built by Jane You / w Claude Code."

### `/agents/[slug]` — Agent detail

1. Header: large logo, name, official-site link (external icon), X handle link, last-updated stamp.
2. Vertical timeline (newest first), grouped by date heading. Each entry:
   - Time (`14:32 PT`)
   - Title (links to `source_url`)
   - 1-line summary
   - Source-type badge: Changelog / Blog / X
   - If `source_type = 'x'`: render `<EmbeddedTweet id={tweet_id} />` below the summary.

For greyed-out agents, route renders a "Coming soon" page.

## Design tokens (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-bg: oklch(0.13 0.01 250);          /* near-black, slight cool tint */
  --color-surface: oklch(0.18 0.01 250);
  --color-border: oklch(0.25 0.01 250);
  --color-text: oklch(0.96 0 0);
  --color-text-muted: oklch(0.65 0.01 250);
  --color-accent: oklch(0.72 0.18 290);      /* subtle violet — AI/agent feel */

  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}
```

Visual language: generous whitespace, content-first, no gradients, no shadows on cards (just thin borders). Single accent color (violet) reserved for hover + "NEW" badge. Inter for body, mono for timestamps.

## Out of scope (v1)

- Email digest
- Auth / accounts / personalization
- RSS/Atom feed (easy v2 add — one route)
- Admin UI for editing entries (since we picked fully automated, no approval queue)
- Analytics — add Vercel Analytics later if traffic warrants
- More than 2 live products — flip them on as we trust the ingestion

## Verification

1. **Local dev.** `pnpm dev` boots; homepage renders empty Today panel + 2 live cards + ~11 greyed cards.
2. **Seed.** `pnpm tsx scripts/seed.ts` populates the `agents` table.
3. **Cron handler dry-run.** `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-update` returns inserted counts.
4. **Timeline page.** `/agents/claude` renders entries newest-first; an X-source entry renders an embedded tweet.
5. **Today panel.** After a fresh cron run, `/` shows new entries grouped by agent.
6. **Greyed agents.** `/agents/devin` returns a "Coming soon" page.
7. **Deploy.** Push to Vercel; set `CRON_SECRET`, `ANTHROPIC_API_KEY`, attach Postgres. Verify first scheduled 12:00 UTC run in Cron logs.
8. **Hallucination spot-check.** Manually compare the first 2–3 cron-run entries against the actual changelog pages — confirm titles, dates, URLs match. (The "trust the agent, verify the output" gate from the essay.)
