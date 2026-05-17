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
import type { DigestIssue, DigestTheme, DigestEntry } from "@/lib/digest-content";
import { getIssueNumbers } from "@/lib/issue";

export type WeeklyDigestProps = {
  issue: DigestIssue;
  unsubscribeUrl: string;
  approveUrl?: string;
};

const COLOR = {
  bg: "#fbfbfb",
  surface: "#ffffff",
  surface2: "#f7f7f6",
  border: "#e7e5e1",
  borderStrong: "#d0cdc6",
  text: "#1a1a1a",
  textMuted: "#6b6b6b",
  textFaint: "#9a9a98",
  accent: "#7c5fb8",
  accentSoft: "rgba(124,95,184,0.12)",
  codex: "#3e8c7b",
  codexSoft: "rgba(62,140,123,0.12)",
  claude: "#c08555",
  claudeSoft: "rgba(192,133,85,0.12)",
  cursor: "#373b42",
  cursorSoft: "rgba(55,59,66,0.10)",
};

const FONT_SANS = "'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif";
const FONT_MONO =
  "'Geist Mono', ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace";

// Stacks side-by-side <td> cells, shrinks headline + body type, tightens container
// padding when the client viewport falls below 600px. Apple Mail / Gmail iOS / Gmail
// web all honor these queries.
const MOBILE_CSS = `
@media only screen and (max-width: 600px) {
  .m-container { padding: 24px 16px !important; }
  .m-stack > tbody > tr > td,
  .m-stack > tr > td {
    display: block !important;
    width: 100% !important;
    text-align: left !important;
    padding: 4px 0 !important;
    white-space: normal !important;
  }
  .m-headline { font-size: 28px !important; line-height: 1.1 !important; }
  .m-digest-h2 { font-size: 22px !important; }
  .m-section-big { font-size: 32px !important; }
  .m-stat-val { font-size: 18px !important; }
  .m-stat-label { font-size: 8px !important; }
  .m-deck { font-size: 13px !important; padding-right: 0 !important; }
  .m-entry-pad { padding: 8px 12px !important; }
  .m-hide-mobile { display: none !important; }
  .m-hub { padding: 16px 20px 14px !important; }
  .m-issue-meta { font-size: 9px !important; letter-spacing: 0.08em !important; padding-top: 6px !important; }
}
`;

const agentColor = (a: DigestEntry["agent"]) =>
  a === "codex" ? COLOR.codex : a === "claude" ? COLOR.claude : COLOR.cursor;
const agentSoft = (a: DigestEntry["agent"]) =>
  a === "codex"
    ? COLOR.codexSoft
    : a === "claude"
    ? COLOR.claudeSoft
    : COLOR.cursorSoft;
const agentName = (a: DigestEntry["agent"]) =>
  a === "codex" ? "Codex" : a === "claude" ? "Claude" : "Cursor";

export default function WeeklyDigest({
  issue,
  unsubscribeUrl,
  approveUrl,
}: WeeklyDigestProps) {
  const { vol, issue: issueNum } = getIssueNumbers(issue.weekKey);

  return (
    <Html>
      <Head>
        <style>{MOBILE_CSS}</style>
      </Head>
      <Preview>{`AI Radar · Vol ${vol} Issue ${issueNum} · ${issue.weekRangeLabel}`}</Preview>
      <Body style={body}>
        <Container style={container} className="m-container">
          {approveUrl && (
            <Section style={approveBanner}>
              <Text style={approveNote}>
                Preview · subscribers will receive this Sunday 6am PT.
              </Text>
              <Link href={approveUrl} style={approveCta}>
                Approve and send →
              </Link>
            </Section>
          )}

          <Topbar vol={vol} issueNum={issueNum} sendDayLabel={issue.sendDayLabel} />
          <Masthead issue={issue} />
          <Hub issue={issue} />
          <ThemeCards themes={issue.themes} />

          <FullDigestIntro right={issue.fullDigestRight} />
          {issue.themes.map((t) => (
            <DigestSection key={t.slug} theme={t} />
          ))}

          <Footer issue={issue} unsubscribeUrl={unsubscribeUrl} />
        </Container>
      </Body>
    </Html>
  );
}

