import { FolderOpen } from "lucide-react";
import { readProjects, readTasks } from "@/lib/workspace";
import type { Project } from "@/lib/workspace";

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

function getDomainStyle(domain: string) {
  return (
    DOMAIN_STYLES[domain.toLowerCase()] ||
    DOMAIN_STYLES.general
  );
}

function ProjectCard({
  project,
  taskCount,
  doneCount,
}: {
  project: Project;
  taskCount: number;
  doneCount: number;
}) {
  const domain = getDomainStyle(project.domain);
  const progress = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

  return (
    <div className="rounded border border-mc-border bg-mc-card p-5 hover:border-mc-border-bright transition-colors">
      {/* Domain badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded border tracking-wider"
          style={{
            color: domain.color,
            borderColor: domain.border,
            backgroundColor: domain.bg,
          }}
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

      {/* Name */}
      <h3 className="text-white font-semibold text-base mb-1">{project.name}</h3>

      {/* Description */}
      {project.description && (
        <p className="text-mc-muted text-xs leading-relaxed mb-4">
          {project.description}
        </p>
      )}

      {/* Notes preview */}
      {project.notes && (
        <p className="text-mc-muted text-xs leading-relaxed mb-4 line-clamp-2 border-l-2 border-mc-border pl-3">
          {project.notes}
        </p>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-mc-muted">
            {doneCount}/{taskCount} tasks
          </span>
          <span
            className="font-mono text-[10px]"
            style={{ color: domain.color }}
          >
            {progress}%
          </span>
        </div>
        <div className="h-1 rounded-full bg-mc-border overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: domain.color,
            }}
          />
        </div>
      </div>

      {project.created && (
        <div className="mt-3 font-mono text-[10px] text-mc-subtle">
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
            Projects connect tasks, memories, and docs under a single goal.
          </p>
          <p className="font-mono text-[11px] text-mc-subtle leading-relaxed">
            Create a{" "}
            <code className="text-mc-blue">.md</code> file in{" "}
            <code className="text-mc-blue">~/.openclaw/workspace/projects/</code>
            <br />
            with frontmatter:{" "}
            <code className="text-mc-blue">name</code>,{" "}
            <code className="text-mc-blue">domain</code>,{" "}
            <code className="text-mc-blue">status</code>,{" "}
            <code className="text-mc-blue">description</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 max-w-4xl xl:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = allTasks.filter(
              (t) => t.project === project.id
            );
            const doneTasks = projectTasks.filter(
              (t) => t.status === "done"
            );
            return (
              <ProjectCard
                key={project.id}
                project={project}
                taskCount={projectTasks.length}
                doneCount={doneTasks.length}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
