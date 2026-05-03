export type Level = "L1" | "L2" | "L3" | "L4" | "L5";
export type Category = "software-dev" | "personal-life" | "business-ops" | "frameworks";

export type LandscapeEntry = {
  name: string;
  level: Level;
  category: Category;
  trackedSlug?: string;
};

export const LEVELS: { id: Level; label: string; role: string }[] = [
  { id: "L1", label: "L1", role: "Chat" },
  { id: "L2", label: "L2", role: "Pilot" },
  { id: "L3", label: "L3", role: "Agent" },
  { id: "L4", label: "L4", role: "Coworker" },
  { id: "L5", label: "L5", role: "Executive" },
];

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "software-dev", label: "Software Dev" },
  { id: "personal-life", label: "Personal / Life" },
  { id: "business-ops", label: "Business Ops" },
  { id: "frameworks", label: "Frameworks" },
];

export const LANDSCAPE: LandscapeEntry[] = [
  // L1 Chat
  { name: "ChatGPT", level: "L1", category: "software-dev" },
  { name: "Claude Chat", level: "L1", category: "software-dev", trackedSlug: "claude" },
  { name: "Grok", level: "L1", category: "software-dev" },
  { name: "Siri", level: "L1", category: "personal-life" },
  { name: "Gemini", level: "L1", category: "personal-life" },
  { name: "Notion AI", level: "L1", category: "business-ops" },
  { name: "Jasper", level: "L1", category: "business-ops" },

  // L2 Pilot
  { name: "Copilot", level: "L2", category: "software-dev" },
  { name: "Bolt", level: "L2", category: "software-dev" },
  { name: "v0", level: "L2", category: "software-dev" },
  { name: "Amazon Q", level: "L2", category: "software-dev" },
  { name: "Perplexity", level: "L2", category: "personal-life" },
  { name: "HubSpot AI", level: "L2", category: "business-ops" },
  { name: "Salesforce Einstein", level: "L2", category: "business-ops" },
  { name: "LangChain", level: "L2", category: "frameworks" },

  // L3 Agent
  { name: "Claude Code", level: "L3", category: "software-dev", trackedSlug: "claude" },
  { name: "Cursor", level: "L3", category: "software-dev", trackedSlug: "cursor" },
  { name: "Windsurf", level: "L3", category: "software-dev", trackedSlug: "windsurf" },
  { name: "Lovable", level: "L3", category: "software-dev", trackedSlug: "lovable" },
  { name: "Replit Agent", level: "L3", category: "software-dev", trackedSlug: "replit-agent" },
  { name: "Copilot Workspace", level: "L3", category: "software-dev", trackedSlug: "copilot-workspace" },
  { name: "Claude Cowork", level: "L3", category: "personal-life", trackedSlug: "claude-cowork" },
  { name: "OpenAI Operator", level: "L3", category: "personal-life", trackedSlug: "openai-operator" },
  { name: "Jules / Mariner", level: "L3", category: "personal-life", trackedSlug: "jules" },
  { name: "Lindy", level: "L3", category: "business-ops" },
  { name: "Gumloop", level: "L3", category: "business-ops" },
  { name: "Agentforce", level: "L3", category: "business-ops" },
  { name: "CrewAI", level: "L3", category: "frameworks" },
  { name: "AG2", level: "L3", category: "frameworks" },
  { name: "MS Agent Framework", level: "L3", category: "frameworks" },

  // L4 Coworker
  { name: "Devin", level: "L4", category: "software-dev", trackedSlug: "devin" },
  { name: "OpenHands", level: "L4", category: "software-dev", trackedSlug: "openhands" },
  { name: "OpenClaw", level: "L4", category: "personal-life", trackedSlug: "openclaw" },
  { name: "Hermes Agent", level: "L4", category: "personal-life", trackedSlug: "hermes-agent" },
  { name: "Zapier", level: "L4", category: "business-ops" },
  { name: "Glean", level: "L4", category: "business-ops" },
  { name: "Artisan", level: "L4", category: "business-ops" },
  { name: "LangGraph", level: "L4", category: "frameworks" },

  // L5 Executive, none shipped
];
