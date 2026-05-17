import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { LeadRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { daysUntil, formatDate, titleize } from "../../utils/format";

function urgencyTone(deadline: string) {
  const days = daysUntil(deadline);
  if (days === null) return "neutral";
  if (days < 0) return "error";
  if (days <= 7) return "tertiary";
  return "secondary";
}

export function LeadsPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<LeadRow[]>("/dashboard/leads");
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
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.title} ${row.companyName} ${row.clientName ?? ""} ${row.clientEmail ?? ""} ${row.designType}`
        .toLowerCase()
        .includes(term),
    );
  }, [query, rows]);

  const newThisMonth = rows.filter((row) => {
    if (!row.createdAt) return false;
    return Date.now() - new Date(row.createdAt).getTime() <= 30 * 86_400_000;
  }).length;
  const dueSoon = rows.filter((row) => {
    const days = daysUntil(row.deadline);
    return days !== null && days >= 0 && days <= 14;
  }).length;
  const designTypes = new Set(rows.map((row) => row.designType)).size;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Pipeline"
        title="Leads pipeline"
        description="Submitted briefs waiting for review, prioritization, and conversion into project workspaces."
        actions={
          <>
            <label className="relative block min-w-[260px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search leads"
              />
            </label>
            <Link
              to={`${base}/briefs`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              Review briefs
            </Link>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <MetricCard label="Total leads" value={rows.length} icon="analytics" helper="Submitted briefs" />
        <MetricCard label="New leads (30d)" value={newThisMonth} icon="fiber_new" helper="Recently created" tone="secondary" />
        <MetricCard label="Design types" value={designTypes} icon="category" helper="Project categories" tone="tertiary" />
        <MetricCard label="Due soon" value={dueSoon} icon="schedule" helper="Within 14 days" tone="error" />
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && filteredRows.length === 0 && (
        <EmptyState
          icon="inbox"
          title="No leads in the pipeline"
          description="Submitted client briefs will appear here until they are accepted into active projects."
        />
      )}

      {!loading && filteredRows.length > 0 && (
        <SurfaceCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">Brief</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Deadline</th>
                  <th className="px-5 py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-on-surface">{row.title}</p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">Source: brief form</p>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{row.companyName}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-on-surface">{row.clientName ?? "-"}</p>
                      {row.clientEmail && <p className="mt-1 text-label-sm text-on-surface-variant">{row.clientEmail}</p>}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill tone="primary">{titleize(row.designType)}</StatusPill>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-on-surface">{formatDate(row.deadline)}</span>
                        <StatusPill tone={urgencyTone(row.deadline)}>
                          {daysUntil(row.deadline) !== null && daysUntil(row.deadline)! < 0 ? "Overdue" : "On track"}
                        </StatusPill>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`${base}/briefs/${row.id}`}
                        className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        View
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
