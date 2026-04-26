# iWakeUp — Build Checklist

Plan: [`notes/PLAN.md`](notes/PLAN.md)

## Foundation
- [x] Scaffold Next.js 16 + React 19 + TypeScript project
- [x] Install deps: `tailwindcss@4`, `@anthropic-ai/sdk`, `react-tweet`, `@vercel/postgres`, `zod`, `tsx`
- [x] Configure dark-only root layout (`app/layout.tsx`)
- [x] Wire Tailwind v4 `@theme` palette in `app/globals.css` (bg, surface, border, text, text-muted, accent violet)
- [x] Load Inter + JetBrains Mono fonts

## Data layer
- [x] Write SQL migration for `agents` and `entries` tables (with indexes + UNIQUE on `source_url`)
- [x] `lib/db.ts` — typed query helpers (`getEntriesForAgent`, `getRecentEntries`, `getLatestEntryForAgent`, `getWatermark`, `insertEntries`, `getLastIngestedAt`)
- [x] `content/agents.ts` — registry with Claude + Cursor (live) and 11 coming-soon entries
- [x] `scripts/seed.ts` — idempotent upsert from registry into `agents` table (also applies schema)

## Ingestion
- [x] `lib/ingest.ts` — for each live agent: read watermark → Claude `web_search` call → Zod parse → bulk insert with `ON CONFLICT DO NOTHING`
- [x] Prompt caching on the system message
- [x] `app/api/cron/daily-update/route.ts` — `Authorization: Bearer $CRON_SECRET` check + run ingestion + return JSON counts
- [x] `vercel.json` with `0 12 * * *` schedule

## UI
- [x] `components/TodayPanel.tsx` — entries from last 24h grouped by agent (empty-state copy when none)
- [x] `components/AgentCard.tsx` — live + coming-soon variants
- [x] `components/TimelineEntry.tsx` — date+time, title→source_url, summary, source-type badge
- [x] `components/EmbeddedTweet.tsx` — `react-tweet` wrapper with suspense skeleton
- [x] `app/page.tsx` — header + Today panel + agent grid + footer
- [x] `app/agents/[slug]/page.tsx` — header + grouped timeline; coming-soon fallback for non-live slugs

## Verification (already done — pre-DB)
- [x] `pnpm typecheck` passes (no errors)
- [x] `pnpm dev` boots; `/` renders (HTTP 200, empty Today panel)
- [x] `/agents/claude` renders timeline shell (HTTP 200; empty until DB is wired)
- [x] `/agents/devin` renders Coming Soon page (HTTP 200)
- [x] `/agents/nonexistent` returns HTTP 404

---

## Step 1 — Push to GitHub
The Vercel flow is easier when there's a repo to import.

```bash
cd /Users/janeyou/Obsidian/Personal/Projects/iWakeUp

# CLAUDE.md says github.com → use jane2745@gmail.com
git init
git config user.name "janeyou"
git config user.email "jane2745@gmail.com"

git add .
git commit -m "$(cat <<'EOF'
initial scaffold: Next.js 16 + Tailwind v4, Claude + Cursor live, daily Claude+web_search ingestion at 5am PT

w/Claude Code
EOF
)"

# Create the repo and push (private to start; flip to public anytime)
gh repo create janeyou/iWakeUp --private --source=. --push
```

**Expected:** repo at `https://github.com/janeyou/iWakeUp`, main branch pushed.

---

## Step 2 — Provision the Vercel project + Postgres
This gives you the `POSTGRES_URL` you need for both local dev and production.

1. **Install/login Vercel CLI** (skip if already done):
   ```bash
   pnpm dlx vercel@latest login
   ```
2. **Link the local repo to a new Vercel project:**
   ```bash
   pnpm dlx vercel@latest link
   # Pick "Create new project" → name: iwakeup → confirm directory
   ```
3. **Attach Postgres in the Vercel dashboard:**
   - Open https://vercel.com/janeyou-projects/iwakeup → **Storage** tab
   - Click **Create Database** → **Postgres** (Neon-backed) → name it `iwakeup-db`, region close to you
   - On the next screen, click **Connect Project** and pick `iwakeup` → environment: **All**
   - Vercel auto-injects `POSTGRES_URL` (and a few siblings) into the project's env vars
