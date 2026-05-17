import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project, Brief, AdminUser } from "../../types/domain";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate, titleize } from "../../utils/format";

type Counts = { projects: number; briefs: number; users: number; inProgress: number };

const statusTone: Record<Project["status"], "primary" | "secondary" | "tertiary" | "neutral"> = {
  in_progress: "primary",
  pending: "tertiary",
  completed: "secondary",
  paused: "tertiary",
  draft: "neutral",
};

export function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ projects: 0, briefs: 0, users: 0, inProgress: 0 });
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [projects, briefs, users] = await Promise.all([
          api<Project[]>("/admin/projects"),
          api<Brief[]>("/briefs"),
          api<AdminUser[]>("/admin/users"),
        ]);
        if (!cancelled) {
          setProjects(projects);
          setBriefs(briefs);
          setCounts({
            projects: projects.length,
            briefs: briefs.length,
            users: users.length,
            inProgress: projects.filter((p) => p.status === "in_progress").length,
          });
        }
      } catch {
        if (!cancelled) {
          setProjects([]);
          setBriefs([]);
          setCounts({ projects: 0, briefs: 0, users: 0, inProgress: 0 });
        }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const recentProjects = projects.slice(0, 6);
  const submittedBriefs = briefs.filter((brief) => brief.status === "submitted").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Administration"
        title="Project command center"
        description="Track active work, submitted requirements, and team capacity from one operational view."
        actions={
          <>
            <Link
              to="/admin/briefs"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-label-md font-bold text-on-surface no-underline transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Review briefs
            </Link>
            <Link
              to="/admin/projects"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline shadow-sm transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              All projects
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard value={counts.projects} label="Total projects" icon="folder_open" helper="Across all clients" />
        <MetricCard value={counts.inProgress} label="In progress" icon="pending_actions" helper="Currently moving" />
        <MetricCard value={counts.briefs} label="Requirements" icon="description" helper={`${submittedBriefs} waiting for review`} tone="tertiary" />
        <MetricCard value={counts.users} label="Team members" icon="group" helper="Clients, designers, and admins" tone="secondary" />
      </div>

      <div className="mb-8 flex flex-wrap gap-3 border-b border-outline-variant">
        {["All", "In progress", "Pending", "Paused", "Completed", "Draft"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`flex items-center gap-2 pb-3 text-label-md font-bold transition-colors ${
              index === 0
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {recentProjects.length === 0 ? (
        <EmptyState
          icon="folder_open"
          title="No projects yet"
          description="Accept a submitted brief to create a project workspace with columns, tasks, files, and feedback."
          action={
            <Link
              to="/admin/briefs"
              className="rounded-lg bg-primary px-4 py-2 text-label-md font-bold text-on-primary no-underline"
            >
              Review requirements
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {recentProjects.map((project) => (
            <SurfaceCard key={project.id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <StatusPill tone={statusTone[project.status]}>{titleize(project.status)}</StatusPill>
                    <h2 className="mt-3 line-clamp-2 text-headline-md font-semibold text-on-surface group-hover:text-primary">
                      {project.title}
                    </h2>
                  </div>
                  <span className="material-symbols-outlined text-[22px] text-tertiary-fixed-dim">star</span>
                </div>
                <p className="line-clamp-3 min-h-[60px] text-body-sm text-on-surface-variant">
                  {project.description || "Project workspace ready for tasks, files, milestones, and feedback."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
                  <div>
                    <p className="mb-1 text-label-sm font-bold uppercase tracking-[0.08em] text-outline">
                      Owner
                    </p>
                    <p className="truncate text-label-md font-semibold text-on-surface">{project.ownerId}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-label-sm font-bold uppercase tracking-[0.08em] text-outline">
                      Updated
                    </p>
                    <p className="text-label-md font-semibold text-on-surface">{formatDate(project.updatedAt ?? project.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-outline-variant bg-surface-container-low px-5 py-3">
                <Link
                  to={`/admin/projects/${project.id}`}
                  className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                >
                  Open workspace
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </SurfaceCard>
          ))}
        </div>
      )}

      <SurfaceCard className="mt-8 p-6">
        <h2 className="mb-2 text-headline-md font-semibold text-on-surface">Operations flow</h2>
        <p className="max-w-3xl text-body-sm leading-6 text-on-surface-variant">
          Submitted briefs become project workspaces, designers are assigned from the Teams view, and delivery work is tracked through shared tasks, documents, invoices, and updates.
        </p>
      </SurfaceCard>
      </div>
  );
}
