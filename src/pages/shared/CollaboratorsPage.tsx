import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { CollaboratorRow } from "../../types/dashboard";

export function CollaboratorsPage() {
  const [rows, setRows] = useState<CollaboratorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<CollaboratorRow[]>("/dashboard/collaborators");
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Team</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          People you share projects with—clients, designers, and admins on the same boards.
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && rows.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No collaborators yet. Join a project as a member to see teammates here.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
            >
              <div>
                <p className="text-sm font-semibold text-on-surface">{r.name}</p>
                <p className="text-xs text-on-surface-variant">{r.email}</p>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{r.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
