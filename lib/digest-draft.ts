import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod/v4";
import { AGENTS } from "@/content/agents";
import { getRecentEntries, saveDigestIssue, type EntryRow } from "@/lib/db";
import type { DigestIssue, DigestTheme, DigestEntry } from "@/lib/digest-content";

const MODEL = "claude-opus-4-7";

const AgentSlug = z.enum(["codex", "claude", "cursor"]);

const ThemeEntrySchema = z.object({
  agent: AgentSlug,
  title: z
    .string()
    .describe(
      "Editorial single-line summary of what shipped. Past tense, ends with a period. No emoji.",
    ),
  source_url: z.string().describe("Exact source_url copied from the input entry."),
  time: z
    .string()
    .describe(
      "Short pill like 'Mon · 13:50 PT' for tweets or 'Wed · Engineering' for blog posts. " +
        "Use weekday + HH:MM PT if a publish time exists; otherwise weekday + a one-word tag.",
    ),
});

const ThemeSchema = z.object({
  slug: z
    .string()
    .describe("kebab-case slug, e.g. 'distribution', 'autonomy', 'go-to-market'."),
  label: z.string().describe("Title-case label, e.g. 'Distribution', 'Go to market'."),
  headline: z
    .string()
    .describe(
      "Punchy declarative headline ending with a period. 4-7 words. " +
        "Example: 'Agents leave the IDE.'",
    ),
  lede: z
    .string()
    .describe(
      "1-3 sentence editorial summary of why these entries cluster together. " +
        "Tell the reader what the *pattern* meant, not just what shipped.",
    ),
  entries: z.array(ThemeEntrySchema).min(1).max(8),
});

const EditorialDraftSchema = z.object({
  headlinePre: z
    .string()
    .describe(
      "Opening of the masthead headline, ending with a space. " +
        "Always 'i wake up, there is ' for the standard weekly opener.",
    ),
  headlineAccent: z
    .string()
    .describe(
      "Italic-purple phrase in the headline. 2-4 words capturing the week's pulse. " +
        "Example: 'another week', 'a louder week', 'a quieter week'.",
    ),
  headlinePost: z
    .string()
    .describe(
      "Closing of the masthead headline, including leading space. " +
        "Example: ' of AI updates.'",
    ),
  deck: z
    .string()
    .describe(
      "Subtitle below the headline. 1-2 sentences explaining what the digest does. " +
        "Stable across issues but may be lightly varied.",
    ),
  hubH2: z
    .string()
    .describe(
      "Title of the center mindmap hub. Short, evocative, count-independent. " +
        "Examples: 'What this week meant.', 'The week in themes.', 'The signals that mattered.'",
    ),
  themes: z.array(ThemeSchema).min(3).max(6).describe(
    "3 to 6 themes that cluster the week's entries by what the news *meant*, " +
      "not by which vendor shipped it. Order from highest to lowest editorial weight. " +
      "Pick fewer themes when the week has few strong clusters; never pad.",
  ),
  fullDigestRight: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe(
      "2-4 short uppercase-ready stats shown next to the 'Every drop, themed and linked.' " +
        "intro. Example: ['27 linked drops', '5 active days', '3 tools tracked'].",
    ),
  footerPunchPre: z
    .string()
    .describe("Opening of the footer punchline. Example: 'i wake up, there is '."),
  footerPunchAccent: z
    .string()
    .describe(
      "Italic-purple phrase in the footer punchline. Echoes or contrasts the masthead accent. " +
        "Example: 'another one'.",
    ),
  footerPunchPost: z
    .string()
    .describe("Closing of the footer punchline. Example: '.'"),
});

type EditorialDraft = z.infer<typeof EditorialDraftSchema>;

