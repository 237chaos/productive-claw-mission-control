"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Target, Plus, X, Check } from "lucide-react";
import { AGENTS } from "@/lib/agents";
import type { Task, ActivityEntry } from "@/lib/workspace";

// ─── helpers ───────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function agentById(id: string | undefined) {
  return AGENTS.find((a) => a.id === id);
}

// ─── status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Task["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  todo: {
    label: "To Do",
    color: "#8888aa",
    bg: "transparent",
    border: "#5a5a7a50",
  },
  in_progress: {
    label: "In Progress",
    color: "#c084fc",
    bg: "#7c3aed25",
    border: "#7c3aed50",
  },
  blocked: {
    label: "Blocked",
    color: "#f87171",
    bg: "#ef444420",
    border: "#ef444450",
  },
  done: {
    label: "Done",
    color: "#00ffaa",
    bg: "#00ffaa15",
    border: "#00ffaa40",
  },
};

const PRIORITY_CONFIG = {
  high: { label: "High", dot: "#ff4444" },
  medium: { label: "Medium", dot: "#ffb800" },
  low: { label: "Low", dot: "#5a5a7a" },
};

// ─── sub-components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Task["status"] }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="font-mono text-[10px] px-2.5 py-1 rounded-full border font-medium whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

function PriorityCell({ priority }: { priority: Task["priority"] }) {
  const cfg = PRIORITY_CONFIG[priority];
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: cfg.dot }}
      />
      <span className="text-xs text-mc-muted">{cfg.label}</span>
    </span>
  );
}

function OwnerCell({ agentId }: { agentId?: string }) {
  if (!agentId) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-mc-muted">
        <span className="w-5 h-5 rounded-full bg-mc-card border border-mc-border flex items-center justify-center text-[10px]">
          S
        </span>
        Soup
      </span>
    );
  }
  const agent = agentById(agentId);
  if (!agent) return <span className="text-xs text-mc-muted">{agentId}</span>;
  return (
    <span
      className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
      style={{ color: agent.accentColor }}
    >
      <span>{agent.avatar}</span>
      {agent.name === "The Nexus" ? "Maduso" : agent.name}
    </span>
  );
}

function ActivityItem({ entry }: { entry: ActivityEntry }) {
  const agent = agentById(entry.agentId);
  const displayName =
    entry.agentId === "user"
      ? "Soup"
      : agent?.name === "The Nexus"
      ? "Maduso"
      : agent?.name || entry.agentId;
  const accentColor =
    entry.agentId === "user" ? "#8888aa" : agent?.accentColor || "#8888aa";

  const actionText =
    entry.action === "moved" && entry.from && entry.to
      ? `moved → ${STATUS_CONFIG[entry.to as Task["status"]]?.label || entry.to}`
      : entry.action === "completed"
      ? "marked done"
      : entry.action === "created"
      ? "created"
      : entry.action === "deleted"
      ? "deleted"
      : entry.action;

  return (
    <div className="py-3 border-b border-mc-border last:border-0">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="text-xs font-semibold font-mono"
          style={{ color: accentColor }}
        >
          {agent?.avatar || "?"} {displayName}
        </span>
        <span className="text-xs text-mc-muted">{actionText}</span>
      </div>
      <p className="text-[11px] text-mc-muted leading-snug line-clamp-2 mb-1">
        {entry.taskTitle}
      </p>
      <span className="font-mono text-[10px] text-mc-subtle">
        {relativeTime(entry.timestamp)}
      </span>
    </div>
  );
}

// ─── new task form row ───────────────────────────────────────────────────────

