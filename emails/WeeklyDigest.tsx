import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { EntryRow } from "@/lib/db";

export type WeeklyDigestProps = {
  entries: EntryRow[];
  agentNameBySlug: Record<string, string>;
  weekLabel: string;
  unsubscribeUrl: string;
};

export default function WeeklyDigest({
  entries,
  agentNameBySlug,
  weekLabel,
  unsubscribeUrl,
}: WeeklyDigestProps) {
  const grouped = new Map<string, EntryRow[]>();
  for (const e of entries) {
    const arr = grouped.get(e.agent_slug) ?? [];
    arr.push(e);
    grouped.set(e.agent_slug, arr);
  }

  return (
    <Html>
      <Head />
      <Preview>{`What the AI agents shipped this week, ${weekLabel}`}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>AI Radar</Heading>
          <Text style={muted}>{`Week of ${weekLabel}`}</Text>

          {entries.length === 0 ? (
            <Section style={section}>
              <Text style={text}>
                Quiet week. Nothing major shipped from the tracked tools in the
                last 7 days. The world is allowed a breather sometimes.
              </Text>
            </Section>
          ) : (
            Array.from(grouped.entries()).map(([slug, items]) => (
              <Section key={slug} style={section}>
                <Heading as="h2" style={h2}>
                  {agentNameBySlug[slug] ?? slug}
                </Heading>
                {items.map((entry) => (
                  <div key={entry.id} style={entryWrap}>
                    <Text style={entryHeader}>
                      <span style={{ color: typeColor(entry.entry_type) }}>
                        {entry.entry_type.toUpperCase()}
                      </span>{" "}
                      ·{" "}
                      <span style={{ color: "#9ca3af" }}>
                        {formatDate(entry.published_at)}
                      </span>
                    </Text>
                    <Link href={entry.source_url} style={entryLink}>
                      {entry.title}
                    </Link>
                    {entry.summary && (
                      <Text style={entrySummary}>{entry.summary}</Text>
                    )}
                  </div>
                ))}
              </Section>
            ))
          )}

          <Hr style={hr} />
          <Text style={footer}>
            <Link href="https://airadarapp.com" style={footerLink}>
              airadarapp.com
            </Link>{" "}
            ·{" "}
            <Link href={unsubscribeUrl} style={footerLink}>
              unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
  });
}

function typeColor(t: EntryRow["entry_type"]): string {
  if (t === "release") return "#a78bfa";
  if (t === "news") return "#fbbf24";
  return "#60a5fa";
}

const body: React.CSSProperties = {
  backgroundColor: "#0e1014",
  color: "#f5f5f5",
  fontFamily: "Inter, system-ui, sans-serif",
  margin: 0,
  padding: 0,
};
const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "640px",
  padding: "32px 24px",
};
const h1: React.CSSProperties = {
  margin: 0,
  fontSize: "28px",
  fontWeight: 600,
  letterSpacing: "-0.02em",
};
const h2: React.CSSProperties = {
  margin: "0 0 16px 0",
  fontSize: "18px",
  fontWeight: 600,
  color: "#e5e7eb",
};
const muted: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: "13px",
  color: "#9ca3af",
  fontFamily: "ui-monospace, monospace",
};
const section: React.CSSProperties = {
  marginTop: "32px",
  paddingTop: "24px",
  borderTop: "1px solid #1f2937",
};
const text: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#e5e7eb",
};
const entryWrap: React.CSSProperties = {
  marginBottom: "20px",
};
const entryHeader: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  fontFamily: "ui-monospace, monospace",
  letterSpacing: "0.04em",
};
const entryLink: React.CSSProperties = {
  display: "block",
  marginTop: "4px",
  fontSize: "16px",
  fontWeight: 500,
  color: "#f5f5f5",
  textDecoration: "none",
  lineHeight: "1.4",
};
const entrySummary: React.CSSProperties = {
  margin: "6px 0 0 0",
  fontSize: "14px",
  color: "#9ca3af",
  lineHeight: "1.5",
};
const hr: React.CSSProperties = {
  borderColor: "#1f2937",
  margin: "40px 0 24px 0",
};
const footer: React.CSSProperties = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center",
};
const footerLink: React.CSSProperties = {
  color: "#9ca3af",
  textDecoration: "underline",
};
