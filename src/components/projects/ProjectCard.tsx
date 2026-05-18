import { Link } from "react-router-dom";
import type { ProjectCardProps, ProjectStatusDisplayConfig } from "../../interfaces/project.interfaces";

const STATUS = {
  in_progress: { label: "In progress", cls: "bg-primary-container text-on-primary-container" },
  pending: { cls: "bg-tertiary-fixed text-on-tertiary-fixed", label: "Pending" },
  paused: { cls: "bg-tertiary-fixed text-on-tertiary-fixed", label: "Paused" },
  completed: { cls: "bg-secondary-container text-on-secondary-container", label: "Completed" },
  draft: { cls: "bg-surface-variant text-on-surface-variant", label: "Draft" },
} satisfies Record<string, ProjectStatusDisplayConfig>;

const PROGRESS: Record<string, number> = {
  completed: 100,
  pending: 90,
  in_progress: 66,
  paused: 40,
  draft: 20,
};

export function ProjectCard({ project, to }: ProjectCardProps) {
  const s = STATUS[project.status] ?? STATUS.draft;
  const pct = PROGRESS[project.status] ?? 20;

  return (
    <Link
      to={to}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col no-underline group"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug flex-1 mr-2">
          {project.title}
        </h3>
        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${s.cls}`}>
          {s.label}
        </span>
      </div>

      <p className="text-sm text-on-surface-variant mb-4 flex-1 line-clamp-2">
        {project.description || "No description provided."}
      </p>

      <div className="mt-auto">
        <div className="flex justify-between text-xs text-on-surface-variant mb-2">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
            Tasks
          </span>
          <span>{pct}% completed</span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </Link>
  );
}
