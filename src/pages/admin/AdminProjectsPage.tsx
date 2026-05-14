import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { Project } from "../../types/domain";

const STATUS_CLS: Record<string, string> = {
  in_progress: "bg-primary-container text-on-primary-container",
  paused: "bg-tertiary-fixed text-on-tertiary-fixed",
  completed: "bg-secondary-container text-on-secondary-container",
  draft: "bg-surface-variant text-on-surface-variant",
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
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">All projects</h1>
        <p className="text-sm text-on-surface-variant mt-1">Every active initiative across clients and internal teams.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium text-on-surface">{p.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${STATUS_CLS[p.status] ?? STATUS_CLS.draft}`}>
                      {p.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-mono text-xs">{p.ownerId}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-primary border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors no-underline"
                    >
                      Workspace
                    </Link>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-on-surface-variant">No projects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
