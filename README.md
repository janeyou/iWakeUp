# iWakeUp

A live timeline of releases, changelog drops, and announcements from the AI agents you actually use. A Vercel Cron job runs every day at 5am PT, calls Claude with web search to find new entries, and writes them to the timeline. By the time you wake up, the homepage shows what dropped overnight.

Live products in v1: **Claude**, **Cursor**. The rest of the landscape is greyed-out as "Coming soon."

See [`notes/PLAN.md`](notes/PLAN.md) for architecture and [`TODO.md`](TODO.md) for the build checklist.

## Local setup

```bash
pnpm install
cp .env.local.example .env.local   # fill in ANTHROPIC_API_KEY, CRON_SECRET, POSTGRES_URL
pnpm seed                          # apply schema + upsert agent registry
pnpm dev                           # http://localhost:3000
```

## Trigger ingestion locally

```bash
# via the API route (matches what Vercel Cron calls):
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/daily-update

# or directly:
pnpm ingest
```

## Deploy

1. Push to GitHub.
2. Import the repo in Vercel.
3. Attach Vercel Postgres (it injects `POSTGRES_URL` automatically).
4. Set env vars: `ANTHROPIC_API_KEY`, `CRON_SECRET` (random hex, e.g. `openssl rand -hex 32`).
5. Run `pnpm seed` once against the production DB (or via a one-off script).
6. The cron in `vercel.json` (`0 12 * * *` UTC = 5am PDT / 4am PST) runs automatically once deployed.
