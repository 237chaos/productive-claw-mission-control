export type AgentStatus = "online" | "offline" | "planned";

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string; // emoji used as avatar placeholder
  accentColor: string;
  status: AgentStatus;
  workspaceName?: string;
}

export const AGENTS: Agent[] = [
  {
    id: "nexus",
    name: "The Nexus",
    role: "Orchestrator",
    description:
      'Chief of Staff. Single point of contact — performs intent classification, routes tasks to the right specialist, and synthesizes outputs into one response. Currently deployed as "Maduso."',
    avatar: "🐝",
    accentColor: "#0080ff",
    status: "online",
    workspaceName: "Maduso",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    role: "Visa & Compliance",
    description:
      "Monitors visa status, document expiration, and legal notifications to ensure nothing slips through the cracks.",
    avatar: "🛡",
    accentColor: "#ff10f0",
    status: "planned",
  },
  {
    id: "chronos",
    name: "Chronos",
    role: "Calendar & Scheduling",
    description:
      "Manages daily agendas and proactively notifies of upcoming commitments and time-blocks.",
    avatar: "⏱",
    accentColor: "#00ffaa",
    status: "planned",
  },
  {
    id: "prioritizer",
    name: "Prioritizer",
    role: "Task Management",
    description:
      "Ingests the raw to-do list and applies urgency/importance frameworks to maintain a dynamic priority queue.",
    avatar: "◈",
    accentColor: "#ffb800",
    status: "planned",
  },
  {
    id: "wayfinder",
    name: "Wayfinder",
    role: "Travel Planning",
    description:
      "Specialized in logistics, itinerary building, and scouting locations for upcoming trips.",
    avatar: "🧭",
    accentColor: "#ff6b35",
    status: "planned",
  },
  {
    id: "researcher",
    name: "Researcher",
    role: "Content Discovery",
    description:
      "Deep-dives into specific topics to gather facts, data points, and inspiration for writing and decision-making.",
    avatar: "🔬",
    accentColor: "#9b59b6",
    status: "planned",
  },
  {
    id: "architect",
    name: "Architect",
    role: "Content Creation",
    description:
      "Takes researched data and transforms it into structured drafts or final content pieces.",
    avatar: "🏗",
    accentColor: "#e91e8c",
    status: "planned",
  },
];

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}
