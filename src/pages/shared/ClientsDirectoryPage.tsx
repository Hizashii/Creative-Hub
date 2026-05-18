import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { ClientDirectoryRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { getInitials } from "../../utils/format";

function relationshipTier(projectCount: number, pendingSubmissionCount = 0) {
  if (pendingSubmissionCount > 0) return "Pending";
  if (projectCount >= 8) return "Strategic";
  if (projectCount >= 3) return "Growth";
  if (projectCount > 0) return "Active";
  return "New";
}

export function ClientsDirectoryPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<ClientDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "new">("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<ClientDirectoryRow[]>("/dashboard/clients");
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesTerm = !term || `${row.name} ${row.email}`.toLowerCase().includes(term);
      const matchesFilter =
        filter === "all" ||
        (filter === "pending" && (row.pendingSubmissionCount ?? 0) > 0) ||
        (filter === "active" && row.projectCount > 0) ||
        (filter === "new" && row.projectCount === 0 && (row.pendingSubmissionCount ?? 0) === 0);
      return matchesTerm && matchesFilter;
    });
  }, [filter, query, rows]);

  const activeClients = rows.filter((row) => row.projectCount > 0).length;
  const pendingClients = rows.filter((row) => (row.pendingSubmissionCount ?? 0) > 0).length;
  const pendingSubmissions = rows.reduce((sum, row) => sum + (row.pendingSubmissionCount ?? 0), 0);
  const totalProjects = rows.reduce((sum, row) => sum + row.projectCount, 0);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Relationships"
        title="Clients directory"
        description="Manage agency relationships and keep multi-project progress visible across the workspace."
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add client
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total clients" value={rows.length} icon="person" helper="Accounts on the platform" />
        <MetricCard label="Pending" value={pendingSubmissions} icon="pending_actions" helper={`${pendingClients} clients waiting`} tone="tertiary" />
        <MetricCard label="Active clients" value={activeClients} icon="verified" helper="With at least one project" tone="secondary" />
        <MetricCard label="Total projects" value={totalProjects} icon="folder_open" helper="Owned by clients" tone="tertiary" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all" as const, label: "All clients" },
            { id: "pending" as const, label: "Pending" },
            { id: "active" as const, label: "Active" },
            { id: "new" as const, label: "New" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-4 py-2 text-label-md font-bold transition-colors ${
                filter === item.id
                  ? "border-primary bg-primary-container text-on-primary-container"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="relative block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search clients"
          />
        </label>
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && filteredRows.length === 0 && (
        <EmptyState
          icon="person_search"
          title="No clients found"
          description="Try another search or wait for client accounts to be added through registration."
        />
      )}

      {!loading && filteredRows.length > 0 && (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRows.map((row) => (
            <SurfaceCard key={row.id} className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-fixed text-sm font-bold text-primary">
                      {getInitials(row.name)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-headline-md font-semibold text-on-surface group-hover:text-primary">
                        {row.name}
                      </h2>
                      <p className="truncate text-body-sm text-on-surface-variant">{row.email}</p>
                    </div>
                  </div>
                  <StatusPill tone={(row.pendingSubmissionCount ?? 0) > 0 ? "tertiary" : row.projectCount > 0 ? "secondary" : "neutral"}>
                    {relationshipTier(row.projectCount, row.pendingSubmissionCount)}
                  </StatusPill>
                </div>

                <div className="grid grid-cols-3 gap-4 rounded-lg bg-surface-container-low p-4">
                  <div>
                    <p className="text-label-md font-bold text-on-surface-variant">Pending</p>
                    <p className="mt-1 text-headline-md font-bold text-tertiary">{row.pendingSubmissionCount ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface-variant">Total projects</p>
                    <p className="mt-1 text-headline-md font-bold text-on-surface">{row.projectCount}</p>
                  </div>
                  <div>
                    <p className="text-label-md font-bold text-on-surface-variant">Health</p>
                    <p className={`mt-1 text-headline-md font-bold ${(row.pendingSubmissionCount ?? 0) > 0 ? "text-tertiary" : "text-secondary"}`}>
                      {(row.pendingSubmissionCount ?? 0) > 0 ? "Pending" : row.projectCount > 0 ? "Good" : "New"}
                    </p>
                  </div>
                </div>
                {row.latestSubmissionTitle && (
                  <p className="mt-4 line-clamp-1 text-body-sm text-on-surface-variant">
                    Waiting request: <span className="font-semibold text-on-surface">{row.latestSubmissionTitle}</span>
                  </p>
                )}
              </div>
              <div className="border-t border-outline-variant px-5 py-3">
                <Link
                  to={row.latestSubmissionId ? `${base}/briefs/${row.latestSubmissionId}` : `${base}/projects`}
                  className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                >
                  {row.latestSubmissionId ? "Open pending request" : "View projects"}
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </SurfaceCard>
          ))}
        </section>
      )}
    </div>
  );
}