function NewTaskRow({
  onSave,
  onCancel,
}: {
  onSave: (data: Partial<Task>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [agent, setAgent] = useState("");

  return (
    <tr className="border-b border-mc-border bg-mc-blue/5">
      <td className="py-3 pl-4 pr-2 w-8">
        <span className="w-5 h-5 rounded-full border border-mc-border flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-mc-border" />
        </span>
      </td>
      <td className="py-2 pr-4">
        <input
          autoFocus
          placeholder="Task title…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && title.trim()) onSave({ title, description, priority, agent: agent || undefined });
            if (e.key === "Escape") onCancel();
          }}
          className="w-full bg-transparent text-sm text-white placeholder:text-mc-muted focus:outline-none mb-1"
        />
        <input
          placeholder="Description (optional)…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-transparent text-xs text-mc-muted placeholder:text-mc-subtle focus:outline-none"
        />
      </td>
      <td className="py-2 pr-4">
        <select
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
          className="bg-mc-card border border-mc-border rounded text-xs text-white px-2 py-1 focus:outline-none focus:border-mc-blue"
        >
          <option value="">Soup</option>
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.avatar} {a.name === "The Nexus" ? "Maduso" : a.name}
            </option>
          ))}
        </select>
      </td>
      <td className="py-2 pr-4">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task["priority"])}
          className="bg-mc-card border border-mc-border rounded text-xs text-white px-2 py-1 focus:outline-none focus:border-mc-blue"
        >
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </td>
      <td className="py-2 pr-4">
        <span className="font-mono text-[10px] text-mc-muted border border-mc-border px-2.5 py-1 rounded-full">
          To Do
        </span>
      </td>
      <td className="py-2 pr-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => title.trim() && onSave({ title, description, priority, agent: agent || undefined })}
            className="w-6 h-6 rounded bg-mc-blue/20 border border-mc-blue/40 flex items-center justify-center text-mc-blue hover:bg-mc-blue/30 transition-colors"
          >
            <Check size={11} />
          </button>
          <button
            onClick={onCancel}
            className="w-6 h-6 rounded bg-mc-card border border-mc-border flex items-center justify-center text-mc-muted hover:text-white transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── task row ────────────────────────────────────────────────────────────────

