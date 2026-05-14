import { FolderOpen } from "lucide-react";
import { readProjects, readTasks } from "@/lib/workspace";
import type { Project, Task } from "@/lib/workspace";
import { AGENTS } from "@/lib/agents";

const DOMAIN_STYLES: Record<
  string,
  { label: string; emoji: string; color: string; border: string; bg: string }
> = {
  finance: {
    label: "Finance",
    emoji: "💰",
    color: "#00ffaa",
    border: "#00ffaa40",
    bg: "#00ffaa10",
  },
  wedding: {
    label: "Wedding",
    emoji: "💍",
    color: "#ff10f0",
    border: "#ff10f040",
    bg: "#ff10f010",
  },
  career: {
    label: "Career",
    emoji: "📈",
    color: "#0080ff",
    border: "#0080ff40",
    bg: "#0080ff10",
  },
  general: {
    label: "General",
    emoji: "◈",
    color: "#5a5a7a",
    border: "#5a5a7a40",
    bg: "#5a5a7a10",
  },
};

const STATUS_STYLES: Record<
  Task["status"],
  { label: string; color: string; border: string; bg: string }
> = {
  todo: {
    label: "TODO",
    color: "#5a5a7a",
    border: "#5a5a7a40",
    bg: "#5a5a7a10",
  },
  in_progress: {
    label: "IN PROGRESS",
    color: "#9b59b6",
    border: "#9b59b640",
    bg: "#9b59b610",
  },
  blocked: {
    label: "BLOCKED",
    color: "#ff4444",
    border: "#ff444440",
    bg: "#ff444410",
  },
  done: {
    label: "DONE",
    color: "#00ffaa",
    border: "#00ffaa40",
    bg: "#00ffaa10",
  },
};

function getDomainStyle(domain: string) {
  return DOMAIN_STYLES[domain.toLowerCase()] || DOMAIN_STYLES.general;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

function ProjectCard({
  project,
  tasks,
}: {
  project: Project;
  tasks: Task[];
}) {
  const domain = getDomainStyle(project.domain);
  const taskCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === "done").length;
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  // Show last 3 tasks ordered by updated desc, prioritizing non-done first
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())
    .slice(0, 3);

  const firstNonHeadingNote = project.notes
    ? stripMarkdown(
        project.notes
          .split("\n")
          .filter((l) => l.trim() && !l.startsWith("#"))
          .join(" ")
      ).slice(0, 120)
    : "";

  return (
    <div className="rounded border bg-mc-card p-5 hover:border-mc-border-bright transition-colors flex flex-col gap-4"
      style={{ borderColor: domain.border }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border tracking-wider"
            style={{ color: domain.color, borderColor: domain.border, backgroundColor: domain.bg }}
          >
            {domain.emoji} {domain.label.toUpperCase()}
          </span>
          <span
            className={`font-mono text-[10px] border px-2 py-0.5 rounded ml-auto ${
              project.status === "active"
                ? "text-mc-green border-mc-green/30 bg-mc-green/10"
                : "text-mc-muted border-mc-border"
            }`}
          >
            {project.status.toUpperCase()}
          </span>
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">{project.name}</h3>
        {project.description && (
          <p className="text-mc-muted text-xs leading-relaxed">{project.description}</p>
        )}
        {!project.description && firstNonHeadingNote && (
          <p className="text-mc-muted text-xs leading-relaxed">{firstNonHeadingNote}…</p>
        )}
      </div>

      {/* Task list */}
      {recentTasks.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          {recentTasks.map((task) => {
            const st = STATUS_STYLES[task.status];
            const agent = task.agent ? AGENTS.find((a) => a.id === task.agent) : null;
            return (
              <div
                key={task.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 border border-mc-border bg-mc-base/50"
              >
                <span
                  className="font-mono text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 tracking-wide"
                  style={{ color: st.color, borderColor: st.border, backgroundColor: st.bg }}
                >
                  {st.label}
                </span>
                <span className="text-[11px] text-white/80 truncate flex-1 min-w-0">
                  {task.title}
                </span>
                {agent && (
                  <span className="text-xs flex-shrink-0" title={agent.name}>
                    {agent.avatar}
                  </span>
                )}
              </div>
            );
          })}
          {taskCount > 3 && (
            <div className="font-mono text-[10px] text-mc-muted pl-1">
              +{taskCount - 3} more
            </div>
          )}
        </div>
      ) : (
        <div className="rounded border border-mc-border border-dashed px-3 py-2 text-center">
          <span className="font-mono text-[10px] text-mc-muted">no tasks linked</span>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-mc-muted">
            {doneCount}/{taskCount} done
          </span>
          <span className="font-mono text-[10px]" style={{ color: domain.color }}>
            {progress}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-mc-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: domain.color }}
          />
        </div>
      </div>

      {project.created && (
        <div className="font-mono text-[10px] text-mc-subtle -mt-2">
          Created {project.created}
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const projects = readProjects();
  const allTasks = readTasks();

  return (
    <div className="px-8 pt-7 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <FolderOpen size={20} className="text-mc-blue" />
        <h1 className="text-lg font-semibold tracking-tight">Projects</h1>
        <span className="font-mono text-[10px] text-mc-muted border border-mc-border rounded px-2 py-0.5 ml-auto">
          {projects.length} PROJECTS
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded border border-mc-border bg-mc-card p-10 text-center">
          <FolderOpen size={28} className="text-mc-muted mx-auto mb-3" />
          <p className="text-white font-medium mb-1">No projects yet</p>
          <p className="text-mc-muted text-sm mb-4">
            Projects collect related tasks under a single goal.
          </p>
          <p className="font-mono text-[11px] text-mc-subtle leading-relaxed">
            Create a <code className="text-mc-blue">.md</code> file in{" "}
            <code className="text-mc-blue">~/.openclaw/workspace/projects/</code>
            <br />
            with frontmatter:{" "}
            <code className="text-mc-blue">name</code>,{" "}
            <code className="text-mc-blue">domain</code>,{" "}
            <code className="text-mc-blue">status</code>,{" "}
            <code className="text-mc-blue">description</code>
            <br />
            Then set <code className="text-mc-blue">&quot;project&quot;: &quot;filename-without-md&quot;</code> on tasks in tasks.json.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-4xl xl:grid-cols-3">
          {projects.map((project) => {
            // Tasks linked by project field on the task, OR by taskIds in frontmatter
            const linkedByField = allTasks.filter((t) => t.project === project.id);
            const linkedByFrontmatter = project.taskIds.length > 0
              ? allTasks.filter((t) => project.taskIds.includes(t.id))
              : [];
            // Merge, deduplicate
            const seen = new Set<string>();
            const projectTasks = [...linkedByField, ...linkedByFrontmatter].filter((t) => {
              if (seen.has(t.id)) return false;
              seen.add(t.id);
              return true;
            });

            return (
              <ProjectCard
                key={project.id}
                project={project}
                tasks={projectTasks}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
