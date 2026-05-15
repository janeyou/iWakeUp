export type Level = "L1" | "L2" | "L3" | "L4" | "L5";
export type Category =
  | "software-dev"
  | "personal-life"
  | "business-ops"
  | "frameworks"
  | "voice"
  | "robotics";

export type LandscapeEntry = {
  name: string;
  level: Level;
  category: Category;
  trackedSlug?: string;
  /** If the tool was previously at a different level. Renders a small ←Lx
   *  badge so the matrix doubles as a movement chart. */
  previousLevel?: Level;
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
  { id: "voice", label: "Voice" },
  { id: "robotics", label: "Robotics" },
];

export const LANDSCAPE: LandscapeEntry[] = [
  // ---------- L1 Chat ----------
  { name: "ChatGPT", level: "L1", category: "software-dev" },
  { name: "Claude Chat", level: "L1", category: "software-dev", trackedSlug: "claude" },
  { name: "Grok", level: "L1", category: "software-dev" },
  { name: "Apple Intelligence", level: "L1", category: "personal-life" },
  { name: "Gemini app", level: "L1", category: "personal-life" },
  { name: "OpenAI Realtime", level: "L1", category: "voice" },
  { name: "Gemini Live", level: "L1", category: "voice" },
  { name: "Hume EVI 3", level: "L1", category: "voice" },
  { name: "Boston Dynamics (teleop)", level: "L1", category: "robotics" },

  // ---------- L2 Pilot ----------
  { name: "GitHub Copilot", level: "L2", category: "software-dev" },
  { name: "Windsurf", level: "L2", category: "software-dev", trackedSlug: "windsurf", previousLevel: "L3" },
  { name: "v0", level: "L2", category: "software-dev" },
  { name: "Perplexity", level: "L2", category: "personal-life" },
  { name: "Arc Search", level: "L2", category: "personal-life" },
  { name: "Dia browser", level: "L2", category: "personal-life" },
  { name: "HubSpot Breeze", level: "L2", category: "business-ops", previousLevel: "L1" },
  { name: "Salesforce Einstein", level: "L2", category: "business-ops" },
  { name: "Notion AI", level: "L2", category: "business-ops", previousLevel: "L1" },
  { name: "Jasper", level: "L2", category: "business-ops", previousLevel: "L1" },
  { name: "LangChain", level: "L2", category: "frameworks" },
  { name: "Vercel AI SDK", level: "L2", category: "frameworks" },
  { name: "OpenAI Agents SDK", level: "L2", category: "frameworks" },
  { name: "ElevenLabs", level: "L2", category: "voice" },
  { name: "Sesame CSM", level: "L2", category: "voice" },
  { name: "Suno Studio", level: "L2", category: "voice" },
  { name: "Udio v4", level: "L2", category: "voice" },
  { name: "NVIDIA Isaac GR00T", level: "L2", category: "robotics" },
  { name: "Gemini Robotics (VLA)", level: "L2", category: "robotics" },

  // ---------- L3 Agent ----------
  { name: "Claude Code", level: "L3", category: "software-dev", trackedSlug: "claude" },
  { name: "Cursor", level: "L3", category: "software-dev", trackedSlug: "cursor" },
  { name: "Codex", level: "L3", category: "software-dev", trackedSlug: "codex" },
  { name: "Lovable", level: "L3", category: "software-dev", trackedSlug: "lovable" },
  { name: "Replit Agent", level: "L3", category: "software-dev", trackedSlug: "replit-agent" },
  { name: "Bolt", level: "L3", category: "software-dev", previousLevel: "L2" },
  { name: "Copilot Coding Agent", level: "L3", category: "software-dev", trackedSlug: "copilot-workspace" },
  { name: "Claude Cowork", level: "L3", category: "personal-life", trackedSlug: "claude-cowork" },
  { name: "ChatGPT Agent Mode", level: "L3", category: "personal-life", trackedSlug: "openai-operator" },
  { name: "Gemini Agent", level: "L3", category: "personal-life", trackedSlug: "jules" },
  { name: "Manus", level: "L3", category: "personal-life" },
  { name: "Genspark AI Employee", level: "L3", category: "personal-life" },
  { name: "Lindy", level: "L3", category: "business-ops" },
  { name: "Gumloop", level: "L3", category: "business-ops" },
  { name: "Agentforce", level: "L3", category: "business-ops" },
  { name: "HubSpot Breeze Agents", level: "L3", category: "business-ops" },
  { name: "Clay", level: "L3", category: "business-ops" },
  { name: "Artisan", level: "L3", category: "business-ops", previousLevel: "L4" },
  { name: "LangGraph", level: "L3", category: "frameworks", previousLevel: "L4" },
  { name: "CrewAI", level: "L3", category: "frameworks" },
  { name: "Microsoft Agent Framework", level: "L3", category: "frameworks" },
  { name: "Pydantic AI", level: "L3", category: "frameworks" },
  { name: "Mastra", level: "L3", category: "frameworks" },
  { name: "Google ADK", level: "L3", category: "frameworks" },
  { name: "ElevenLabs Agents", level: "L3", category: "voice" },
  { name: "Vapi", level: "L3", category: "voice" },
  { name: "Retell", level: "L3", category: "voice" },
  { name: "Bland", level: "L3", category: "voice" },
  { name: "Physical Intelligence", level: "L3", category: "robotics" },
  { name: "Skild Brain", level: "L3", category: "robotics" },
  { name: "1X Neo", level: "L3", category: "robotics" },
  { name: "Apptronik Apollo", level: "L3", category: "robotics" },

  // ---------- L4 Coworker ----------
  { name: "Devin", level: "L4", category: "software-dev", trackedSlug: "devin" },
  { name: "OpenHands", level: "L4", category: "software-dev", trackedSlug: "openhands" },
  { name: "Jules", level: "L4", category: "software-dev" },
  { name: "OpenClaw", level: "L4", category: "personal-life", trackedSlug: "openclaw" },
  { name: "Hermes Agent", level: "L4", category: "personal-life", trackedSlug: "hermes-agent" },
  { name: "Zapier", level: "L4", category: "business-ops" },
  { name: "Glean", level: "L4", category: "business-ops" },
  { name: "11x.ai", level: "L4", category: "business-ops" },
  { name: "LangGraph Platform", level: "L4", category: "frameworks" },
  { name: "Figure 03 + Helix-02", level: "L4", category: "robotics" },

  // L5 Executive, none shipped
];