const SYSTEM_PROMPT = `You are the editor of AI Radar, a weekly digest tracking what AI coding agents shipped. \
Your job is to take a week of raw entries (releases, news, blog posts, tweets) about Claude, Codex, and Cursor \
and synthesize them into one issue.

EDITORIAL VOICE
- Calm, observational, slightly dry. Like a financial-press analyst, not a hypeman.
- Headlines are short declaratives ending with a period. 4-7 words.
- Never use em-dashes anywhere in any field. Use commas, periods, colons, parentheses, or split into two sentences. This is non-negotiable.
- No emoji. No exclamation points. No "exciting", "amazing", "incredible".
- The masthead headline always starts "i wake up, there is " (lowercase i) and the italic accent describes the week's *pulse*: "another week", "a louder week", "a quieter week", "a busier week".
- Footer punchline echoes the masthead: "i wake up, there is another one." is the default; vary if the week's mood justifies.

THEMING
- Pick 3 to 6 themes for the issue, depending on what the week earned. Quiet weeks merit fewer themes; loud weeks merit more.
- Themes cluster entries by what the news *meant*, not who shipped it. Cross-vendor groupings are the goal.
- Sample theme labels we have used: Distribution (agents leaving the IDE), Autonomy (parallel agents), Go to market (enterprise pitch), Trust and safety (security, supply chain), Stance (papers, partnerships, philosophy), Surfaces (consumer, voice, non-IDE). Reuse labels when fitting; invent new ones when the week warrants.
- Each theme MUST have at least 3 entries with strong editorial fit. Do NOT pad weak clusters to hit a count. Merge or drop instead.
- Consolidate near-duplicates (e.g. the same launch reported via blog + tweet + changelog) into a single canonical entry per theme.
- Every entry given to you should appear in at most one theme. Skip entries that don't fit anywhere strong rather than forcing them in. Do not invent entries that weren't in the input.
- Hub H2 must NOT reference a theme count (no 'six currents'); pick a phrase that works for any count.
- Deck (subtitle) must NOT reference a theme count either. Good: "One issue, every drop linked." Bad: "One issue, six themes, every drop linked."

THEME HEADLINES
- Each theme's headline is the CEO-scan line: assume a busy reader spends 1 second per card.
- When ONE specific story dominates a theme, name it with proper nouns and numbers. Good: "Anthropic at $965 billion." Bad: "The business of AI gets louder."
- When 3+ items of comparable weight cluster, list the specific shipped pieces. Good: "Admin API, WIF, private MCP servers." Bad: "Enterprise plumbing fills in."
- Reserve editorial verb-headlines ("X hardens", "Y fills in", "Z gets louder") only when the entries are genuinely a vibe shift with no single anchor.

ENTRY TITLES
- Rewrite the raw entry title into a single declarative sentence ending with a period.
- Lead with the product or action, not the vendor. "Symphony. Every open task gets its own running agent." not "OpenAI announces Symphony."
- Keep proper nouns (Codex, Claude, Cursor, GPT-Realtime-2, TanStack, ChatGPT).
- Strip marketing language: "revolutionary", "groundbreaking", "industry-leading".

TIME PILLS
- For X / tweet entries with a timestamp, use 'Weekday · HH:MM PT' (24-hour, Pacific). Example: 'Mon · 13:50 PT'.
- For blog / changelog entries without a precise time, use 'Weekday · Category'. Categories: 'Release', 'Product', 'Engineering', 'Safety', 'Company', 'Research'. Example: 'Wed · Engineering'.
- Pick the weekday from the entry's published_at date interpreted in America/Los_Angeles.

OUTPUT
You will emit a structured JSON object matching the provided schema. Every theme entry's source_url MUST be copied verbatim from the input.`;

function ptWeekday(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", weekday: "short" });
}

function ptTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildEntriesPayload(entries: EntryRow[]): string {
  return entries
    .map((e) => {
      const weekday = ptWeekday(e.published_at);
      const time = ptTime(e.published_at);
      return [
        `id=${e.id}`,
        `agent=${e.agent_slug}`,
        `source_type=${e.source_type}`,
        `entry_type=${e.entry_type}`,
        e.quality_score != null ? `quality=${e.quality_score}` : null,
        `published_pt=${weekday} ${time}`,
        `source_url=${e.source_url}`,
        `title=${e.title.replace(/\n/g, " ").slice(0, 240)}`,
        e.summary ? `summary=${e.summary.replace(/\n/g, " ").slice(0, 240)}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n---\n");
}

function ptDate(iso: string): { month: string; day: number } {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
  }).formatToParts(d);
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = Number(parts.find((p) => p.type === "day")?.value ?? 0);
  return { month, day };
}

function weekRangeLabel(sundayKey: string): string {
  const sunday = new Date(`${sundayKey}T00:00:00Z`);
  const startMs = sunday.getTime() - 7 * 86400_000;
  const endMs = sunday.getTime() - 1 * 86400_000;
  const start = ptDate(new Date(startMs).toISOString());
  const end = ptDate(new Date(endMs).toISOString());
  const startStr = `${start.month} ${start.day}`;
  const endStr = start.month === end.month ? `${end.day}` : `${end.month} ${end.day}`;
  return `${startStr} to ${endStr}, ${sundayKey.slice(0, 4)}`;
}

function sendDayLabel(sundayKey: string): string {
  const sunday = new Date(`${sundayKey}T00:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "short",
    day: "numeric",
  }).formatToParts(sunday);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Sunday";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  return `${weekday}, ${month} ${day} PT`;
}

function nowIngestLabel(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const h = parts.find((p) => p.type === "hour")?.value ?? "00";
  const m = parts.find((p) => p.type === "minute")?.value ?? "00";
  return `${h}:${m} PT`;
}

function activeDays(entries: EntryRow[]): number {
  const days = new Set<string>();
  for (const e of entries) {
    const dateInPT = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Los_Angeles",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(e.published_at));
    days.add(dateInPT);
  }
  return days.size;
}

function toolsTracked(entries: EntryRow[]): { agent: DigestEntry["agent"]; count: number }[] {
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.agent_slug] = (counts[e.agent_slug] ?? 0) + 1;
  const order: DigestEntry["agent"][] = ["codex", "claude", "cursor"];
  return order
    .filter((a) => counts[a])
    .map((a) => ({ agent: a, count: counts[a] }));
}

