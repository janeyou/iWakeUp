import { sql } from "@vercel/postgres";

export type EntryRow = {
  id: number;
  agent_slug: string;
  title: string;
  summary: string | null;
  source_url: string;
  source_type: "changelog" | "blog" | "x";
  tweet_id: string | null;
  published_at: string;
  ingested_at: string;
};

export type NewEntry = {
  agent_slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_type: "changelog" | "blog" | "x";
  tweet_id: string | null;
  published_at: string;
};

export async function getEntriesForAgent(slug: string, limit = 100): Promise<EntryRow[]> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type,
           tweet_id, published_at::text, ingested_at::text
    FROM entries
    WHERE agent_slug = ${slug}
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function getRecentEntries(hours = 24): Promise<EntryRow[]> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type,
           tweet_id, published_at::text, ingested_at::text
    FROM entries
    WHERE ingested_at > now() - (${`${hours} hours`})::interval
    ORDER BY published_at DESC
  `;
  return rows;
}

export async function getLatestEntryForAgent(slug: string): Promise<EntryRow | null> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type,
           tweet_id, published_at::text, ingested_at::text
    FROM entries
    WHERE agent_slug = ${slug}
    ORDER BY published_at DESC
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getWatermark(slug: string): Promise<string | null> {
  const { rows } = await sql<{ watermark: string | null }>`
    SELECT MAX(published_at)::text AS watermark
    FROM entries
    WHERE agent_slug = ${slug}
  `;
  return rows[0]?.watermark ?? null;
}

export async function insertEntries(entries: NewEntry[]): Promise<number> {
  if (entries.length === 0) return 0;
  let inserted = 0;
  for (const e of entries) {
    const { rowCount } = await sql`
      INSERT INTO entries
        (agent_slug, title, summary, source_url, source_type, tweet_id, published_at)
      VALUES
        (${e.agent_slug}, ${e.title}, ${e.summary}, ${e.source_url},
         ${e.source_type}, ${e.tweet_id}, ${e.published_at})
      ON CONFLICT (source_url) DO NOTHING
    `;
    inserted += rowCount ?? 0;
  }
  return inserted;
}

export async function getLastIngestedAt(): Promise<string | null> {
  const { rows } = await sql<{ ts: string | null }>`
    SELECT MAX(ingested_at)::text AS ts FROM entries
  `;
  return rows[0]?.ts ?? null;
}
