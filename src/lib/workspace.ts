import fs from "fs";
import path from "path";

const HOME = process.env.HOME || "";
const WORKSPACE = path.join(HOME, ".openclaw", "workspace");
const OPENCLAW_DIR = path.join(HOME, ".openclaw");

export interface DailyMemory {
  date: string;
  content: string;
  wordCount: number;
  preview: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "blocked" | "done";
  priority: "high" | "medium" | "low";
  agent?: string;
  project?: string;
  created: string;
  updated: string;
}

export interface ActivityEntry {
  id: string;
  agentId: string;
  action: "created" | "moved" | "completed" | "deleted";
  taskId: string;
  taskTitle: string;
  from?: string;
  to?: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  status: string;
  description: string;
  created: string;
  notes: string;
}

export interface CronJob {
  id: string;
  name: string;
  description: string;
  agentId: string;
  schedule: string;
  tz?: string;
  prompt: string;
  enabled: boolean;
  type: "daily" | "recurring" | "one-shot";
  createdAtMs?: number;
}

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function workspacePath(...segments: string[]): string {
  return path.join(WORKSPACE, ...segments);
}

export function readDailyMemories(): DailyMemory[] {
  const memDir = workspacePath("memory");
  try {
    const files = fs
      .readdirSync(memDir)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse();

    return files.map((filename) => {
      const content = readFile(path.join(memDir, filename));
      const date = filename.replace(".md", "");
      const wordCount = content.split(/\s+/).filter(Boolean).length;
      const lines = content.split("\n").filter((l) => l.trim());
      const titleLine = lines.find((l) => l.startsWith("# ")) || lines[0] || "";
      const preview = titleLine.replace(/^#+\s*/, "").slice(0, 72);
      return { date, content, wordCount, preview };
    });
  } catch {
    return [];
  }
}

export function readLongTermMemory(): string {
  return readFile(workspacePath("MEMORY.md"));
}

export function readUserProfile(): string {
  return readFile(workspacePath("USER.md"));
}

export function readTasks(): Task[] {
  const tasksPath = workspacePath("tasks.json");
  try {
    const raw = readFile(tasksPath);
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : parsed.tasks || [];
  } catch {
    return [];
  }
}

export function readProjects(): Project[] {
  const projectsDir = workspacePath("projects");
  try {
    if (!fs.existsSync(projectsDir)) return [];
    const files = fs
      .readdirSync(projectsDir)
      .filter((f) => f.endsWith(".md"));

    return files.map((filename) => {
      const content = readFile(path.join(projectsDir, filename));
      const fm: Record<string, string> = {};
      const match = content.match(/^---\n([\s\S]*?)\n---/);
      if (match) {
        match[1].split("\n").forEach((line) => {
          const colonIdx = line.indexOf(":");
          if (colonIdx > -1) {
            const key = line.slice(0, colonIdx).trim();
            const val = line.slice(colonIdx + 1).trim();
            fm[key] = val;
          }
        });
      }
      const notes = content.replace(/^---[\s\S]*?---\n?/, "").trim();
      return {
        id: filename.replace(".md", ""),
        name: fm.name || filename.replace(".md", ""),
        domain: fm.domain || "general",
        status: fm.status || "active",
        description: fm.description || "",
        created: fm.created || "",
        notes,
      };
    });
  } catch {
    return [];
  }
}

export function readOpenclawConfig(): Record<string, unknown> {
  try {
    const raw = readFile(path.join(OPENCLAW_DIR, "openclaw.json"));
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function readActivity(): ActivityEntry[] {
  const activityPath = workspacePath("activity.json");
  try {
    const raw = readFile(activityPath);
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return (Array.isArray(parsed) ? parsed : []).sort(
      (a: ActivityEntry, b: ActivityEntry) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch {
    return [];
  }
}

export function writeTasksFile(tasks: Task[]): void {
  const tasksPath = workspacePath("tasks.json");
  fs.writeFileSync(tasksPath, JSON.stringify(tasks, null, 2), "utf-8");
}

export function writeActivityFile(entries: ActivityEntry[]): void {
  const activityPath = workspacePath("activity.json");
  fs.writeFileSync(activityPath, JSON.stringify(entries, null, 2), "utf-8");
}

export function appendActivity(entry: Omit<ActivityEntry, "id">): void {
  const existing = readActivity();
  const newEntry: ActivityEntry = {
    ...entry,
    id: `act_${Date.now()}`,
  };
  writeActivityFile([newEntry, ...existing]);
}

export function readCronJobs(): CronJob[] {
  const cronPath = path.join(OPENCLAW_DIR, "cron", "jobs.json");
  try {
    const raw = readFile(cronPath);
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    const jobs: Record<string, unknown>[] = Array.isArray(parsed.jobs)
      ? parsed.jobs
      : [];

    return jobs.map((job) => {
      const scheduleObj = job.schedule as Record<string, unknown> | undefined;
      const expr = (scheduleObj?.expr as string) || "";
      const tz = (scheduleObj?.tz as string) || undefined;

      let type: CronJob["type"] = "recurring";
      if (!expr || expr === "@once") {
        type = "one-shot";
      } else if (expr === "@daily" || expr === "@hourly") {
        type = "daily";
      } else {
        const parts = expr.split(" ");
        if (parts.length === 5) {
          const [, , dom, month, dow] = parts;
          if (dom === "*" && month === "*" && dow === "*") type = "daily";
        }
      }

      const payload = job.payload as Record<string, unknown> | undefined;
      const prompt = (payload?.text as string) || "";

      return {
        id: job.id as string,
        name: (job.name as string) || "",
        description: (job.description as string) || "",
        agentId: (job.agentId as string) || "",
        schedule: expr,
        tz,
        prompt,
        enabled: job.enabled !== false,
        type,
        createdAtMs: job.createdAtMs as number | undefined,
      };
    });
  } catch {
    return [];
  }
}
