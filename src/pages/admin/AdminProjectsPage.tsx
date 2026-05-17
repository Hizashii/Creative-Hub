import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project } from "../../types/domain";
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate, titleize } from "../../utils/format";

const statusTone: Record<Project["status"], "primary" | "secondary" | "tertiary" | "neutral"> = {
  in_progress: "primary",
  paused: "tertiary",
  completed: "secondary",
  draft: "neutral",
};

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api<Project[]>("/admin/projects");
        if (!cancelled) setProjects(data);
      } catch {
        if (!cancelled) setProjects([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Portfolio"
        title="All projects"
        description="Every active initiative across clients and internal creative teams."
        actions={
          <Link
            to="/admin/briefs"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">fact_check</span>
            Review briefs
          </Link>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon="folder_open"
          title="No projects yet"
          description="Accepted briefs become projects and will show up in this table."
        />
      ) : (
        <SurfaceCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Workspace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {projects.map((project) => (
                  <tr key={project.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-on-surface">{project.title}</p>
                      {project.description && (
                        <p className="mt-1 line-clamp-1 max-w-md text-label-sm text-on-surface-variant">{project.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill tone={statusTone[project.status]}>{titleize(project.status)}</StatusPill>
                    </td>
                    <td className="px-5 py-4 font-mono text-label-sm text-on-surface-variant">{project.ownerId}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{formatDate(project.updatedAt ?? project.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        Open
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
