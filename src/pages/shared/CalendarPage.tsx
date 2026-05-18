import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { CalendarResponse } from "../../types/dashboard";
import type { CalendarEvent } from "../../types/calendar";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate } from "../../utils/format";

function dayKey(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function deadlineRows(data: CalendarResponse | null) {
  if (!data) return [];
  const rows = data.deadlines ?? data.briefs ?? [];
  return Array.isArray(rows) ? rows : [];
}

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

  const events = useMemo<CalendarEvent[]>(() => {
    return deadlineRows(data)
      .map((deadline) => ({
        id: deadline.id,
        title: deadline.projectTitle ?? deadline.title,
        at: deadline.deadline,
        companyName: deadline.companyName,
        status: deadline.status,
        projectId: deadline.projectId,
        projectTitle: deadline.projectTitle,
      }))
      .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  }, [data]);

  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = dayKey(event.at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  const monthDate = useMemo(() => (events[0] ? new Date(events[0].at) : new Date()), [events]);
  const monthLabel = monthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const calendarCells = useMemo(() => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        date,
        inMonth: date.getMonth() === month,
        items: grouped.get(key) ?? [],
      };
    });
  }, [grouped, monthDate]);

  const upcoming = events.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Schedule"
        title={monthLabel}
        description={`You have ${events.length} project deadline${events.length === 1 ? "" : "s"} in this workspace.`}
      />

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && events.length === 0 && (
        <EmptyState
          icon="event_busy"
          title="No project deadlines yet"
          description="Deadlines from submitted client requirements and their project workspaces will appear here."
        />
      )}

      {!loading && events.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SurfaceCard className="overflow-hidden">
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low text-center text-label-sm font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="px-2 py-3">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarCells.map((cell) => (
                <div
                  key={cell.key}
                  className={`min-h-[118px] border-b border-r border-outline-variant p-2 ${
                    cell.inMonth ? "bg-surface-container-lowest" : "bg-surface-container-low/50 text-outline"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-label-md font-bold">{cell.date.getDate()}</span>
                    {cell.items.length > 0 && (
                      <span className="h-2.5 w-2.5 rounded-full bg-error" aria-label={`${cell.items.length} deadlines`} />
                    )}
                  </div>
                  <div className="space-y-1">
                    {cell.items.slice(0, 2).map((event) => (
                      <Link
                        key={event.id}
                        to={event.projectId ? `${base}/projects/${event.projectId}` : `${base}/briefs/${event.id}`}
                        className="block truncate rounded border border-error/30 bg-error-container px-2 py-1 text-[11px] font-semibold text-on-error-container no-underline hover:bg-error hover:text-on-error"
                      >
                        {event.title}
                      </Link>
                    ))}
                    {cell.items.length > 2 && (
                      <span className="block text-[11px] font-semibold text-outline">+{cell.items.length - 2} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <aside className="space-y-6">
            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Upcoming deadlines</h2>
              <ul className="space-y-4">
                {upcoming.map((event) => (
                  <li key={event.id} className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="rounded-full bg-error-container px-2.5 py-1 text-label-sm font-bold text-on-error-container">
                        Deadline
                      </span>
                      <span className="text-label-sm font-bold text-error">{formatDate(event.at)}</span>
                    </div>
                    <Link
                      to={event.projectId ? `${base}/projects/${event.projectId}` : `${base}/briefs/${event.id}`}
                      className="font-semibold text-on-surface no-underline hover:text-error"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {event.companyName} / {event.status}
                    </p>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Calendar key</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-error/30 bg-error-container/40 p-3">
                  <span className="flex items-center gap-3 text-body-sm font-semibold text-on-surface">
                    <span className="h-3 w-3 rounded-full bg-error" />
                    Project deadlines
                  </span>
                  <span className="text-label-md font-bold text-error">{deadlineRows(data).length}</span>
                </div>
              </div>
            </SurfaceCard>
          </aside>
        </div>
      )}
    </div>
  );
}