function Topbar({
  vol,
  issueNum,
  sendDayLabel,
}: {
  vol: string;
  issueNum: string;
  sendDayLabel: string;
}) {
  return (
    <Section style={topbar}>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        className="m-stack"
      >
        <tr>
          <td style={{ verticalAlign: "middle" }}>
            <Text style={wordmark}>
              <span style={pulseDot}>●</span>
              &nbsp;&nbsp;AI&nbsp;RADAR&nbsp;
              <span style={beta}>BETA</span>
            </Text>
          </td>
          <td style={{ verticalAlign: "middle", textAlign: "right" }}>
            <Text style={issueMeta} className="m-issue-meta">
              Vol {vol}
              <span style={sep}>·</span>Issue {issueNum}
              <span style={sep}>·</span>
              {sendDayLabel}
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}

function Masthead({ issue }: { issue: DigestIssue }) {
  return (
    <Section style={masthead}>
      <Text style={kicker}>
        <span style={{ color: COLOR.accent }}>●</span>
        &nbsp;&nbsp;LIVE INGEST {issue.ingestTimeLabel}
        <span style={kickerSep}>·</span>
        {issue.weekRangeLabel.toUpperCase()}
      </Text>
      <Heading as="h1" style={headline} className="m-headline">
        {issue.headlinePre}
        <em style={headlineEm}>{issue.headlineAccent}</em>
        {issue.headlinePost}
      </Heading>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        className="m-stack"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td style={{ verticalAlign: "bottom", paddingRight: "16px" }}>
            <Text style={deck} className="m-deck">{issue.deck}</Text>
          </td>
          <td
            style={{
              verticalAlign: "bottom",
              textAlign: "right",
              whiteSpace: "nowrap",
            }}
          >
            <Text style={statBlock}>
              <span style={statVal}>{issue.stats.drops}</span>
              <span style={statLabel}>&nbsp;&nbsp;DROPS&nbsp;&nbsp;&nbsp;</span>
              <span style={statVal}>{issue.stats.tools}</span>
              <span style={statLabel}>&nbsp;&nbsp;TOOLS&nbsp;&nbsp;&nbsp;</span>
              <span style={statVal}>{issue.stats.themes}</span>
              <span style={statLabel}>&nbsp;&nbsp;THEMES</span>
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}

function Hub({ issue }: { issue: DigestIssue }) {
  return (
    <Section style={hubWrap}>
      <table
        align="center"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={hub}
      >
        <tr>
          <td>
            <pre style={ascii}>{`  ↺   ░▒▓▒░   ↻
   /\\_/\\
  ( ◕ω◕ )
   > ^ <
i just wake up`}</pre>
            <Heading as="h2" style={hubH2}>
              {issue.hubH2}
            </Heading>
            <Text style={hubSub}>{issue.hubSub}</Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}

function ThemeCards({ themes }: { themes: DigestTheme[] }) {
  return (
    <Section style={{ marginTop: "24px" }}>
      {themes.map((t) => (
        <table
          key={t.slug}
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          role="presentation"
          style={themeCard}
        >
          <tr>
            <td>
              <table
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
              >
                <tr>
                  <td style={{ verticalAlign: "baseline" }}>
                    <Text style={themeHead}>
                      <span style={themeNum}>{t.num}</span>
                      <span style={themeLabel}>
                        &nbsp;&nbsp;{t.label.toUpperCase()}
                      </span>
                    </Text>
                  </td>
                  <td
                    style={{ verticalAlign: "baseline", textAlign: "right" }}
                  >
                    <Text style={themeCount}>{t.count}</Text>
                  </td>
                </tr>
              </table>
              <Heading as="h3" style={themeH3}>
                {t.headline}
              </Heading>
              <Text style={themeLede}>{t.lede}</Text>
              <Link href={`#${t.slug}`} style={jumpLink}>
                READ DROPS ↓
              </Link>
            </td>
          </tr>
        </table>
      ))}
    </Section>
  );
}

function FullDigestIntro({ right }: { right: string[] }) {
  return (
    <Section style={digestIntro}>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        className="m-stack"
      >
        <tr>
          <td style={{ verticalAlign: "bottom" }}>
            <Text style={digestIntroLabel}>THE FULL DIGEST, WITH SOURCES</Text>
            <Heading as="h2" style={digestIntroH2} className="m-digest-h2">
              Every drop, <em style={headlineEm}>themed and linked</em>.
            </Heading>
          </td>
          <td
            style={{
              verticalAlign: "bottom",
              textAlign: "right",
              whiteSpace: "nowrap",
            }}
          >
            <Text style={digestIntroRight}>
              {right.map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </Text>
          </td>
        </tr>
      </table>
    </Section>
  );
}

function DigestSection({ theme }: { theme: DigestTheme }) {
  return (
    <Section id={theme.slug} style={digestSection}>
      <Text style={digestSectionStrip}>
        <span style={digestSectionBig} className="m-section-big">
          {theme.num}
        </span>
        &nbsp;&nbsp;{theme.label.toUpperCase()}
        <span style={digestSectionCount}>
          &nbsp;&nbsp;·&nbsp;&nbsp;{theme.count} DROPS
        </span>
      </Text>
      <Heading as="h2" style={digestSectionH2} className="m-digest-h2">
        {theme.headline}
      </Heading>
      <Text style={digestSectionLede}>{theme.lede}</Text>
      <Section style={{ marginTop: "10px" }}>
        {theme.entries.map((e, i) => (
          <EntryRow key={i} entry={e} />
        ))}
      </Section>
    </Section>
  );
}

function EntryRow({ entry }: { entry: DigestEntry }) {
  return (
    <Link href={entry.url} style={{ textDecoration: "none" }}>
      <table
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        role="presentation"
        style={{
          ...entryWrap,
          borderLeft: `3px solid ${agentColor(entry.agent)}`,
        }}
      >
        <tr>
          <td
            style={{ verticalAlign: "middle", padding: "10px 14px" }}
            className="m-entry-pad"
          >
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
            >
              <tr>
                <td style={{ verticalAlign: "middle", width: "72px" }}>
                  <span
                    style={{
                      ...tag,
                      color: agentColor(entry.agent),
                      backgroundColor: agentSoft(entry.agent),
                    }}
                  >
                    {agentName(entry.agent).toUpperCase()}
                  </span>
                </td>
                <td style={{ verticalAlign: "middle", padding: "0 12px" }}>
                  <Text style={entryTitle}>{entry.title}</Text>
                </td>
                <td
                  className="m-hide-mobile"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "right",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Text style={entryTime}>{entry.time.toUpperCase()}</Text>
                </td>
                <td
                  style={{
                    verticalAlign: "middle",
                    paddingLeft: "10px",
                    color: COLOR.textFaint,
                  }}
                >
                  →
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </Link>
  );
}

function Footer({
  issue,
  unsubscribeUrl,
}: {
  issue: DigestIssue;
  unsubscribeUrl: string;
}) {
  return (
    <Section style={footerWrap}>
      <Text style={footerPunch}>
        {issue.footerPunchPre}
        <em style={headlineEm}>{issue.footerPunchAccent}</em>
        {issue.footerPunchPost}
      </Text>
      <Text style={footerLegend}>
        TOOLS TRACKED&nbsp;&nbsp;&nbsp;
        {issue.toolsTracked.map((t, i) => (
          <span key={t.agent}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: agentColor(t.agent),
                marginRight: "6px",
                verticalAlign: "middle",
              }}
            />
            {agentName(t.agent).toUpperCase()}&nbsp;·&nbsp;{t.count}
            {i < issue.toolsTracked.length - 1 ? "   " : ""}
          </span>
        ))}
      </Text>
      <Hr style={hr} />
      <Text style={footerBuilt}>{issue.builtByLine}</Text>
      <Text style={footerLinks}>
        <Link
          href={`https://airadarapp.com/issues/${issue.weekKey}`}
          style={footerLink}
        >
          read in browser
        </Link>
        &nbsp;·&nbsp;
        <Link href="https://airadarapp.com" style={footerLink}>
          airadarapp.com
        </Link>
        &nbsp;·&nbsp;
        <Link href={unsubscribeUrl} style={footerLink}>
          unsubscribe
        </Link>
      </Text>
    </Section>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: COLOR.bg,
  color: COLOR.text,
  fontFamily: FONT_SANS,
  fontWeight: 300,
  margin: 0,
  padding: 0,
};
const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "680px",
  padding: "32px 28px 24px",
  backgroundColor: COLOR.surface,
  border: `1px solid ${COLOR.border}`,
  borderRadius: "12px",
};
const topbar: React.CSSProperties = {
  paddingBottom: "14px",
  borderBottom: `1px solid ${COLOR.border}`,
};
const wordmark: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "11px",
  fontWeight: 400,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.text,
};
const pulseDot: React.CSSProperties = {
  color: COLOR.accent,
};
const beta: React.CSSProperties = {
  color: COLOR.textFaint,
  letterSpacing: "0.14em",
};
const issueMeta: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  color: COLOR.textMuted,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};
const sep: React.CSSProperties = {
  color: COLOR.borderStrong,
  padding: "0 6px",
};
const masthead: React.CSSProperties = {
  padding: "28px 0 24px",
  borderBottom: `1px solid ${COLOR.border}`,
};
const kicker: React.CSSProperties = {
  margin: "0 0 18px 0",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  fontWeight: 400,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.textMuted,
};
const kickerSep: React.CSSProperties = {
  color: COLOR.borderStrong,
  padding: "0 8px",
};
const headline: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "36px",
  lineHeight: 1.05,
  letterSpacing: "-0.025em",
  margin: 0,
  color: COLOR.text,
};
const headlineEm: React.CSSProperties = {
  fontStyle: "italic",
  color: COLOR.accent,
  fontWeight: 400,
};
const deck: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: COLOR.textMuted,
  lineHeight: 1.5,
};
const statBlock: React.CSSProperties = {
  margin: 0,
  lineHeight: 1.2,
};
const statVal: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 300,
  fontSize: "22px",
  color: COLOR.text,
  letterSpacing: "-0.02em",
};
const statLabel: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "9px",
  color: COLOR.textFaint,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};