4. **Add the two secrets you control:**
   - In the project's **Settings → Environment Variables**, add:
     - `ANTHROPIC_API_KEY` = your key from https://console.anthropic.com/settings/keys (Production + Preview + Development)
     - `CRON_SECRET` = output of `openssl rand -hex 32` (Production + Preview + Development)
5. **Pull all env vars to a local `.env.local`:**
   ```bash
   pnpm dlx vercel@latest env pull .env.local
   ```

**Expected:** `.env.local` exists with `POSTGRES_URL=...`, `ANTHROPIC_API_KEY=...`, `CRON_SECRET=...` (plus a few extra Postgres vars Vercel adds — leave them alone).

---

## Step 3 — Apply schema + seed the agents table
One-time, and idempotent (safe to re-run anytime).

```bash
pnpm seed
```

**Expected output:**
```
Schema applied (5 statements).
Upserted 13 agents.
```

Sanity-check the DB from the Vercel dashboard → Storage → `iwakeup-db` → **Data** tab → query `SELECT slug, status FROM agents;` — should return 2 `live` (claude, cursor) and 11 `coming_soon`.

---

## Step 4 — Trigger the first ingestion locally
```bash
pnpm dev
# in a second terminal:
source .env.local
curl -s -H "Authorization: Bearer $CRON_SECRET" \
  http://localhost:3000/api/cron/daily-update | jq
```

**Expected:** ~30–90s wait (Claude is doing live web searches), then JSON like:
```json
{
  "startedAt": "2026-04-26T...",
  "finishedAt": "2026-04-26T...",
  "results": [
    { "agent": "claude", "inserted": 4, "found": 4 },
    { "agent": "cursor", "inserted": 6, "found": 6 }
  ]
}
```
If `inserted: 0, found: 0` for a product, the model didn't find anything new — re-check the URLs in `content/agents.ts`. If `error` field appears, read it (most common: bad `ANTHROPIC_API_KEY` or an SDK version mismatch).

---

## Step 5 — Confirm UI shows the entries
- [ ] Open http://localhost:3000 — Today panel now shows entries grouped by agent
- [ ] Open http://localhost:3000/agents/claude — vertical timeline, grouped by date, source-type badge per entry
- [ ] Open http://localhost:3000/agents/cursor — same
- [ ] If an X-source entry made it in, the embedded tweet renders below the summary (visible card with the actual tweet content). If the tweet doesn't load, check browser console — `react-tweet` fetches client-side from the public Twitter syndication API.

---

## Step 6 — Hallucination spot-check (the L3 trust gate)
**Critical:** Don't skip this. The whole point of the essay is "trust the agent, verify the output." Do this now while the volume is low and the cost of a bad entry is just deleting a row.

For the first 2–3 entries on `/agents/claude`:
- [ ] Click the title — does `source_url` load to a real Anthropic page?
- [ ] Does the entry title match the actual page heading?
- [ ] Does `published_at` match the date on the page?

Same for `/agents/cursor`. If any entry is hallucinated:
```sql
-- in Vercel Postgres Data tab
DELETE FROM entries WHERE source_url = '<bad url>';
```
Then re-tighten the system prompt in `lib/ingest.ts` (e.g., add "If you cannot find the canonical URL, drop the entry rather than guess").

---

## Step 7 — Deploy
```bash
git push   # main → Vercel auto-deploys (took ~60s on a similar Next 16 project)
```

- [ ] Watch the build in the Vercel dashboard → Deployments. Should go green in ~1 min.
- [ ] Open the production URL (`https://iwakeup.vercel.app` or your custom domain) — homepage shows the Today panel populated (carries over from local seed since same DB)
- [ ] Vercel dashboard → **Cron Jobs** tab → confirm `/api/cron/daily-update` is listed with schedule `0 12 * * *`
- [ ] Click **Run** on the cron job to fire it once manually — confirm it returns 200 in the cron log within ~90s
- [ ] (Optional, post-launch) Add a custom domain in Vercel → Settings → Domains (e.g., `iwakeup.com` if you grab it, or `iwakeup.janeyou.me` as a subdomain)

## Step 8 — Watch the first scheduled run
- [ ] Tomorrow at 5am PT (`0 12 * * *` UTC = 5am PDT), check Vercel dashboard → Cron Jobs → `daily-update` → **Logs** tab. Should show a 200 response and a JSON body with `inserted` counts.
- [ ] Refresh the homepage — Today panel reflects the overnight drop.
