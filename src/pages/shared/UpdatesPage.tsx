import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { FeedItem } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDateTime, getInitials, titleize } from "../../utils/format";

function kindIcon(kind: FeedItem["kind"]) {
  switch (kind) {
    case "feedback":
      return "chat";
    case "asset":
      return "attach_file";
    case "task":
      return "assignment";
    default:
      return "description";
  }
}

function kindTone(kind: FeedItem["kind"]) {
  switch (kind) {
    case "feedback":
      return "primary";
    case "asset":
      return "secondary";
    case "task":
      return "tertiary";
    default:
      return "neutral";
  }
}

export function UpdatesPage() {
  const { base } = useDashboardNav();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<FeedItem[]>("/dashboard/feed");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    return items.reduce<Record<FeedItem["kind"], number>>(
      (acc, item) => {
        acc[item.kind] += 1;
        return acc;
      },
      { feedback: 0, asset: 0, task: 0, brief: 0 },
    );
  }, [items]);

  const activeAuthors = [...new Set(items.map((item) => item.authorName).filter(Boolean))].slice(0, 3) as string[];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Activity"
        title="Recent updates"
        description="Stay synced with the latest feedback, file uploads, task changes, and brief movement."
        actions={
          <>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <Link
              to={`${base}/projects`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
            >
              View projects
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Feedback" value={counts.feedback} icon="chat" helper="Client and team messages" />
        <MetricCard label="Files" value={counts.asset} icon="attach_file" helper="Uploaded assets" tone="secondary" />
        <MetricCard label="Tasks" value={counts.task} icon="assignment" helper="Board activity" tone="tertiary" />
        <MetricCard label="Briefs" value={counts.brief} icon="description" helper="Requirement updates" tone="neutral" />
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && items.length === 0 && (
        <EmptyState
          icon="notifications_off"
          title="No activity yet"
          description="Open a project to add tasks, upload files, or post feedback. New activity will appear here."
        />
      )}

      {!loading && items.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {items.map((item) => (
              <SurfaceCard key={`${item.kind}-${item.id}`} className="p-5">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-primary">
                    <span className="material-symbols-outlined text-[22px]">{kindIcon(item.kind)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <StatusPill tone={kindTone(item.kind)}>{titleize(item.kind)}</StatusPill>
                      <span className="text-label-sm text-outline">{formatDateTime(item.at)}</span>
                    </div>
                    <p className="text-body-lg font-semibold text-on-surface">{item.detail ?? item.title}</p>
                    {item.projectId && (
                      <Link
                        to={`${base}/projects/${item.projectId}`}
                        className="mt-2 inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        {item.projectTitle ?? "Project"}
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </Link>
                    )}
                    {item.kind === "brief" && item.companyName && (
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        {item.companyName}
                        {item.status ? ` / ${item.status}` : ""}
                      </p>
                    )}
                    {item.authorName && (
                      <p className="mt-2 text-label-sm text-on-surface-variant">By {item.authorName}</p>
                    )}
                    {item.kind === "asset" && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        Open file
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    )}
                  </div>
                </div>
              </SurfaceCard>
            ))}
          </div>

          <aside className="space-y-6">
            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Activity insights</h2>
              <div className="space-y-4">
                {[
                  { label: "Total updates", value: items.length },
                  { label: "Project-linked", value: items.filter((item) => item.projectId).length },
                  { label: "Brief updates", value: counts.brief },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between border-b border-outline-variant pb-3 last:border-b-0 last:pb-0">
                    <span className="text-body-sm text-on-surface-variant">{metric.label}</span>
                    <span className="text-headline-md font-bold text-on-surface">{metric.value}</span>
                  </div>
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-label-md font-bold uppercase tracking-[0.08em] text-on-surface">Active now</h2>
              <ul className="space-y-3">
                {activeAuthors.map((author) => (
                  <li key={author} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-secondary">
                      {getInitials(author)}
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface">{author}</p>
                      <p className="text-label-sm text-on-surface-variant">Recently active</p>
                    </div>
                  </li>
                ))}
                {activeAuthors.length === 0 && (
                  <li className="text-body-sm text-on-surface-variant">No named authors in recent activity.</li>
                )}
              </ul>
            </SurfaceCard>

            <SurfaceCard className="bg-primary p-6 text-on-primary">
              <h2 className="mb-2 text-headline-md font-semibold">Project focus</h2>
              <p className="text-body-sm text-on-primary/90">
                Use updates to spot blockers before they turn into missed reviews or stale feedback.
              </p>
            </SurfaceCard>
          </aside>
        </div>
      )}
    </div>
  );
}
