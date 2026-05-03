import { sql } from "@vercel/postgres";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AGENTS } from "../content/agents";

async function main() {
  const schemaPath = resolve(process.cwd(), "lib/schema.sql");
  const schema = readFileSync(schemaPath, "utf-8");

  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await sql.query(stmt);
  }
  console.log(`Schema applied (${statements.length} statements).`);

  for (const a of AGENTS) {
    const firstChangelog = a.sources.find((s) => s.type === "changelog")?.url ?? null;
    const firstX = a.sources.find((s) => s.type === "x");
    const xHandle = firstX ? firstX.url.replace(/^https?:\/\/x\.com\//, "") : null;

    await sql`
      INSERT INTO agents (slug, name, status, official_url, x_handle, changelog_url, blurb)
      VALUES (${a.slug}, ${a.name}, ${a.status}, ${a.officialUrl}, ${xHandle},
              ${firstChangelog}, ${a.blurb})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        official_url = EXCLUDED.official_url,
        x_handle = EXCLUDED.x_handle,
        changelog_url = EXCLUDED.changelog_url,
        blurb = EXCLUDED.blurb
    `;
  }
  console.log(`Upserted ${AGENTS.length} agents.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