function TaskRow({
  task,
  onToggleDone,
  onDelete,
}: {
  task: Task;
  onToggleDone: (id: string, current: Task["status"]) => void;
  onDelete: (id: string) => void;
}) {
  const isDone = task.status === "done";

  return (
    <tr className="border-b border-mc-border hover:bg-mc-card/60 transition-colors group">
      {/* Checkbox */}
      <td className="py-3 pl-4 pr-2 w-8">
        <button
          onClick={() => onToggleDone(task.id, task.status)}
          className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
            isDone
              ? "bg-mc-green/20 border-mc-green"
              : "border-mc-border hover:border-mc-blue"
          }`}
        >
          {isDone && <Check size={10} className="text-mc-green" strokeWidth={3} />}
        </button>
      </td>

      {/* Title + description */}
      <td className="py-3 pr-6">
        <div
          className={`text-sm font-medium leading-snug ${
            isDone ? "line-through text-mc-muted" : "text-white"
          }`}
        >
          {task.title}
        </div>
        {task.description && (
          <div className="text-[11px] text-mc-muted mt-0.5 leading-relaxed line-clamp-1">
            {task.description}
          </div>
        )}
      </td>

      {/* Owner */}
      <td className="py-3 pr-6">
        <OwnerCell agentId={task.agent} />
      </td>

      {/* Priority */}
      <td className="py-3 pr-6">
        <PriorityCell priority={task.priority} />
      </td>

      {/* Status */}
      <td className="py-3 pr-4">
        <StatusBadge status={task.status} />
      </td>

      {/* Delete */}
      <td className="py-3 pr-4 w-8">
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-mc-muted hover:text-mc-pink transition-all"
        >
          <X size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

type FilterKey = "all" | Task["status"];

const FILTER_TABS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export default function TasksClient({
  tasks,
  activity,
}: {
  tasks: Task[];
  activity: ActivityEntry[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [agentFilter, setAgentFilter] = useState("everyone");
  const [showNewForm, setShowNewForm] = useState(false);

  // Poll for agent updates every 30s
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 30000);
    return () => clearInterval(interval);
  }, [router]);

  const counts: Record<FilterKey, number> = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  // Unique agents that appear in tasks
  const activeAgentIds = [...new Set(tasks.map((t) => t.agent).filter(Boolean) as string[])];

  const filtered = tasks
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => agentFilter === "everyone" || t.agent === agentFilter);

  async function handleCreate(data: Partial<Task>) {
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowNewForm(false);
    router.refresh();
  }

  async function handleToggleDone(id: string, current: Task["status"]) {
    const newStatus = current === "done" ? "todo" : "done";
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="h-full flex">
      {/* ── Main panel ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <div className="px-8 pt-7 pb-4 border-b border-mc-border flex items-center gap-3 flex-shrink-0">
          <Target size={20} className="text-mc-blue" />
          <h1 className="text-lg font-semibold tracking-tight">Tasks</h1>
          <span className="font-mono text-[11px] text-mc-muted bg-mc-card border border-mc-border rounded-full px-2.5 py-0.5">
            {tasks.length} items
          </span>
          <button
            onClick={() => setShowNewForm(true)}
            className="ml-auto flex items-center gap-1.5 bg-mc-pink text-white text-sm font-semibold px-4 py-2 rounded hover:bg-mc-pink/80 transition-colors"
          >
            <Plus size={15} />
            New
          </button>
        </div>

        {/* Filter bar */}
        <div className="px-8 py-3 border-b border-mc-border flex items-center gap-1.5 flex-shrink-0 flex-wrap">
          {/* Status filters */}
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                filter === key
                  ? "bg-mc-blue/10 text-mc-blue border-mc-blue/40"
                  : "text-mc-muted border-mc-border hover:text-white hover:border-mc-border-bright"
              }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className="ml-1.5 opacity-70">{counts[key]}</span>
              )}
            </button>
          ))}

          {/* Agent filters */}
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={() => setAgentFilter("everyone")}
              className={`font-mono text-xs px-3 py-1.5 rounded border transition-colors ${
                agentFilter === "everyone"
                  ? "bg-mc-card text-white border-mc-border-bright"
                  : "text-mc-muted border-mc-border hover:text-white"
              }`}
            >
              Everyone
            </button>
            {activeAgentIds.map((id) => {
              const agent = agentById(id);
              if (!agent) return null;
              return (
                <button
                  key={id}
                  onClick={() => setAgentFilter(id)}
                  className={`font-mono text-xs px-2.5 py-1.5 rounded border transition-colors ${
                    agentFilter === id
                      ? "border-current text-current"
                      : "text-mc-muted border-mc-border hover:text-white"
                  }`}
                  style={
                    agentFilter === id
                      ? { color: agent.accentColor, borderColor: agent.accentColor + "60" }
                      : {}
                  }
                >
                  {agent.avatar}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mc-border">
                <th className="w-8 pl-4" />
                <th className="py-2.5 pr-6 text-left font-mono text-[10px] text-mc-muted tracking-widest uppercase">
                  Task
                </th>
                <th className="py-2.5 pr-6 text-left font-mono text-[10px] text-mc-muted tracking-widest uppercase whitespace-nowrap">
                  Owner
                </th>
                <th className="py-2.5 pr-6 text-left font-mono text-[10px] text-mc-muted tracking-widest uppercase whitespace-nowrap">
                  Priority
                </th>
                <th className="py-2.5 pr-4 text-left font-mono text-[10px] text-mc-muted tracking-widest uppercase">
                  Status
                </th>
                <th className="w-8 pr-4" />
              </tr>
            </thead>
            <tbody>
              {showNewForm && (
                <NewTaskRow
                  onSave={handleCreate}
                  onCancel={() => setShowNewForm(false)}
                />
              )}
              {filtered.length === 0 && !showNewForm ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <p className="text-mc-muted text-sm">No tasks</p>
                    <p className="font-mono text-[10px] text-mc-subtle mt-1">
                      Hit + New or tell Maduso via Telegram
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggleDone={handleToggleDone}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Activity panel ──────────────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 border-l border-mc-border flex flex-col min-h-0">
        <div className="px-5 py-4 border-b border-mc-border flex-shrink-0">
          <h2 className="font-mono text-xs text-white tracking-widest uppercase">
            Activity
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {activity.length === 0 ? (
            <div className="py-10 text-center text-mc-muted text-xs">
              No activity yet
            </div>
          ) : (
            activity.map((entry) => (
              <ActivityItem key={entry.id} entry={entry} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
