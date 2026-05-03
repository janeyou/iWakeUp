export type LevelDetail = {
  id: "L1" | "L2" | "L3" | "L4" | "L5";
  role: string;
  aiIs: string;
  humanIs: string;
  description: string;
  insight: string;
  examples: string[];
  decidesGoal: string;
  decidesApproach: string;
  decidesWhen: string;
  theoretical?: boolean;
};

export const LEVEL_DETAILS: LevelDetail[] = [
  {
    id: "L1",
    role: "Chat",
    aiIs: "Responder",
    humanIs: "Instructor",
    description:
      "Answers when asked. No tools, no action. Reactive: you prompt, it replies, it stops.",
    insight: "If you stop typing, the work stops.",
    examples: ["ChatGPT", "Claude Chat", "Gemini", "Grok"],
    decidesGoal: "Human",
    decidesApproach: "Human",
    decidesWhen: "Human",
  },
  {
    id: "L2",
    role: "Pilot",
    aiIs: "Assistant",
    humanIs: "Editor",
    description:
      "Same shape as L1, but reaches for tools mid-answer. Scope stays narrow. One question in, one answer out.",
    insight: "Most “AI-powered” features shipped in 2024 to 2025 live here.",
    examples: ["Perplexity", "Copilot", "Bolt", "v0", "Amazon Q"],
    decidesGoal: "Human",
    decidesApproach: "Human",
    decidesWhen: "Human",
  },
  {
    id: "L3",
    role: "Agent",
    aiIs: "Teammate",
    humanIs: "Reviewer",
    description: "Plans multi-step work. Executes in a loop. Self-corrects. You review.",
    insight: "The current frontier, and where most people haven’t moved yet.",
    examples: ["Claude Code", "Claude Cowork", "Cursor", "Windsurf", "Lovable", "Replit Agent"],
    decidesGoal: "Human",
    decidesApproach: "AI",
    decidesWhen: "Human",
  },
  {
    id: "L4",
    role: "Coworker",
    aiIs: "Deputy",
    humanIs: "Manager",
    description:
      "Persistent. Runs 24/7 on its own hardware. Triggers its own work. Reports back.",
    insight: "The jump from L3 isn’t intelligence. It’s continuity.",
    examples: ["OpenClaw", "Hermes Agent", "Devin", "OpenHands"],
    decidesGoal: "Human (policy)",
    decidesApproach: "AI",
    decidesWhen: "AI",
  },
  {
    id: "L5",
    role: "Executive",
    aiIs: "Business Unit",
    humanIs: "Owner / Board Member",
    description: "Runs a mission. Spawns its own sub-agents. Reports by exception only.",
    insight: "If someone sells you L5 in 2026, they’re selling a pitch deck.",
    examples: ["nothing shipped yet", "alignment + governance + trust problems"],
    decidesGoal: "AI",
    decidesApproach: "AI",
    decidesWhen: "AI",
    theoretical: true,
  },
];

export const LEVEL_JUMPS = [
  {
    from: "L2",
    to: "L3",
    flips: "approach",
    headline: "You stop designing the plan.",
    body: "The agent picks the steps. You review the result.",
  },
  {
    from: "L3",
    to: "L4",
    flips: "when",
    headline: "You stop starting the work.",
    body: "The agent triggers itself on email, cron, webhook.",
  },
  {
    from: "L4",
    to: "L5",
    flips: "goal",
    headline: "You stop defining the task.",
    body: "The agent owns the mission. You only govern.",
  },
];
