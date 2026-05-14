import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { LeadRow } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";

export function LeadsPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Leads</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Submitted briefs waiting for review. Open a row to read details or accept from the brief page.
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No submitted briefs in the pipeline.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Brief
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Company
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Deadline
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Open
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 font-medium text-on-surface">{r.title}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{r.companyName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    <div>{r.clientName ?? "—"}</div>
                    {r.clientEmail && <div className="text-xs text-outline">{r.clientEmail}</div>}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant capitalize">{r.designType.replace(/-/g, " ")}</td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                    {new Date(r.deadline).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`${base}/briefs/${r.id}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      View
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
