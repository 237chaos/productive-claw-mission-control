import { AGENTS } from "@/lib/agents";
import { readAgentStatus, readLastActivityPerAgent } from "@/lib/workspace";
import TeamClient from "./TeamClient";

export default function TeamPage() {
  const agentStatus = readAgentStatus();
  const lastActivityByAgent = readLastActivityPerAgent();

  const nexus = AGENTS[0];
  const crew = AGENTS.slice(1);

  const nexusStatus = agentStatus["main"] ?? null;
  const nexusLastActivity = lastActivityByAgent["main"] ?? null;

  const missionStatement =
    "Delegate the operational overhead of my life — scheduling, compliance, content research — to a team of specialized AI agents so I can focus on decision-making, vision, and building.";

  return (
    <TeamClient
      nexus={nexus}
      nexusStatus={nexusStatus}
      nexusLastActivity={nexusLastActivity}
      crew={crew}
      lastActivityByAgent={lastActivityByAgent}
      missionStatement={missionStatement}
    />
  );
}
