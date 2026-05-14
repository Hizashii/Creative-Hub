import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { DashboardTask } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { useAuth } from "../../hooks/useAuth";

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
  } catch {
    return "—";
  }
}

export function MyTasksPage() {
  const { base } = useDashboardNav();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [mineOnly, setMineOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<DashboardTask[]>("/dashboard/my-tasks");
        if (!cancelled) setTasks(data);
      } catch {
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (!mineOnly || !user) return tasks;
    return tasks.filter((t) => t.assigneeId === user.id);
  }, [tasks, mineOnly, user]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">My tasks</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            All board tasks across projects you can access.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="rounded border-outline-variant text-primary focus:ring-primary"
          />
          Assigned to me
        </label>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && visible.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          {mineOnly ? "No tasks assigned to you." : "No tasks yet. Create tasks inside a project workspace."}
        </div>
      )}

      {!loading && visible.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Task
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Column
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Assignee
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Due
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {visible.map((t) => (
                <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      to={`${base}/projects/${t.projectId}`}
                      className="font-medium text-on-surface hover:text-primary"
                    >
                      {t.title}
                    </Link>
                    {t.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {t.labels.map((lb) => (
                          <span
                            key={lb}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant"
                          >
                            {lb}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    <Link to={`${base}/projects/${t.projectId}`} className="hover:text-primary hover:underline">
                      {t.projectTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{t.columnTitle}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{t.assigneeName ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">{formatDate(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
