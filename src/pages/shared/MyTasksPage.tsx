import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { DashboardTask } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { useAuth } from "../../hooks/useAuth";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { daysUntil, formatDate } from "../../utils/format";

function isCompleted(task: DashboardTask) {
  return /done|complete|approved|closed/i.test(task.columnTitle);
}

function dueTone(iso?: string) {
  const days = daysUntil(iso);
  if (days === null) return "neutral";
  if (days < 0) return "error";
  if (days <= 3) return "tertiary";
  return "secondary";
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
    return tasks.filter((task) => task.assigneeId === user.id);
  }, [mineOnly, tasks, user]);

  const completed = tasks.filter(isCompleted).length;
  const pending = tasks.length - completed;
  const dueThisWeek = tasks.filter((task) => {
    const days = daysUntil(task.dueDate);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  const recentProjects = useMemo(() => {
    const byProject = new Map<string, { projectId: string; title: string; pending: number }>();
    for (const task of tasks) {
      const current = byProject.get(task.projectId) ?? {
        projectId: task.projectId,
        title: task.projectTitle,
        pending: 0,
      };
      if (!isCompleted(task)) current.pending += 1;
      byProject.set(task.projectId, current);
    }
    return [...byProject.values()].sort((a, b) => b.pending - a.pending).slice(0, 3);
  }, [tasks]);

  const upcoming = visible
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Tasks"
        title={`Welcome back${user?.name ? `, ${user.name.split(" ")[0]}` : ""}.`}
        description={`You have ${dueThisWeek} tasks due this week across ${recentProjects.length} active projects.`}
        actions={
          <>
            <div className="inline-flex rounded-lg bg-surface-container-low p-1">
              <button
                type="button"
                onClick={() => setMineOnly(false)}
                className={`rounded-md px-4 py-2 text-label-md font-bold transition-colors ${
                  !mineOnly ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                All tasks
              </button>
              <button
                type="button"
                onClick={() => setMineOnly(true)}
                className={`rounded-md px-4 py-2 text-label-md font-bold transition-colors ${
                  mineOnly ? "bg-surface-container-lowest text-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                Assigned to me
              </button>
            </div>
            <Link
              to={`${base}/projects`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              Open projects
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard label="Completed" value={completed} icon="check_circle" helper="Tasks in done columns" tone="secondary" />
        <MetricCard label="Pending" value={pending} icon="pending_actions" helper="Still in progress" />
        <MetricCard label="Due this week" value={dueThisWeek} icon="event" helper="Needs attention" tone="tertiary" />
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && visible.length === 0 && (
        <EmptyState
          icon="assignment_turned_in"
          title={mineOnly ? "No tasks assigned to you" : "No tasks yet"}
          description={mineOnly ? "Switch to all tasks to see the full project queue." : "Create tasks inside a project workspace to populate this view."}
        />
      )}

      {!loading && visible.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SurfaceCard className="overflow-hidden">
            <div className="border-b border-outline-variant px-5 py-4">
              <h2 className="text-headline-md font-semibold text-on-surface">Priority queue</h2>
            </div>
            <ul className="divide-y divide-outline-variant">
              {visible.slice(0, 8).map((task) => (
                <li key={task.id} className="group p-5 transition-colors hover:bg-surface-container-low">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <StatusPill tone={dueTone(task.dueDate)}>
                          {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                        </StatusPill>
                        <StatusPill tone="neutral">{task.columnTitle || "Backlog"}</StatusPill>
                      </div>
                      <Link
                        to={`${base}/projects/${task.projectId}`}
                        className="text-body-lg font-semibold text-on-surface no-underline group-hover:text-primary"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="mt-2 line-clamp-2 max-w-3xl text-body-sm text-on-surface-variant">{task.description}</p>
                      )}
                      {task.labels.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {task.labels.map((label) => (
                            <span key={label} className="rounded-full bg-surface-container-high px-2 py-1 text-label-sm font-semibold text-on-surface-variant">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-left lg:text-right">
                      <Link to={`${base}/projects/${task.projectId}`} className="font-semibold text-primary no-underline hover:underline">
                        {task.projectTitle}
                      </Link>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        {task.assigneeName ?? "Unassigned"}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </SurfaceCard>

          <aside className="space-y-6">
            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Recent projects</h2>
              <ul className="space-y-3">
                {recentProjects.map((project) => (
                  <li key={project.projectId}>
                    <Link
                      to={`${base}/projects/${project.projectId}`}
                      className="flex items-center justify-between rounded-lg border border-outline-variant p-3 text-on-surface no-underline transition-colors hover:bg-surface-container-low"
                    >
                      <span className="font-semibold">{project.title}</span>
                      <span className="text-label-sm text-on-surface-variant">{project.pending} pending</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Upcoming this week</h2>
              <ul className="space-y-3">
                {upcoming.map((task) => (
                  <li key={task.id} className="rounded-lg bg-surface-container-low p-3">
                    <p className="font-semibold text-on-surface">{task.title}</p>
                    <p className="mt-1 text-label-sm text-on-surface-variant">{formatDate(task.dueDate)}</p>
                  </li>
                ))}
                {upcoming.length === 0 && (
                  <li className="text-body-sm text-on-surface-variant">No upcoming due dates.</li>
                )}
              </ul>
            </SurfaceCard>
          </aside>
        </div>
      )}
    </div>
  );
}
