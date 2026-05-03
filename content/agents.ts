export type AgentStatus = "live" | "coming_soon";

export type AgentSource = {
  type: "changelog" | "blog" | "x";
  url: string;
  label: string;
  /** Named parser in lib/scrape.ts. Required for changelog/blog. X sources skip this. */
  parser?: "claude-support" | "anthropic-news";
};

export type Agent = {
  slug: string;
  name: string;
  status: AgentStatus;
  officialUrl: string;
  blurb: string;
  sources: AgentSource[];
};

export const AGENTS: Agent[] = [
  {
    slug: "claude",
    name: "Claude",
    status: "live",
    officialUrl: "https://www.anthropic.com/claude",
    blurb: "Anthropic's family of products: Chat, Cowork, Code.",
    sources: [
      {
        type: "changelog",
        url: "https://support.claude.com/en/articles/12138966-release-notes",
        label: "Claude apps release notes",
        parser: "claude-support",
      },
      {
        type: "blog",
        url: "https://www.anthropic.com/news",
        label: "Anthropic News",
        parser: "anthropic-news",
      },
      // X is on pay-per-usage as of 2026-04-27 (~$0.005/tweet, ~$1-3/month for these handles).
      // See notes/X_API_SETUP.md for cost math and Developer Console setup.
      { type: "x", url: "https://x.com/claudeai", label: "@claudeai" },
      { type: "x", url: "https://x.com/AnthropicAI", label: "@AnthropicAI" },
    ],
  },
  {
    slug: "cursor",
    name: "Cursor",
    status: "live",
    officialUrl: "https://cursor.com",
    blurb: "IDE-native coding agent.",
    sources: [
      { type: "x", url: "https://x.com/cursor_ai", label: "@cursor_ai" },
    ],
  },
  {
    slug: "codex",
    name: "Codex",
    status: "live",
    officialUrl: "https://openai.com/codex",
    blurb: "OpenAI's coding agent in ChatGPT.",
    sources: [
      { type: "x", url: "https://x.com/OpenAI", label: "@OpenAI" },
      { type: "x", url: "https://x.com/OpenAIDevs", label: "@OpenAIDevs" },
      // Leadership account. The LLM x-quality filter (lib/xQuality.ts) keeps
      // only product-relevant tweets and drops off-topic noise. Add more
      // leadership / product handles here once verified.
      { type: "x", url: "https://x.com/sama", label: "@sama" },
    ],
  },
  {
    slug: "windsurf",
    name: "Windsurf",
    status: "coming_soon",
    officialUrl: "https://windsurf.com",
    blurb: "Cognition's IDE agent with the Cascade engine.",
    sources: [
      { type: "changelog", url: "https://windsurf.com/changelog", label: "Changelog" },
      { type: "x", url: "https://x.com/windsurf_ai", label: "@windsurf_ai" },
    ],
  },
  {
    slug: "lovable",
    name: "Lovable",
    status: "coming_soon",
    officialUrl: "https://lovable.dev",
    blurb: "Natural language → full-stack app.",
    sources: [{ type: "x", url: "https://x.com/lovable_dev", label: "@lovable_dev" }],
  },
  {
    slug: "replit-agent",
    name: "Replit Agent",
    status: "coming_soon",
    officialUrl: "https://replit.com",
    blurb: "Prompt → deployed app in the browser.",
    sources: [{ type: "x", url: "https://x.com/Replit", label: "@Replit" }],
  },
  {
    slug: "claude-cowork",
    name: "Claude Cowork",
    status: "coming_soon",
    officialUrl: "https://www.anthropic.com/claude/cowork",
    blurb: "Anthropic's desktop GUI agent (research preview).",
    sources: [
      { type: "blog", url: "https://www.anthropic.com/news", label: "Anthropic News" },
      { type: "x", url: "https://x.com/AnthropicAI", label: "@AnthropicAI" },
    ],
  },
  {
    slug: "openai-operator",
    name: "OpenAI Operator",
    status: "coming_soon",
    officialUrl: "https://operator.chatgpt.com",
    blurb: "OpenAI's browser-task agent.",
    sources: [{ type: "x", url: "https://x.com/OpenAI", label: "@OpenAI" }],
  },
  {
    slug: "copilot-workspace",
    name: "Copilot Workspace",
    status: "coming_soon",
    officialUrl: "https://github.com/features/copilot",
    blurb: "GitHub's plan-and-edit Copilot mode.",
    sources: [
      { type: "blog", url: "https://github.blog/changelog/", label: "GitHub Changelog" },
      { type: "x", url: "https://x.com/GitHub", label: "@GitHub" },
    ],
  },
  {
    slug: "jules",
    name: "Google Jules",
    status: "coming_soon",
    officialUrl: "https://jules.google",
    blurb: "Gemini-based coding agent.",
    sources: [{ type: "x", url: "https://x.com/Google", label: "@Google" }],
  },
  {
    slug: "devin",
    name: "Devin",
    status: "coming_soon",
    officialUrl: "https://devin.ai",
    blurb: "Cognition's autonomous software engineer.",
    sources: [{ type: "x", url: "https://x.com/cognition_labs", label: "@cognition_labs" }],
  },
  {
    slug: "openhands",
    name: "OpenHands",
    status: "coming_soon",
    officialUrl: "https://github.com/All-Hands-AI/OpenHands",
    blurb: "Open-source autonomous coding agent.",
    sources: [{ type: "x", url: "https://x.com/allhands_ai", label: "@allhands_ai" }],
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    status: "coming_soon",
    officialUrl: "https://github.com/openclaw/openclaw",
    blurb: "Self-hosted multi-channel personal agent.",
    sources: [],
  },
  {
    slug: "hermes-agent",
    name: "Hermes Agent",
    status: "coming_soon",
    officialUrl: "https://hermes-agent.nousresearch.com",
    blurb: "Self-improving agent from Nous Research.",
    sources: [{ type: "x", url: "https://x.com/NousResearch", label: "@NousResearch" }],
  },
];

export const getAgentBySlug = (slug: string): Agent | undefined =>
  AGENTS.find((a) => a.slug === slug);

export const getLiveAgents = (): Agent[] =>
  AGENTS.filter((a) => a.status === "live");
