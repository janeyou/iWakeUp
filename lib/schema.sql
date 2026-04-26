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
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_agent_published
  ON entries(agent_slug, published_at DESC);

CREATE INDEX IF NOT EXISTS entries_ingested
  ON entries(ingested_at DESC);
