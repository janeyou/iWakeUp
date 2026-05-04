import { sql } from "@vercel/postgres";

export type EntryType = "release" | "news" | "post";

export type EntryRow = {
  id: number;
  agent_slug: string;
  title: string;
  summary: string | null;
  source_url: string;
  source_type: "changelog" | "blog" | "x";
  entry_type: EntryType;
  tweet_id: string | null;
  video_url: string | null;
  published_at: string;
  ingested_at: string;
};

export type NewEntry = {
  agent_slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_type: "changelog" | "blog" | "x";
  entry_type: EntryType;
  tweet_id: string | null;
  video_url: string | null;
  published_at: string;
  /** LLM verdict, X tweets only for now. 1-3 = signal kept, null otherwise. */
  quality_score?: number | null;
  /** One-sentence audit reason from the LLM filter. */
  quality_reason?: string | null;
};

export async function getEntriesForAgent(
  slug: string,
  opts: { limit?: number; entryType?: EntryType } = {}
): Promise<EntryRow[]> {
  const limit = opts.limit ?? 100;
  if (opts.entryType) {
    const { rows } = await sql<EntryRow>`
      SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
             tweet_id, published_at::text, ingested_at::text
      FROM entries
      WHERE agent_slug = ${slug} AND entry_type = ${opts.entryType}
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return rows;
  }
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
           tweet_id, video_url, published_at::text, ingested_at::text
    FROM entries
    WHERE agent_slug = ${slug}
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

export type ActivityDay = {
  date: string;
  total: number;
  releases: number;
  news: number;
  posts: number;
};

export async function getActivityByDay(
  slug: string,
  days: number = 182
): Promise<ActivityDay[]> {
  const { rows } = await sql<ActivityDay>`
    SELECT
      to_char((published_at AT TIME ZONE 'America/Los_Angeles')::date, 'YYYY-MM-DD') AS date,
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE entry_type = 'release')::int AS releases,
      COUNT(*) FILTER (WHERE entry_type = 'news')::int AS news,
      COUNT(*) FILTER (WHERE entry_type = 'post')::int AS posts
    FROM entries
    WHERE agent_slug = ${slug}
      AND published_at > now() - (${`${days} days`})::interval
    GROUP BY date
    ORDER BY date DESC
  `;
  return rows;
}

export type AgentDayActivity = {
  date: string;
  agent_slug: string;
  count: number;
};

export async function getDailyActivityByAgent(
  days: number = 182
): Promise<AgentDayActivity[]> {
  const { rows } = await sql<AgentDayActivity>`
    SELECT
      to_char((published_at AT TIME ZONE 'America/Los_Angeles')::date, 'YYYY-MM-DD') AS date,
      agent_slug,
      COUNT(*)::int AS count
    FROM entries
    WHERE published_at > now() - (${`${days} days`})::interval
    GROUP BY date, agent_slug
    ORDER BY date DESC, agent_slug
  `;
  return rows;
}

export async function getEntryTypeCounts(slug: string): Promise<Record<EntryType, number>> {
  const { rows } = await sql<{ entry_type: EntryType; count: string }>`
    SELECT entry_type, COUNT(*)::text AS count
    FROM entries
    WHERE agent_slug = ${slug}
    GROUP BY entry_type
  `;
  const out: Record<EntryType, number> = { release: 0, news: 0, post: 0 };
  for (const r of rows) out[r.entry_type] = Number(r.count);
  return out;
}

export async function getAllEntries(opts: {
  entryType?: EntryType;
  before?: string;
  limit?: number;
  agentSlug?: string;
  dateOnly?: string;
} = {}): Promise<EntryRow[]> {
  const limit = opts.limit ?? 100;
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (opts.entryType) {
    params.push(opts.entryType);
    where.push(`entry_type = $${params.length}`);
  }
  if (opts.before) {
    params.push(opts.before);
    where.push(`published_at < $${params.length}`);
  }
  if (opts.agentSlug) {
    params.push(opts.agentSlug);
    where.push(`agent_slug = $${params.length}`);
  }
  if (opts.dateOnly) {
    params.push(opts.dateOnly);
    where.push(
      `(published_at AT TIME ZONE 'America/Los_Angeles')::date = $${params.length}::date`
    );
  }

  const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  params.push(limit);

  const text = `
    SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
           tweet_id, video_url, published_at::text, ingested_at::text
    FROM entries
    ${whereClause}
    ORDER BY published_at DESC
    LIMIT $${params.length}
  `;

  const { rows } = await sql.query<EntryRow>(text, params);
  return rows;
}

export async function getAllEntryTypeCounts(
  agentSlug?: string
): Promise<Record<EntryType, number>> {
  const out: Record<EntryType, number> = { release: 0, news: 0, post: 0 };
  if (agentSlug) {
    const { rows } = await sql<{ entry_type: EntryType; count: string }>`
      SELECT entry_type, COUNT(*)::text AS count
      FROM entries
      WHERE agent_slug = ${agentSlug}
      GROUP BY entry_type
    `;
    for (const r of rows) out[r.entry_type] = Number(r.count);
    return out;
  }
  const { rows } = await sql<{ entry_type: EntryType; count: string }>`
    SELECT entry_type, COUNT(*)::text AS count
    FROM entries
    GROUP BY entry_type
  `;
  for (const r of rows) out[r.entry_type] = Number(r.count);
  return out;
}

export async function getRecentEntries(hours = 24): Promise<EntryRow[]> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
           tweet_id, video_url, published_at::text, ingested_at::text
    FROM entries
    WHERE ingested_at > now() - (${`${hours} hours`})::interval
    ORDER BY published_at DESC
  `;
  return rows;
}

