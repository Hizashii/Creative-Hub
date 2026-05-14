import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { ClientDirectoryRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";

export function ClientsDirectoryPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<ClientDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Clients</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Client accounts and how many owned projects they have on the platform.
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No clients to show yet.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Email
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Projects
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Workspace
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{r.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.email}</td>
                  <td className="px-4 py-3 text-right text-on-surface-variant">{r.projectCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`${base}/projects`} className="text-xs font-semibold text-primary hover:underline">
                      Projects
                    </Link>
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
