import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { CalendarResponse } from "../../types/dashboard";
import type { CalendarEvent } from "../../types/calendar";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate } from "../../utils/format";

function dayKey(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return iso;
  }
}

function eventTone(source: CalendarEvent["source"]) {
  return source === "task" ? "primary" : "tertiary";
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
    if (!data) return [];
    return [
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
        description={`You have ${events.length} dated tasks and brief deadlines in this workspace.`}
        actions={
          <>
            <div className="inline-flex rounded-lg bg-surface-container-low p-1">
              {["Month", "Week", "Day"].map((view, index) => (
                <button
                  key={view}
                  type="button"
                  className={`rounded-md px-4 py-2 text-label-md font-bold transition-colors ${
                    index === 0
                      ? "bg-surface-container-lowest text-primary shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add event
            </button>
          </>
        }
      />

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && events.length === 0 && (
        <EmptyState
          icon="event_busy"
          title="No dated items yet"
          description="Add due dates to project tasks or submit briefs with deadlines to populate this schedule."
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
                      <span className="h-2 w-2 rounded-full bg-primary" aria-label={`${cell.items.length} events`} />
                    )}
                  </div>
                  <div className="space-y-1">
                    {cell.items.slice(0, 2).map((event) => (
                      <Link
                        key={`${event.source}-${event.id}`}
                        to={event.source === "task" ? `${base}/projects/${event.projectId}` : `${base}/briefs/${event.id}`}
                        className="block truncate rounded bg-surface-container px-2 py-1 text-[11px] font-semibold text-on-surface no-underline hover:bg-primary-container hover:text-on-primary-container"
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
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Upcoming events</h2>
              <ul className="space-y-4">
                {upcoming.map((event) => (
                  <li key={`${event.source}-${event.id}`} className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StatusPill tone={eventTone(event.source)}>{event.source === "task" ? "Task" : "Brief"}</StatusPill>
                      <span className="text-label-sm text-outline">{formatDate(event.at)}</span>
                    </div>
                    <Link
                      to={event.source === "task" ? `${base}/projects/${event.projectId}` : `${base}/briefs/${event.id}`}
                      className="font-semibold text-on-surface no-underline hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {event.source === "task" ? event.projectTitle : `${event.companyName} / ${event.status}`}
                    </p>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Filters</h2>
              <div className="space-y-3">
                {[
                  { label: "Tasks", count: data?.tasks.length ?? 0, color: "bg-primary" },
                  { label: "Briefs", count: data?.briefs.length ?? 0, color: "bg-tertiary-fixed-dim" },
                ].map((filter) => (
                  <div key={filter.label} className="flex items-center justify-between rounded-lg border border-outline-variant p-3">
                    <span className="flex items-center gap-3 text-body-sm font-semibold text-on-surface">
                      <span className={`h-3 w-3 rounded-full ${filter.color}`} />
                      {filter.label}
                    </span>
                    <span className="text-label-md text-on-surface-variant">{filter.count}</span>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </aside>
        </div>
      )}
    </div>
  );
}
