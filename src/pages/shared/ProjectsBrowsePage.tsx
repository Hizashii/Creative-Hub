import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../api/client";
import type { Project } from "../../types/domain";
import { ProjectCard } from "../../components/projects/ProjectCard";

export function ProjectsBrowsePage() {
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = area === "admin" ? await api<Project[]>("/admin/projects") : await api<Project[]>("/projects");
        if (!cancelled) setProjects(list);
      } catch {
        if (!cancelled) setProjects([]);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [area]);

  const filters = [
    { key: "all", label: "All" },
    { key: "in_progress", label: "In Progress" },
    { key: "completed", label: "Completed" },
    { key: "paused", label: "Paused" },
    { key: "draft", label: "Draft" },
  ];

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Projects</h1>
          <p className="text-sm text-on-surface-variant mt-1">Card overview of every initiative you can open in the collaborative workspace.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 pb-4 border-b border-outline-variant overflow-x-auto">
        {filters.map((f) => (
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
            <span className="bg-surface-container px-1.5 py-0.5 rounded-full text-[10px]">
              {f.key === "all" ? projects.length : projects.filter((p) => p.status === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
          <p className="text-sm text-on-surface-variant">No projects to show.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} to={`${base}/projects/${p.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
