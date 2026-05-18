import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../../api/client";
import type { Brief, Project } from "../../types/domain";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { formatDate, titleize } from "../../utils/format";

export function ProjectsBrowsePage() {
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [list, b] = await Promise.all([
        (area === "admin" ? api<Project[]>("/admin/projects") : api<Project[]>("/projects")).catch(() => [] as Project[]),
        area === "designer" ? api<Brief[]>("/briefs").catch(() => [] as Brief[]) : Promise.resolve([] as Brief[]),
      ]);
      if (!cancelled) {
        setProjects(list);
        setBriefs(b);
      }
    }
    void load();
    const interval = window.setInterval(() => { void load(); }, 10000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [area]);

  // Submitted briefs that don't yet have a matching draft project
  const draftBriefIds = new Set(projects.filter((p) => p.briefId).map((p) => p.briefId));
  const pendingBriefs = briefs.filter(
    (b) => b.status === "submitted" && !draftBriefIds.has(b.id)
  );

  const filters = [
    { key: "all", label: "All" },
    { key: "draft", label: area === "designer" ? "Available" : "Draft" },
    { key: "in_progress", label: "In Progress" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "paused", label: "Paused" },
  ];

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);
  const showPending = area === "designer" && (filter === "all" || filter === "draft");
  const availableCount = projects.filter((p) => p.status === "draft").length + pendingBriefs.length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Projects</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Every initiative you can open in the collaborative workspace.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 pb-4 border-b border-outline-variant overflow-x-auto">
        {filters.map((f) => {
          const count =
            f.key === "all"
              ? projects.length + pendingBriefs.length
              : f.key === "draft"
                ? availableCount
                : projects.filter((p) => p.status === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              {f.label}
              <span className="bg-surface-container px-1.5 py-0.5 rounded-full text-[10px]">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Pending briefs (old data, no project yet) */}
      {showPending && pendingBriefs.length > 0 && (
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-on-surface">
              Waiting for pickup
              <span className="ml-2 inline-flex items-center justify-center rounded-full bg-tertiary-fixed px-2 py-0.5 text-label-sm font-bold text-tertiary">
                {pendingBriefs.length}
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pendingBriefs.map((b) => (
              <Link
                key={b.id}
                to={`${base}/briefs/${b.id}`}
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
        </section>
      )}

      {/* Projects grid */}
      {filtered.length === 0 && !showPending ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-sm text-on-surface-variant">No projects to show.</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} to={`${base}/projects/${p.id}`} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