export async function getLatestEntries(limit = 5): Promise<EntryRow[]> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
           tweet_id, video_url, published_at::text, ingested_at::text
    FROM entries
    ORDER BY published_at DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function getLatestEntryForAgent(slug: string): Promise<EntryRow | null> {
  const { rows } = await sql<EntryRow>`
    SELECT id, agent_slug, title, summary, source_url, source_type, entry_type,
           tweet_id, video_url, published_at::text, ingested_at::text
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
        (agent_slug, title, summary, source_url, source_type, entry_type,
         tweet_id, video_url, published_at, quality_score, quality_reason)
      VALUES
        (${e.agent_slug}, ${e.title}, ${e.summary}, ${e.source_url},
         ${e.source_type}, ${e.entry_type}, ${e.tweet_id}, ${e.video_url},
         ${e.published_at}, ${e.quality_score ?? null}, ${e.quality_reason ?? null})
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

export type SourceStateRow = {
  url: string;
  agent_slug: string;
  source_type: "changelog" | "blog" | "x";
  last_fetched_at: string;
  content_hash: string | null;
  last_status: number | null;
  last_entry_count: number;
  last_error: string | null;
  x_user_id: string | null;
};

export type NewSourceState = {
  url: string;
  agent_slug: string;
  source_type: "changelog" | "blog" | "x";
  content_hash: string | null;
  last_status: number | null;
  last_entry_count: number;
  last_error: string | null;
};

export async function getSourceState(url: string): Promise<SourceStateRow | null> {
  const { rows } = await sql<SourceStateRow>`
    SELECT url, agent_slug, source_type,
           last_fetched_at::text, content_hash, last_status,
           last_entry_count, last_error, x_user_id
    FROM source_state
    WHERE url = ${url}
  `;
  return rows[0] ?? null;
}

export async function getAllSourceStates(): Promise<SourceStateRow[]> {
  const { rows } = await sql<SourceStateRow>`
    SELECT url, agent_slug, source_type,
           last_fetched_at::text, content_hash, last_status,
           last_entry_count, last_error, x_user_id
    FROM source_state
    ORDER BY agent_slug, source_type, url
  `;
  return rows;
}

export async function getEntryCountsByAgent(): Promise<Array<{ agent_slug: string; count: number }>> {
  const { rows } = await sql<{ agent_slug: string; count: string }>`
    SELECT agent_slug, COUNT(*)::text AS count
    FROM entries
    GROUP BY agent_slug
    ORDER BY agent_slug
  `;
  return rows.map((r) => ({ agent_slug: r.agent_slug, count: Number(r.count) }));
}

export async function getSubscriberStats(): Promise<{
  total: number;
  confirmed: number;
  unsubscribed: number;
}> {
  const { rows } = await sql<{
    total: string;
    confirmed: string;
    unsubscribed: string;
  }>`
    SELECT
      COUNT(*)::text AS total,
      COUNT(*) FILTER (WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL)::text AS confirmed,
      COUNT(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::text AS unsubscribed
    FROM subscribers
  `;
  const r = rows[0];
  return {
    total: r ? Number(r.total) : 0,
    confirmed: r ? Number(r.confirmed) : 0,
    unsubscribed: r ? Number(r.unsubscribed) : 0,
  };
}

export async function setSourceXUserId(url: string, userId: string): Promise<void> {
  await sql`
    UPDATE source_state
    SET x_user_id = ${userId}
    WHERE url = ${url}
  `;
}

export type SubscriberRow = {
  email: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  confirm_token: string;
  unsubscribe_token: string;
  source: string | null;
  created_at: string;
};

export async function addSubscriber(args: {
  email: string;
  confirmToken: string;
  unsubscribeToken: string;
  source?: string;
}): Promise<{ existed: boolean; row: SubscriberRow }> {
  const { rows } = await sql<SubscriberRow>`
    INSERT INTO subscribers (email, confirm_token, unsubscribe_token, source)
    VALUES (${args.email}, ${args.confirmToken}, ${args.unsubscribeToken}, ${args.source ?? null})
    ON CONFLICT (email) DO UPDATE SET
      unsubscribed_at = NULL,
      confirm_token = CASE WHEN subscribers.confirmed_at IS NULL THEN EXCLUDED.confirm_token ELSE subscribers.confirm_token END
    RETURNING email, confirmed_at::text, unsubscribed_at::text,
              confirm_token, unsubscribe_token, source, created_at::text
  `;
  return { existed: rows[0].confirmed_at !== null, row: rows[0] };
}

export async function confirmSubscriber(token: string): Promise<SubscriberRow | null> {
  const { rows } = await sql<SubscriberRow>`
    UPDATE subscribers
    SET confirmed_at = COALESCE(confirmed_at, now())
    WHERE confirm_token = ${token}
    RETURNING email, confirmed_at::text, unsubscribed_at::text,
              confirm_token, unsubscribe_token, source, created_at::text
  `;
  return rows[0] ?? null;
}

export async function unsubscribeSubscriber(token: string): Promise<SubscriberRow | null> {
  const { rows } = await sql<SubscriberRow>`
    UPDATE subscribers
    SET unsubscribed_at = COALESCE(unsubscribed_at, now())
    WHERE unsubscribe_token = ${token}
    RETURNING email, confirmed_at::text, unsubscribed_at::text,
              confirm_token, unsubscribe_token, source, created_at::text
  `;
  return rows[0] ?? null;
}

export async function getActiveSubscribers(): Promise<SubscriberRow[]> {
  const { rows } = await sql<SubscriberRow>`
    SELECT email, confirmed_at::text, unsubscribed_at::text,
           confirm_token, unsubscribe_token, source, created_at::text
    FROM subscribers
    WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
    ORDER BY confirmed_at DESC
  `;
  return rows;
}

export async function insertToolSuggestion(s: {
  toolName: string;
  sourceUrl: string | null;
  xHandle: string | null;
  note: string | null;
  contactEmail: string | null;
}): Promise<number> {
  const { rows } = await sql<{ id: number }>`
    INSERT INTO tool_suggestions (tool_name, source_url, x_handle, note, contact_email)
    VALUES (${s.toolName}, ${s.sourceUrl}, ${s.xHandle}, ${s.note}, ${s.contactEmail})
    RETURNING id
  `;
  return rows[0].id;
}

export async function upsertSourceState(s: NewSourceState): Promise<void> {
  await sql`
    INSERT INTO source_state
      (url, agent_slug, source_type, last_fetched_at, content_hash,
       last_status, last_entry_count, last_error)
    VALUES
      (${s.url}, ${s.agent_slug}, ${s.source_type}, now(), ${s.content_hash},
       ${s.last_status}, ${s.last_entry_count}, ${s.last_error})
    ON CONFLICT (url) DO UPDATE SET
      last_fetched_at = EXCLUDED.last_fetched_at,
      content_hash = EXCLUDED.content_hash,
      last_status = EXCLUDED.last_status,
      last_entry_count = EXCLUDED.last_entry_count,
      last_error = EXCLUDED.last_error
  `;
}
