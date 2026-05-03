import { NextResponse } from "next/server";
import { runDailyIngestion } from "@/lib/ingest";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get("force") === "true";
  const startedAt = new Date().toISOString();
  const results = await runDailyIngestion({ force });
  const finishedAt = new Date().toISOString();

  // Detect missing-column / missing-table errors and surface a clear hint.
  const schemaErrors = results
    .flatMap((r) => r.sources)
    .filter((s) =>
      s.error &&
      (/column .* does not exist/i.test(s.error) ||
        /relation .* does not exist/i.test(s.error))
    );
  const hint =
    schemaErrors.length > 0
      ? "Schema migration pending. Run `pnpm seed` to apply the latest schema, then retry."
      : undefined;

  return NextResponse.json({ startedAt, finishedAt, force, hint, results });
}
