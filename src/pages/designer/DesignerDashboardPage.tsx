import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project, Brief } from "../../types/domain";
import { ProjectCard } from "../../components/projects/ProjectCard";
import { BriefCard } from "../../components/briefs/BriefCard";

export function DesignerDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [p, b] = await Promise.all([api<Project[]>("/projects"), api<Brief[]>("/briefs")]);
        if (!cancelled) {
          setProjects(p.slice(0, 5));
          setBriefs(b.slice(0, 4));
        }
      } catch {
        if (!cancelled) {
          setProjects([]);
          setBriefs([]);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Creative Pro Studio</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Work on assigned projects and keep invited client requirements within reach.
          </p>
        </div>
        <Link
          to="/designer/projects"
          className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm no-underline flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">folder_open</span>
          Open projects
        </Link>
      </div>

      {/* Quick-action banner */}
      <div className="bg-primary-container rounded-xl p-6 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-on-primary-container mb-1">Building a project team?</h2>
            <p className="text-sm text-on-primary-container opacity-80">
              Invite another saved designer to an active project from the Teams page.
            </p>
          </div>
          <Link
            to="/designer/teams"
            className="px-4 py-2 bg-on-primary text-primary-container text-xs font-semibold rounded-lg hover:bg-surface-container-lowest transition-colors no-underline whitespace-nowrap"
          >
            Open teams
          </Link>
        </div>
      </div>

      {/* Active projects */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">Your active projects</h2>
          <Link to="/designer/projects" className="text-xs font-semibold text-primary hover:underline no-underline">
            View all
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-3 block">folder_open</span>
            <p className="text-sm text-on-surface-variant">
              You're not assigned to any projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} to={`/designer/projects/${p.id}`} />
            ))}
          </div>
        )}
      </section>

      {/* Open briefs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-on-surface">Assigned requirements</h2>
          <Link to="/designer/briefs" className="text-xs font-semibold text-primary hover:underline no-underline">
            View all
          </Link>
        </div>
        {briefs.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 text-center">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant mb-3 block">description</span>
            <p className="text-sm text-on-surface-variant">
              You only see requirements tied to projects where you are a member.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {briefs.map((b) => (
              <BriefCard key={b.id} brief={b} to={`/designer/briefs/${b.id}`} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
