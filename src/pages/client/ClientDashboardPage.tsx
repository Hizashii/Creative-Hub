import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project, Brief } from "../../types/domain";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { BriefCard } from "../../components/briefs/BriefCard";

export function ClientDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [p, b] = await Promise.all([api<Project[]>("/projects"), api<Brief[]>("/briefs")]);
        if (!cancelled) { setProjects(p.slice(0, 4)); setBriefs(b.slice(0, 3)); }
      } catch {
        if (!cancelled) { setProjects([]); setBriefs([]); }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Client Dashboard</h1>
          <p className="text-sm text-on-surface-variant mt-1">Track your projects, review new assets, and jump back into conversation.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/client/briefs/new" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm no-underline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New requirement
          </Link>
          <Link to="/client/projects" className="px-4 py-2 bg-surface-container-lowest text-on-surface text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors no-underline">
            All projects
          </Link>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-on-surface mb-4">Active projects</h2>
        {projects.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <p className="text-sm text-on-surface-variant">No projects yet. Submit a requirement or wait for your team to spin one up.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} to={`/client/projects/${p.id}`} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-base font-semibold text-on-surface mb-4">Recent requirements</h2>
        {briefs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <p className="text-sm text-on-surface-variant">No requirements submitted yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {briefs.map((b) => (
              <BriefCard key={b.id} brief={b} to={`/client/briefs/${b.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
