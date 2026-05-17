CREATE TABLE IF NOT EXISTS agents (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('live', 'coming_soon')),
  official_url TEXT,
  x_handle TEXT,
  changelog_url TEXT,
  blurb TEXT
);

CREATE TABLE IF NOT EXISTS entries (
  id SERIAL PRIMARY KEY,
  agent_slug TEXT NOT NULL REFERENCES agents(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  source_url TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('changelog', 'blog', 'x')),
  tweet_id TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entry_type TEXT NOT NULL DEFAULT 'release'
);

ALTER TABLE entries ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'release';
ALTER TABLE entries ADD COLUMN IF NOT EXISTS video_url TEXT;
-- LLM-derived quality signal for X tweets. 0 noise (never inserted),
-- 1 low, 2 medium, 3 high. Nullable for non-X entries.
ALTER TABLE entries ADD COLUMN IF NOT EXISTS quality_score SMALLINT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS quality_reason TEXT;

CREATE INDEX IF NOT EXISTS entries_agent_published
  ON entries(agent_slug, published_at DESC);

CREATE INDEX IF NOT EXISTS entries_ingested
  ON entries(ingested_at DESC);

CREATE TABLE IF NOT EXISTS source_state (
  url TEXT PRIMARY KEY,
  agent_slug TEXT NOT NULL REFERENCES agents(slug) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('changelog', 'blog', 'x')),
  last_fetched_at TIMESTAMPTZ NOT NULL,
  content_hash TEXT,
  last_status INTEGER,
  last_entry_count INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  x_user_id TEXT
);

ALTER TABLE source_state ADD COLUMN IF NOT EXISTS x_user_id TEXT;

CREATE TABLE IF NOT EXISTS subscribers (
  email TEXT PRIMARY KEY,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  confirm_token TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscribers_active
  ON subscribers(confirmed_at)
  WHERE unsubscribed_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_confirm_token
  ON subscribers(confirm_token);

CREATE UNIQUE INDEX IF NOT EXISTS subscribers_unsubscribe_token
  ON subscribers(unsubscribe_token);

CREATE TABLE IF NOT EXISTS tool_suggestions (
  id SERIAL PRIMARY KEY,
  tool_name TEXT NOT NULL,
  source_url TEXT,
  x_handle TEXT,
  note TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digest_approvals (
  week_key         TEXT        PRIMARY KEY,
  approved_at      TIMESTAMPTZ,
  sent_at          TIMESTAMPTZ,
  entry_count      INT,
  subscriber_count INT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
