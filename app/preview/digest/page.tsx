import { render } from "@react-email/components";
import { notFound } from "next/navigation";
import WeeklyDigest from "@/emails/WeeklyDigest";
import { getDigestIssue } from "@/lib/db";
import { getCurrentWeekKey, getIssueNumbers } from "@/lib/issue";

export const dynamic = "force-dynamic";

export default async function DigestPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const params = await searchParams;
  const weekKey = params.week ?? getCurrentWeekKey();
  const row = await getDigestIssue(weekKey);

  if (!row) {
    return (
      <div style={{ padding: 32, fontFamily: "ui-monospace, monospace", color: "#e5e7eb", background: "#1a1a1a", minHeight: "100vh" }}>
        No draft for week {weekKey}. Trigger one with{" "}
        <code>curl -H "Authorization: Bearer $CRON_SECRET" "http://localhost:3000/api/cron/weekly-preview?week={weekKey}"</code>
      </div>
    );
  }

  const issue = row.content;
  const { vol, issue: issueNum } = getIssueNumbers(issue.weekKey);

  const html = await render(
    WeeklyDigest({
      issue,
      unsubscribeUrl: "#preview",
    }),
  );

  return (
    <div
      style={{
        background: "#1a1a1a",
        minHeight: "100vh",
        padding: "16px",
        fontFamily: "ui-monospace, monospace",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto 12px",
          color: "#9ca3af",
          fontSize: 12,
        }}
      >
        digest preview · Vol {vol} · Issue {issueNum} · {issue.weekRangeLabel} ·{" "}
        model={row.model_used ?? "—"} · dev only
      </div>
      <iframe
        srcDoc={html}
        style={{
          width: "100%",
          maxWidth: 720,
          height: "calc(100vh - 60px)",
          margin: "0 auto",
          display: "block",
          border: "1px solid #1f2937",
          borderRadius: 8,
          background: "#fbfbfb",
        }}
      />
    </div>
  );
}
