import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { CalendarResponse } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";

function dayKey(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function formatDay(key: string) {
  const d = new Date(`${key}T12:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

type CalEvent =
  | { source: "task"; id: string; title: string; at: string; projectId: string; projectTitle: string }
  | { source: "brief"; id: string; title: string; at: string; companyName: string; status: string };

export function CalendarPage() {
  const { base } = useDashboardNav();
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await api<CalendarResponse>("/dashboard/calendar");
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    if (!data) return new Map<string, CalEvent[]>();
    const events: CalEvent[] = [
      ...data.tasks.map((t) => ({
        source: "task" as const,
        id: t.id,
        title: t.title,
        at: t.dueDate,
        projectId: t.projectId,
        projectTitle: t.projectTitle,
      })),
      ...data.briefs.map((b) => ({
        source: "brief" as const,
        id: b.id,
        title: b.title,
        at: b.deadline,
        companyName: b.companyName,
        status: b.status,
      })),
    ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    const map = new Map<string, CalEvent[]>();
    for (const e of events) {
      const k = dayKey(e.at);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [data]);

  const sortedKeys = useMemo(() => [...grouped.keys()].sort(), [grouped]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Calendar</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Task due dates and brief deadlines in one timeline.
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && sortedKeys.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No dated items yet. Add due dates to tasks or submit briefs with deadlines.
        </div>
      )}

      <div className="space-y-6">
        {sortedKeys.map((key) => (
          <section key={key}>
            <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-3">
              {formatDay(key)}
            </h2>
            <ul className="space-y-2">
              {grouped.get(key)!.map((ev) => (
                <li
                  key={`${ev.source}-${ev.id}`}
                  className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    {ev.source === "brief" ? (
                      <Link
                        to={`${base}/briefs/${ev.id}`}
                        className="text-sm font-semibold text-on-surface hover:text-primary"
                      >
                        {ev.title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-on-surface">{ev.title}</p>
                    )}
                    {ev.source === "task" && (
                      <Link
                        to={`${base}/projects/${ev.projectId}`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        {ev.projectTitle}
                      </Link>
                    )}
                    {ev.source === "brief" && (
                      <div className="flex flex-wrap gap-x-2 text-xs text-on-surface-variant mt-0.5">
                        <span>{ev.companyName}</span>
                        <span>·</span>
                        <span>{ev.status}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-medium text-outline shrink-0">
                    {ev.source === "task" ? "Task due" : "Brief deadline"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
