import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { DocumentRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";

export function DocumentsPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Documents</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Files uploaded to project workspaces (links open in a new tab).
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No files yet. Add assets from a project’s workspace.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  File
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Added
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Open
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{r.filename}</p>
                    {r.tags.length > 0 && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{r.tags.join(", ")}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`${base}/projects/${r.projectId}`}
                      className="text-on-surface-variant hover:text-primary hover:underline"
                    >
                      {r.projectTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                    {r.createdAt
                      ? new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
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
      )}
    </div>
  );
}
