import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { DocumentRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, MetricCard, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate } from "../../utils/format";

function extensionLabel(filename: string) {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext && ext !== filename.toUpperCase() ? ext : "FILE";
}

export function DocumentsPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<DocumentRow[]>("/dashboard/documents");
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
      `${row.filename} ${row.projectTitle} ${row.tags.join(" ")}`.toLowerCase().includes(term),
    );
  }, [query, rows]);

  const folders = useMemo(() => {
    const byProject = new Map<string, { projectId: string; title: string; count: number; latest?: string }>();
    for (const row of rows) {
      const current = byProject.get(row.projectId) ?? {
        projectId: row.projectId,
        title: row.projectTitle,
        count: 0,
        latest: row.createdAt,
      };
      current.count += 1;
      if (row.createdAt && (!current.latest || new Date(row.createdAt) > new Date(current.latest))) {
        current.latest = row.createdAt;
      }
      byProject.set(row.projectId, current);
    }
    return [...byProject.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [rows]);

  const taggedCount = rows.filter((row) => row.tags.length > 0).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="Centralized files from project workspaces, grouped by project and ready to open in context."
        actions={
          <>
            <label className="relative block min-w-[240px]">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
                search
              </span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Search files"
              />
            </label>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              Upload file
            </button>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard label="Documents" value={rows.length} icon="description" helper="Uploaded project assets" />
        <MetricCard label="Projects" value={folders.length} icon="folder" helper="With shared files" tone="secondary" />
        <MetricCard label="Tagged" value={taggedCount} icon="sell" helper="Files with metadata" tone="tertiary" />
      </div>

      {folders.length > 0 && (
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {folders.map((folder) => (
            <Link
              key={folder.projectId}
              to={`${base}/projects/${folder.projectId}`}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-on-surface no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="material-symbols-outlined mb-4 text-[34px] text-primary">folder</span>
              <h2 className="line-clamp-1 text-headline-md font-semibold">{folder.title}</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {folder.count} items / Updated {formatDate(folder.latest)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && filteredRows.length === 0 && (
        <EmptyState
          icon="draft"
          title="No documents found"
          description="Files uploaded inside project workspaces will appear here with project links and tags."
        />
      )}

      {!loading && filteredRows.length > 0 && (
        <SurfaceCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-headline-md font-semibold text-on-surface">Recent documents</h2>
            <div className="flex gap-1">
              <button type="button" className="rounded-lg bg-surface-container-high p-2 text-primary" aria-label="List view">
                <span className="material-symbols-outlined text-[20px]">list</span>
              </button>
              <button type="button" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Grid view">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Tags</th>
                  <th className="px-5 py-3">Added</th>
                  <th className="px-5 py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-[10px] font-bold text-primary">
                          {extensionLabel(row.filename)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-on-surface">{row.filename}</p>
                          <p className="text-label-sm text-on-surface-variant">Project asset</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`${base}/projects/${row.projectId}`} className="font-semibold text-on-surface-variant no-underline hover:text-primary">
                        {row.projectTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{row.tags.length > 0 ? row.tags.join(", ") : "-"}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        Open
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
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
