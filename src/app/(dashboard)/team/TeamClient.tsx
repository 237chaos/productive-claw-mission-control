"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import type { Agent } from "@/lib/agents";
import type { AgentStatusEntry, AgentLastActivity } from "@/lib/workspace";

interface Props {
  nexus: Agent;
  nexusStatus: AgentStatusEntry | null;
  nexusLastActivity: AgentLastActivity | null;
  crew: Agent[];
  lastActivityByAgent: Record<string, AgentLastActivity>;
  missionStatement: string;
}

function timeSince(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Los_Angeles",
  });
}

export default function TeamClient({
  nexus,
  nexusStatus,
  nexusLastActivity,
  crew,
  lastActivityByAgent,
  missionStatement,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(interval);
  }, [router]);

  const nexusLastSeen =
    nexusStatus?.lastSeen ?? nexusLastActivity?.timestamp ?? null;

  return (
    <div className="px-8 pt-7 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <Users size={20} className="text-mc-blue" />
        <h1 className="text-lg font-semibold tracking-tight">Team</h1>
        <span className="ml-auto font-mono text-[10px] text-mc-muted border border-mc-border rounded px-2 py-0.5">
          7 AGENTS
        </span>
      </div>

      {/* Mission statement */}
      <div className="mb-8 p-4 rounded border border-mc-border bg-mc-card">
        <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-2 uppercase">
          Mission Statement
        </div>
        <p className="text-sm text-white/80 leading-relaxed italic">
          &ldquo;{missionStatement}&rdquo;
        </p>
      </div>

      {/* The Nexus — full-width card */}
      <div className="mb-6">
        <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-3 uppercase">
          Orchestrator
        </div>
        <div className="rounded border border-mc-blue/30 bg-mc-card p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-mc-blue/5 pointer-events-none" />

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded border-2 border-mc-blue/40 flex items-center justify-center text-2xl flex-shrink-0 bg-mc-blue/10">
              {nexus.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="text-white font-semibold text-base">
                  {nexus.name}
                </span>
                <span className="font-mono text-[10px] text-mc-blue border border-mc-blue/40 px-2 py-0.5 rounded">
                  {nexus.role.toUpperCase()}
                </span>
                <span className="flex items-center gap-1.5 ml-auto">
                  <span className="w-2 h-2 rounded-full bg-mc-green inline-block animate-pulse" />
                  <span className="font-mono text-[10px] text-mc-green tracking-wider">
                    ONLINE
                  </span>
                </span>
              </div>

              <p className="text-sm text-mc-muted leading-relaxed mb-3">
                {nexus.description}
              </p>

              <div className="flex gap-2 flex-wrap mb-3">
                <span className="font-mono text-[10px] bg-mc-blue/10 text-mc-blue border border-mc-blue/20 px-2 py-1 rounded">
                  workspace: Maduso
                </span>
                <span className="font-mono text-[10px] bg-mc-card text-mc-muted border border-mc-border px-2 py-1 rounded">
                  channel: Telegram
                </span>
                <span className="font-mono text-[10px] bg-mc-green/10 text-mc-green border border-mc-green/20 px-2 py-1 rounded">
                  model: claude-opus-4-7
                </span>
              </div>

              {/* Live status row */}
              <div className="flex items-center gap-4 pt-3 border-t border-mc-border">
                {nexusLastSeen && (
                  <div>
                    <div className="font-mono text-[9px] text-mc-muted tracking-widest uppercase mb-0.5">
                      Last seen
                    </div>
                    <div className="font-mono text-[11px] text-white/70">
                      {timeSince(nexusLastSeen)}{" "}
                      <span className="text-mc-muted">
                        · {formatTs(nexusLastSeen)}
                      </span>
                    </div>
                  </div>
                )}
                {nexusStatus?.note && (
                  <div className="min-w-0">
                    <div className="font-mono text-[9px] text-mc-muted tracking-widest uppercase mb-0.5">
                      Note
                    </div>
                    <div className="text-[11px] text-white/60 truncate">
                      {nexusStatus.note}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew — 3-column grid */}
      <div className="mb-3">
        <div className="font-mono text-[9px] text-mc-muted tracking-widest mb-3 uppercase">
          Specialist Crew
        </div>
        <div className="grid grid-cols-3 gap-3">
          {crew.map((agent) => {
            const isActive = agent.status === "active";
            const lastActivity = lastActivityByAgent[agent.id] ?? null;

            return (
              <div
                key={agent.id}
                className={`rounded border bg-mc-card p-4 relative transition-opacity ${
                  isActive ? "opacity-100 hover:opacity-90" : "opacity-50 hover:opacity-70"
                }`}
                style={{
                  borderColor: isActive ? agent.accentColor + "40" : undefined,
                }}
              >
                {isActive && (
                  <div
                    className="absolute inset-0 rounded pointer-events-none"
                    style={{ backgroundColor: agent.accentColor + "05" }}
                  />
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded border flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      backgroundColor: agent.accentColor + "15",
                      borderColor: agent.accentColor + "30",
                    }}
                  >
                    {agent.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-sm font-semibold truncate">
                      {agent.name}
                    </div>
                    <div
                      className="font-mono text-[10px] truncate"
                      style={{ color: agent.accentColor }}
                    >
                      {agent.role}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-mc-muted leading-relaxed mb-3">
                  {agent.description}
                </p>

                {/* Status footer */}
                {isActive ? (
                  <div className="border-t border-mc-border pt-2.5 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: agent.accentColor }}
                        />
                        <span
                          className="font-mono text-[10px] tracking-wider"
                          style={{ color: agent.accentColor }}
                        >
                          ACTIVE
                        </span>
                      </div>
                      {agent.workspaceName && (
                        <span
                          className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                          style={{
                            color: agent.accentColor,
                            borderColor: agent.accentColor + "30",
                            backgroundColor: agent.accentColor + "10",
                          }}
                        >
                          ws: {agent.workspaceName}
                        </span>
                      )}
                    </div>

                    {lastActivity ? (
                      <div>
                        <div className="font-mono text-[9px] text-mc-muted mb-0.5">
                          {timeSince(lastActivity.timestamp)} · {lastActivity.action}
                        </div>
                        <div className="text-[10px] text-white/50 truncate">
                          {lastActivity.taskTitle}
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-[9px] text-mc-muted">
                        no activity yet
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-mc-muted inline-block" />
                    <span className="font-mono text-[10px] text-mc-muted tracking-wider">
                      PLANNED
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
