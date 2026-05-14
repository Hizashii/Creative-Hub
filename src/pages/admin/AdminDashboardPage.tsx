import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project, Brief, AdminUser } from "../../types/domain";

type Counts = { projects: number; briefs: number; users: number; inProgress: number };

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
        </div>
      </div>
      <p className="text-[32px] font-bold text-on-surface tracking-tight">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [counts, setCounts] = useState<Counts>({ projects: 0, briefs: 0, users: 0, inProgress: 0 });

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
          setCounts({
            projects: projects.length,
            briefs: briefs.length,
            users: users.length,
            inProgress: projects.filter((p) => p.status === "in_progress").length,
          });
        }
      } catch {
        if (!cancelled) setCounts({ projects: 0, briefs: 0, users: 0, inProgress: 0 });
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Admin overview</h1>
          <p className="text-sm text-on-surface-variant mt-1">High-level snapshot of active work, incoming requirements, and team size.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/briefs" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm no-underline">
            Review requirements
          </Link>
          <Link to="/admin/projects" className="px-4 py-2 bg-surface-container-lowest text-on-surface text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors no-underline">
            All projects
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard value={counts.projects} label="Total projects" icon="folder_open" />
        <StatCard value={counts.inProgress} label="In progress" icon="pending" />
        <StatCard value={counts.briefs} label="Requirements" icon="description" />
        <StatCard value={counts.users} label="Team members" icon="group" />
      </div>

      {/* Info card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
        <h2 className="text-base font-semibold text-on-surface mb-2">Operations</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Accept submitted briefs to spawn a project with default columns, assign designers from the Users screen, and keep delivery moving from the shared workspace.
        </p>
      </div>
    </div>
  );
}
