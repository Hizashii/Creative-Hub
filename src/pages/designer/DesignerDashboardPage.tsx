import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Brief, Project } from "../../types/domain";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { ProjectPreviewModal } from "../../components/projects/ProjectPreviewModal";
import { formatDate, titleize } from "../../utils/format";

export function DesignerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  const load = useCallback(async () => {
    const [p, b] = await Promise.all([
      api<Project[]>("/projects").catch(() => [] as Project[]),
      api<Brief[]>("/briefs").catch(() => [] as Brief[]),
    ]);
    setProjects(p);
    setBriefs(b);
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => { void load(); }, 10000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // Draft projects = auto-created from new brief submissions
  const draftProjects = projects.filter((p) => p.status === "draft");
  const draftBriefIds = new Set(draftProjects.map((p) => p.briefId).filter(Boolean));

  // Submitted briefs that don't yet have a draft project (old data, pre-migration)
  const pendingBriefs = briefs.filter(
    (b) => b.status === "submitted" && !draftBriefIds.has(b.id)
  );

  // Everything a designer can pick up
  const totalAvailable = draftProjects.length + pendingBriefs.length;

  const active = projects.filter(
    (p) => p.status !== "draft" && p.status !== "completed"
  );
  const completed = projects.filter((p) => p.status === "completed");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Creative Pro Studio</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Pick up new client work and manage your active projects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void refresh()}
            disabled={refreshing}
            className="px-4 py-2 border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${refreshing ? "animate-spin" : ""}`}>refresh</span>
            Refresh
          </button>
          <Link
            to="/designer/projects"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm no-underline flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">folder_open</span>
            All projects
          </Link>
        </div>
      </div>

      {/* Available for pickup */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
              Available for pickup
              {totalAvailable > 0 && (
                <span className="inline-flex items-center justify-center rounded-full bg-tertiary-fixed px-2 py-0.5 text-label-sm font-bold text-tertiary">
                  {totalAvailable}
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              New client requests waiting for a designer — click to preview and accept.
            </p>
          </div>
          <Link to="/designer/briefs" className="text-xs font-semibold text-primary hover:underline no-underline">
            View all requests
          </Link>
        </div>

        {totalAvailable === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center">
            <span className="material-symbols-outlined mb-3 block text-[40px] text-on-surface-variant">inbox</span>
            <p className="text-sm text-on-surface-variant">No client requests waiting right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* Draft projects (new flow) */}
            {draftProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                to={`/designer/projects/${p.id}`}
                onPreview={setPreviewProject}
              />
            ))}

            {/* Submitted briefs without a project yet (old data) */}
            {pendingBriefs.map((b) => (
              <Link
                key={b.id}
                to={`/designer/briefs/${b.id}`}
                className="rounded-xl border border-tertiary-fixed/60 bg-surface-container-lowest p-5 text-on-surface no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="rounded-full bg-tertiary-fixed px-2.5 py-1 text-label-sm font-bold text-tertiary">
                    Available
                  </span>
                  <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm font-semibold text-on-surface-variant">
                    {titleize(b.designType)}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-base font-semibold text-on-surface">{b.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{b.companyName}</p>
                <div className="mt-4 border-t border-outline-variant pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-outline">Deadline</p>
                    <p className="text-sm font-bold text-error">{formatDate(b.deadline)}</p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-primary">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Active projects */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface flex items-center gap-2">
            Your active projects
            {active.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-bold text-on-primary-container">
                {active.length}
              </span>
            )}
          </h2>
        </div>
        {active.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-3 block">folder_open</span>
            <p className="text-sm text-on-surface-variant">No active projects yet — pick one up above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {active.map((p) => (
              <ProjectCard key={p.id} project={p} to={`/designer/projects/${p.id}`} />
            ))}
          </div>
        )}
      </section>

      {completed.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-on-surface mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {completed.map((p) => (
              <ProjectCard key={p.id} project={p} to={`/designer/projects/${p.id}`} />
            ))}
          </div>
        </section>
      )}

      {previewProject && (
        <ProjectPreviewModal
          project={previewProject}
          area="designer"
          onClose={() => setPreviewProject(null)}
          onAccepted={() => { setPreviewProject(null); void load(); }}
        />
      )}
    </div>
  );
}
