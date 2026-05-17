export type DigestEntry = {
  agent: "codex" | "claude" | "cursor";
  title: string;
  time: string;
  url: string;
};

export type DigestTheme = {
  slug: string;
  num: string;
  label: string;
  count: number;
  headline: string;
  lede: string;
  entries: DigestEntry[];
};

export type DigestIssue = {
  weekKey: string;
  sendDayLabel: string;
  weekRangeLabel: string;
  ingestTimeLabel: string;
  headlinePre: string;
  headlineAccent: string;
  headlinePost: string;
  deck: string;
  stats: { drops: number; tools: number; themes: number };
  hubH2: string;
  hubSub: string;
  themes: DigestTheme[];
  fullDigestRight: string[];
  footerPunchPre: string;
  footerPunchAccent: string;
  footerPunchPost: string;
  toolsTracked: { agent: "codex" | "claude" | "cursor"; count: number }[];
  builtByLine: string;
};

export const ISSUE_001: DigestIssue = {
  weekKey: "2026-05-17",
  sendDayLabel: "Sunday, May 17 PT",
  weekRangeLabel: "May 10 to 16, 2026",
  ingestTimeLabel: "05:10 PT",
  headlinePre: "i wake up, there is ",
  headlineAccent: "another week",
  headlinePost: " of AI updates.",
  deck:
    "A daily index, distilled to a weekly note. Six themes across the agents we track, sorted by what the news meant, not who shipped it.",
  stats: { drops: 32, tools: 3, themes: 6 },
  hubH2: "The week, in six currents",
  hubSub: "May 10 to 16 · 32 drops",
  fullDigestRight: ["27 linked drops", "5 active days", "3 tools tracked"],
  footerPunchPre: "i wake up, there is ",
  footerPunchAccent: "another one",
  footerPunchPost: ".",
  toolsTracked: [
    { agent: "codex", count: 29 },
    { agent: "claude", count: 17 },
    { agent: "cursor", count: 12 },
  ],
  builtByLine:
    "Built by Jane You with Claude Code & Design · Maintained by RaeyaBot · Daily ingest 5am PT",
  themes: [
    {
      slug: "distribution",
      num: "01",
      label: "Distribution",
      count: 5,
      headline: "Agents leave the IDE.",
      lede:
        "Coding assistants chase you onto whatever surface you actually live on. The week's biggest pattern: Codex and Cursor both pushed past the editor into Windows, mobile, the desktop, and Microsoft Teams.",
      entries: [
        { agent: "codex", title: "Windows sandbox brings Codex to the OS most devs use.", time: "Wed · Engineering", url: "https://openai.com/index/building-codex-windows-sandbox/" },
        { agent: "codex", title: "iOS and Android preview rolls out in all supported regions.", time: "Thu · 13:06 PT", url: "https://x.com/OpenAI/status/2055016852133417389" },
        { agent: "codex", title: "Computer Use on Mac, working across apps without taking over.", time: "Tue · 13:31 PT", url: "https://x.com/OpenAIDevs/status/2054298427245441141" },
        { agent: "cursor", title: "Cursor lands in Microsoft Teams.", time: "Mon · Release", url: "https://cursor.com/changelog/microsoft-teams" },
        { agent: "codex", title: "\"Work with Codex from anywhere.\" A multi-surface roadmap.", time: "Thu · Product", url: "https://openai.com/index/work-with-codex-from-anywhere/" },
      ],
    },
    {
      slug: "autonomy",
      num: "02",
      label: "Autonomy",
      count: 6,
      headline: "Parallel, always-on agents.",
      lede:
        "One-shot prompts are no longer the default unit. The week was full of swarm primitives: per-task agents, advisor strategies, cloud agents in real dev environments, and PRs drafted from full conversation threads.",
      entries: [
        { agent: "codex", title: "Symphony. Every open task gets its own running agent.", time: "Tue · 10:27 PT", url: "https://x.com/OpenAIDevs/status/2054252221941121035" },
        { agent: "claude", title: "Managed Agents plus advisor strategy, for building at scale.", time: "Mon · 09:03 PT", url: "https://x.com/claudeai/status/2053868595394879553" },
        { agent: "cursor", title: "Cloud agents run inside fully configured dev environments.", time: "Wed · Release", url: "https://cursor.com/changelog/05-13-26" },
        { agent: "claude", title: "New agent view inside Claude Code.", time: "Mon · 13:50 PT", url: "https://x.com/claudeai/status/2053940934736228454" },
        { agent: "cursor", title: "Reads the entire thread for context before drafting a PR.", time: "Mon · 13:44 PT", url: "https://x.com/cursor_ai/status/2053939391912112235" },
        { agent: "codex", title: "Easier to automate and customize Codex around your code.", time: "Thu · 14:06 PT", url: "https://x.com/OpenAIDevs/status/2055032115964870838" },
      ],
    },
    {
      slug: "go-to-market",
      num: "03",
      label: "Go to market",
      count: 5,
      headline: "The enterprise pitch hardens.",
      lede:
        "Selling motions sharpened around the agent: a deployment arm, tunable review controls, team-chat surfaces, and a measurable response (2000 dev sign-ups in three hours) to \"use Codex at work.\"",
      entries: [
        { agent: "codex", title: "Launch of the OpenAI Deployment Company.", time: "Mon · 06:10 PT", url: "https://x.com/OpenAI/status/2053824997777457651" },
        { agent: "codex", title: "\"Use Codex at work.\" 2000 developers reached out in 3 hours.", time: "Wed · 16:01 PT", url: "https://x.com/OpenAIDevs/status/2054698500143927357" },
        { agent: "cursor", title: "Bugbot effort levels: tune how deeply it thinks during a PR.", time: "Mon · 10:36 PT", url: "https://x.com/cursor_ai/status/2053892050299597107" },
        { agent: "cursor", title: "Cursor in Microsoft Teams, as a distribution surface.", time: "Mon · Release", url: "https://cursor.com/changelog/microsoft-teams" },
        { agent: "claude", title: "Build and deploy agents with Claude APIs, advisor, and managed agents.", time: "Mon · 09:03 PT", url: "https://x.com/claudeai/status/2053868595394879553" },
      ],
    },
    {
      slug: "trust-and-safety",
      num: "04",
      label: "Trust and safety",
      count: 4,
      headline: "Supply chain on edge.",
      lede:
        "A nasty npm event put agentic install scripts on notice. OpenAI shipped a public response, a deep-dive on the Windows sandbox, and a cyber-defense product. ChatGPT also got context-aware in sensitive conversations.",
      entries: [
        { agent: "codex", title: "Public response to the TanStack npm supply-chain attack.", time: "Wed · Company", url: "https://openai.com/index/our-response-to-the-tanstack-npm-supply-chain-attack/" },
        { agent: "codex", title: "Daybreak: frontier AI for cyber defenders.", time: "Mon · 13:45 PT", url: "https://x.com/OpenAI/status/2053939702110269822" },
        { agent: "codex", title: "Helping ChatGPT recognize context in sensitive conversations.", time: "Thu · Safety", url: "https://openai.com/index/chatgpt-recognize-context-in-sensitive-conversations/" },
        { agent: "codex", title: "Building a safe, effective sandbox to enable Codex on Windows.", time: "Wed · Engineering", url: "https://openai.com/index/building-codex-windows-sandbox/" },
      ],
    },
    {
      slug: "stance",
      num: "05",
      label: "Stance",
      count: 3,
      headline: "The long game shows up.",
      lede:
        "Beyond shipping, Anthropic spent the week on stance: a paper on US-China AI competition, a $200M Gates Foundation partnership, and the Claude Constitution shipped as audiobook.",
      entries: [
        { agent: "claude", title: "Anthropic paper on AI competition between the US and China.", time: "Thu · 11:09 PT", url: "https://x.com/AnthropicAI/status/2054987444664377374" },
        { agent: "claude", title: "$200M partnership with the Gates Foundation: grants plus Claude credits.", time: "Thu · 08:08 PT", url: "https://x.com/AnthropicAI/status/2054941901900611787" },
        { agent: "claude", title: "Claude's Constitution, now an audiobook read by Askell and Carlsmith.", time: "Mon · 09:56 PT", url: "https://x.com/AnthropicAI/status/2053881827396653207" },
      ],
    },
    {
      slug: "surfaces",
      num: "06",
      label: "Surfaces",
      count: 4,
      headline: "Consumer and voice.",
      lede:
        "Outside the IDE, assistants picked up a money brain, a voice, and a campus pipeline. Cursor brought a faster Opus into the editor; Codex landed a new finance experience inside ChatGPT.",
      entries: [
        { agent: "codex", title: "A new personal finance experience inside ChatGPT.", time: "Fri · Product", url: "https://openai.com/index/personal-finance-chatgpt/" },
        { agent: "codex", title: "GPT-Realtime-2: standup audio moves tickets on its own.", time: "Mon · 15:23 PT", url: "https://x.com/OpenAIDevs/status/2053964133570412826" },
        { agent: "cursor", title: "Fast mode for Claude Opus 4.7 is now available in Cursor.", time: "Tue · 11:55 PT", url: "https://x.com/cursor_ai/status/2054274305345618163" },
        { agent: "codex", title: "OpenAI Campus Network: student-club interest form is open.", time: "Mon · Company", url: "https://openai.com/index/openai-campus-network-student-club-interest-form/" },
      ],
    },
  ],
};