const hubWrap: React.CSSProperties = {
  margin: "28px 0 0 0",
  textAlign: "center",
};
const hub: React.CSSProperties = {
  display: "inline-table",
  width: "auto",
  margin: "0 auto",
  padding: "20px 28px 16px",
  backgroundColor: COLOR.surface2,
  border: `1px solid ${COLOR.border}`,
  borderRadius: "12px",
  textAlign: "center",
};
const ascii: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "12px",
  lineHeight: 1.3,
  color: COLOR.textMuted,
  margin: "0 0 12px 0",
  whiteSpace: "pre",
  textAlign: "center",
};
const hubH2: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: 1.15,
  letterSpacing: "-0.02em",
  margin: 0,
  color: COLOR.text,
};
const hubSub: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.textFaint,
  margin: "10px 0 0 0",
  paddingTop: "10px",
  borderTop: `1px solid ${COLOR.border}`,
};
const themeCard: React.CSSProperties = {
  marginTop: "12px",
  padding: "16px 18px 14px",
  backgroundColor: COLOR.surface,
  border: `1px solid ${COLOR.border}`,
  borderRadius: "12px",
};
const themeHead: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.textMuted,
};
const themeNum: React.CSSProperties = {
  color: COLOR.textFaint,
};
const themeLabel: React.CSSProperties = {
  color: COLOR.text,
};
const themeCount: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  color: COLOR.textFaint,
};
const themeH3: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  margin: "10px 0 4px 0",
  color: COLOR.text,
};
const themeLede: React.CSSProperties = {
  fontSize: "13px",
  color: COLOR.textMuted,
  margin: "0 0 10px 0",
  lineHeight: 1.45,
};
const jumpLink: React.CSSProperties = {
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.16em",
  color: COLOR.textMuted,
  textDecoration: "none",
};
const digestIntro: React.CSSProperties = {
  marginTop: "40px",
  paddingTop: "24px",
  borderTop: `1px solid ${COLOR.border}`,
};
const digestIntroLabel: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.textMuted,
};
const digestIntroH2: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "26px",
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  margin: "8px 0 0 0",
  color: COLOR.text,
};
const digestIntroRight: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: COLOR.textFaint,
  lineHeight: 1.7,
};
const digestSection: React.CSSProperties = {
  paddingTop: "28px",
  paddingBottom: "28px",
  borderBottom: `1px solid ${COLOR.border}`,
};
const digestSectionStrip: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLOR.textMuted,
};
const digestSectionBig: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontSize: "40px",
  fontWeight: 300,
  color: COLOR.accent,
  letterSpacing: "-0.04em",
  verticalAlign: "middle",
};
const digestSectionCount: React.CSSProperties = {
  color: COLOR.textFaint,
};
const digestSectionH2: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "26px",
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  margin: "8px 0 8px 0",
  color: COLOR.text,
};
const digestSectionLede: React.CSSProperties = {
  fontSize: "13.5px",
  color: COLOR.textMuted,
  lineHeight: 1.55,
  margin: "0 0 8px 0",
};
const entryWrap: React.CSSProperties = {
  marginTop: "6px",
  backgroundColor: COLOR.surface,
  border: `1px solid ${COLOR.border}`,
  borderRadius: "8px",
};
const tag: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  borderRadius: "5px",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  fontWeight: 500,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
};
const entryTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "13.5px",
  lineHeight: 1.4,
  color: COLOR.text,
};
const entryTime: React.CSSProperties = {
  margin: 0,
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.14em",
  color: COLOR.textMuted,
  whiteSpace: "nowrap",
};
const footerWrap: React.CSSProperties = {
  marginTop: "24px",
  paddingTop: "20px",
  borderTop: `1px solid ${COLOR.border}`,
};
const footerPunch: React.CSSProperties = {
  fontFamily: FONT_SANS,
  fontWeight: 400,
  fontSize: "20px",
  letterSpacing: "-0.02em",
  color: COLOR.text,
  margin: "0 0 14px 0",
};
const footerLegend: React.CSSProperties = {
  margin: "0 0 12px 0",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: COLOR.textMuted,
};
const hr: React.CSSProperties = {
  borderColor: COLOR.border,
  margin: "12px 0",
};
const footerBuilt: React.CSSProperties = {
  margin: "0 0 6px 0",
  fontFamily: FONT_MONO,
  fontSize: "9px",
  letterSpacing: "0.1em",
  color: COLOR.textFaint,
};
const footerLinks: React.CSSProperties = {
  margin: 0,
  fontSize: "11px",
  color: COLOR.textFaint,
};
const footerLink: React.CSSProperties = {
  color: COLOR.textMuted,
  textDecoration: "underline",
};
const approveBanner: React.CSSProperties = {
  marginBottom: "20px",
  padding: "14px 16px",
  backgroundColor: COLOR.accentSoft,
  borderRadius: "8px",
  border: `1px solid ${COLOR.accent}`,
};
const approveNote: React.CSSProperties = {
  margin: "0 0 8px 0",
  fontSize: "12px",
  color: COLOR.textMuted,
  fontFamily: FONT_MONO,
  letterSpacing: "0.05em",
};
const approveCta: React.CSSProperties = {
  display: "inline-block",
  padding: "8px 14px",
  backgroundColor: COLOR.accent,
  color: "#ffffff",
  fontWeight: 500,
  fontSize: "12px",
  textDecoration: "none",
  borderRadius: "6px",
  fontFamily: FONT_MONO,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};
