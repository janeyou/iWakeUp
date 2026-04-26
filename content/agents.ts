export type AgentStatus = "live" | "coming_soon";

export type Agent = {
  slug: string;
  name: string;
  status: AgentStatus;
  officialUrl: string;
  xHandle: string | null;
  changelogUrl: string | null;
  blurb: string;
};

export const AGENTS: Agent[] = [
  {
    slug: "claude",
    name: "Claude",
    status: "live",
    officialUrl: "https://www.anthropic.com/claude",
    xHandle: "AnthropicAI",
    changelogUrl: "https://www.anthropic.com/news",
    blurb: "Anthropic's family — Chat, Cowork, Code.",
  },
  {
    slug: "cursor",
    name: "Cursor",
    status: "live",
    officialUrl: "https://cursor.com",
    xHandle: "cursor_ai",
    changelogUrl: "https://cursor.com/changelog",
    blurb: "IDE-native coding agent.",
  },
  {
    slug: "windsurf",
    name: "Windsurf",
    status: "coming_soon",
    officialUrl: "https://windsurf.com",
    xHandle: "windsurf_ai",
    changelogUrl: "https://windsurf.com/changelog",
    blurb: "Cognition's IDE agent with the Cascade engine.",
  },
  {
    slug: "lovable",
    name: "Lovable",
    status: "coming_soon",
    officialUrl: "https://lovable.dev",
    xHandle: "lovable_dev",
    changelogUrl: null,
    blurb: "Natural language → full-stack app.",
  },
  {
    slug: "replit-agent",
    name: "Replit Agent",
    status: "coming_soon",
    officialUrl: "https://replit.com",
    xHandle: "Replit",
    changelogUrl: null,
    blurb: "Prompt → deployed app in the browser.",
  },
  {
    slug: "claude-cowork",
    name: "Claude Cowork",
    status: "coming_soon",
    officialUrl: "https://www.anthropic.com/claude/cowork",
    xHandle: "AnthropicAI",
    changelogUrl: null,
    blurb: "Anthropic's desktop GUI agent (research preview).",
  },
  {
    slug: "openai-operator",
    name: "OpenAI Operator",
    status: "coming_soon",
    officialUrl: "https://operator.chatgpt.com",
    xHandle: "OpenAI",
    changelogUrl: null,
    blurb: "OpenAI's browser-task agent.",
  },
  {
    slug: "copilot-workspace",
    name: "Copilot Workspace",
    status: "coming_soon",
    officialUrl: "https://github.com/features/copilot",
    xHandle: "GitHub",
    changelogUrl: "https://github.blog/changelog/",
    blurb: "GitHub's plan-and-edit Copilot mode.",
  },
  {
    slug: "jules",
    name: "Google Jules",
    status: "coming_soon",
    officialUrl: "https://jules.google",
    xHandle: "Google",
    changelogUrl: null,
    blurb: "Gemini-based coding agent.",
  },
  {
    slug: "devin",
    name: "Devin",
    status: "coming_soon",
    officialUrl: "https://devin.ai",
    xHandle: "cognition_labs",
    changelogUrl: null,
    blurb: "Cognition's autonomous software engineer.",
  },
  {
    slug: "openhands",
    name: "OpenHands",
    status: "coming_soon",
    officialUrl: "https://github.com/All-Hands-AI/OpenHands",
    xHandle: "allhands_ai",
    changelogUrl: null,
    blurb: "Open-source autonomous coding agent.",
  },
  {
    slug: "openclaw",
    name: "OpenClaw",
    status: "coming_soon",
    officialUrl: "https://github.com/openclaw/openclaw",
    xHandle: null,
    changelogUrl: null,
    blurb: "Self-hosted multi-channel personal agent.",
  },
  {
    slug: "hermes-agent",
    name: "Hermes Agent",
    status: "coming_soon",
    officialUrl: "https://hermes-agent.nousresearch.com",
    xHandle: "NousResearch",
    changelogUrl: null,
    blurb: "Self-improving agent from Nous Research.",
  },
];

export const getAgentBySlug = (slug: string): Agent | undefined =>
  AGENTS.find((a) => a.slug === slug);

export const getLiveAgents = (): Agent[] =>
  AGENTS.filter((a) => a.status === "live");
