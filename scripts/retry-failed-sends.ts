import { getDigestIssue } from "@/lib/db";
import { sendDigestEmail } from "@/lib/email";
import { sql } from "@vercel/postgres";

const RECIPIENTS = process.argv.slice(2);

async function main() {
  if (RECIPIENTS.length === 0) {
    console.error("Usage: tsx scripts/retry-failed-sends.ts <email> [email...]");
    process.exit(1);
  }
  const row = await getDigestIssue("2026-05-17");
  if (!row) throw new Error("Issue 2026-05-17 not found in DB");

  for (const email of RECIPIENTS) {
    const { rows } = await sql<{ unsubscribe_token: string }>`
      SELECT unsubscribe_token FROM subscribers
      WHERE email = ${email} AND confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
    `;
    const token = rows[0]?.unsubscribe_token;
    if (!token) {
      console.log(`[skip] ${email}: not an active subscriber`);
      continue;
    }
    try {
      const result = await sendDigestEmail({
        to: email,
        unsubscribeToken: token,
        issue: row.content,
      });
      console.log(`[ok] ${email}: dryRun=${result.dryRun}`);
    } catch (err) {
      console.error(`[fail] ${email}:`, err);
    }
    // Small delay between sends to dodge any burst rate limits
    await new Promise((r) => setTimeout(r, 500));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