function numberToTwoDigit(n: number): string {
  return String(n).padStart(2, "0");
}

function stitchIssue(
  weekKey: string,
  entries: EntryRow[],
  draft: EditorialDraft,
): DigestIssue {
  const themes: DigestTheme[] = draft.themes.map((t, idx) => ({
    slug: t.slug,
    num: numberToTwoDigit(idx + 1),
    label: t.label,
    count: t.entries.length,
    headline: t.headline,
    lede: t.lede,
    entries: t.entries.map((e) => ({
      agent: e.agent,
      title: e.title,
      time: e.time,
      url: e.source_url,
    })),
  }));

  const themedEntryCount = themes.reduce((s, t) => s + t.entries.length, 0);
  const tools = toolsTracked(entries);

  return {
    weekKey,
    sendDayLabel: sendDayLabel(weekKey),
    weekRangeLabel: weekRangeLabel(weekKey),
    ingestTimeLabel: nowIngestLabel(),
    headlinePre: draft.headlinePre,
    headlineAccent: draft.headlineAccent,
    headlinePost: draft.headlinePost,
    deck: draft.deck,
    stats: { drops: entries.length, tools: tools.length, themes: themes.length },
    hubH2: draft.hubH2,
    hubSub: `${weekRangeLabel(weekKey).split(",")[0]} · ${entries.length} drops`,
    themes,
    fullDigestRight: [
      `${themedEntryCount} linked drops`,
      `${activeDays(entries)} active days`,
      `${tools.length} tools tracked`,
    ],
    footerPunchPre: draft.footerPunchPre,
    footerPunchAccent: draft.footerPunchAccent,
    footerPunchPost: draft.footerPunchPost,
    toolsTracked: tools,
    builtByLine:
      "Built by Jane You with Claude Code & Design · Maintained by RaeyaBot · Daily ingest 5am PT",
  };
}

export type DraftIssueOptions = {
  /** Override the entries pulled from DB; mainly for tests. */
  entries?: EntryRow[];
  /** Optional editor feedback to steer the next draft. */
  feedback?: string;
  /** Don't persist; just return. */
  dryRun?: boolean;
};

export async function draftIssueForWeek(
  weekKey: string,
  opts: DraftIssueOptions = {},
): Promise<{ issue: DigestIssue; saved: boolean; modelUsed: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

  const entries = opts.entries ?? (await getRecentEntries(24 * 7));
  if (entries.length === 0) {
    throw new Error(`No entries available for week ${weekKey}; nothing to draft.`);
  }

  const agentNames = AGENTS.filter((a) => ["codex", "claude", "cursor"].includes(a.slug))
    .map((a) => `- ${a.slug} = ${a.name}`)
    .join("\n");

  const client = new Anthropic({ apiKey });

  const userPayload =
    `WEEK: ${weekRangeLabel(weekKey)}\n` +
    `SUNDAY: ${weekKey}\n` +
    `TRACKED TOOLS:\n${agentNames}\n\n` +
    (opts.feedback ? `EDITOR FEEDBACK FROM PRIOR DRAFT:\n${opts.feedback}\n\n` : "") +
    `ENTRIES (${entries.length} total):\n${buildEntriesPayload(entries)}`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "high",
      // SDK 0.91 typed the helper for Zod v3; we run on Zod v4 (the helper's
      // runtime already uses v4 internally). Cast bridges the type-only gap.
      format: zodOutputFormat(EditorialDraftSchema as never),
    },
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPayload }],
  });

  if (!response.parsed_output) {
    throw new Error(
      `LLM refused or returned malformed output: stop_reason=${response.stop_reason}`,
    );
  }

  const issue = stitchIssue(weekKey, entries, response.parsed_output);

  if (!opts.dryRun) {
    await saveDigestIssue(weekKey, issue, MODEL);
  }

  return { issue, saved: !opts.dryRun, modelUsed: MODEL };
}
