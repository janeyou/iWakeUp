# AI Radar (iWakeUp)

A live timeline of releases, changelog drops, and announcements from the AI agents you actually use. A Vercel Cron job runs every morning at 5am PT, pulls each tracked agent's changelog / blog / X handles, deduplicates blog-vs-changelog cross-posts, and writes the results to the timeline. By the time you wake up, the homepage shows what dropped overnight.

Currently tracking: **Claude** (Anthropic), **Cursor**, **Codex** (OpenAI). More queued in `content/agents.ts` as `coming_soon`.

Tagline: *i wake up, there is another AI update.*

## Stack

- Next.js 16 App Router (Turbopack), React 19, Tailwind v4, TypeScript
- Vercel Postgres (Neon under the hood) + Vercel Cron
- `react-tweet` for embedded X posts
- Resend for newsletter signup + weekly digest (optional; runs in waitlist mode without it)
- Cheerio-based scrapers (`lib/scrape.ts`) per source; X API v2 for tweet ingestion

## Routes

- `/` — Today panel + per-agent cards + suggest form + newsletter signup
- `/drops` — Cross-agent firehose with a GitHub-style streak heatmap, agent chips, foldable day groups, day-deep-link via `?date=YYYY-MM-DD`
- `/agents/[slug]` — Per-tool profile: header + per-agent heatmap + 6 most recent entries + "see all" CTA
- `/learn` — 5-level autonomy landscape (informational)
- `/changelog`, `/status` — Site changelog + operator dashboard

## Local setup

```bash
pnpm install
cp .env.local.example .env.local   # fill in CRON_SECRET, POSTGRES_URL, X_BEARER_TOKEN
pnpm seed                          # apply schema + upsert agent registry
pnpm build                         # validates the production build (catches what dev skips)
pnpm dev                           # http://localhost:3000
```

## Trigger ingestion locally

```bash
# Via the API route (mirrors what Vercel Cron calls):
source .env.local
curl -H "Authorization: Bearer $CRON_SECRET" \
  "http://localhost:3000/api/cron/daily-update?force=true" | jq

# Or directly via tsx (one-shot, no HTTP):
pnpm ingest
```

`?force=true` bypasses per-source content-hash caching.

## Cron jobs

Defined in `vercel.json`:

- `daily-update` at `0 12 * * *` (5am PT) — ingest + dedup
- `weekly-digest` at `0 18 * * 0` (Sunday 11am PT) — Resend digest, no-op if `RESEND_API_KEY` unset

Both gated by `Authorization: Bearer ${CRON_SECRET}` on the route handler.

## Deploy

1. Push to GitHub.
2. Import the repo in Vercel.
3. Attach a Vercel Marketplace Postgres (Neon recommended). It auto-injects `POSTGRES_URL`.
4. Set env vars in Vercel: `CRON_SECRET` (random hex, `openssl rand -hex 32`), `X_BEARER_TOKEN`, optionally `RESEND_API_KEY` + `RESEND_FROM` + `NEXT_PUBLIC_SITE_URL`.
5. First deploy will create the schema and seed the agent registry on the next ingest run, or trigger it manually via the cron URL above.
6. Crons run automatically once the project is deployed.

## Adding a new agent

Edit `content/agents.ts`:

```ts
{
  slug: "my-agent",
  name: "My Agent",
  status: "live",
  officialUrl: "https://example.com",
  blurb: "What it does in one sentence.",
  sources: [
    { type: "x", url: "https://x.com/handle", label: "@handle" },
    // optionally a changelog source with a registered parser:
    // { type: "changelog", url: "https://example.com/changelog", parser: "claude-support" },
  ],
},
```

Then `pnpm seed` to upsert. Brand color (used in `TodayPanel` labels and the global heatmap) goes in `app/globals.css` as `--color-agent-<slug>` and `--color-agent-<slug>-soft`.

For new changelog/blog sources, add a parser to `lib/scrape.ts` and register it in the `parser` field. X sources don't need a parser.

## Suggest a tool

The home page has a `<SuggestToolForm>` that POSTs to `/api/suggest`. Submissions land in the `tool_suggestions` table for the maintainer to review.
