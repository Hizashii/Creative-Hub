import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import type { CollaboratorRow } from "../../types/dashboard";
import { EmptyState, MetricCard, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { getInitials, titleize } from "../../utils/format";

const roleCopy: Record<string, string> = {
  admin: "Workspace governance, approvals, and delivery coordination.",
  designer: "Creative execution, production tasks, and design reviews.",
  client: "Brief ownership, approvals, and stakeholder feedback.",
};

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

  const grouped = useMemo(() => {
    const map = new Map<string, CollaboratorRow[]>();
    for (const row of rows) {
      if (!map.has(row.role)) map.set(row.role, []);
      map.get(row.role)!.push(row);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const admins = rows.filter((row) => row.role === "admin").length;
  const designers = rows.filter((row) => row.role === "designer").length;
  const clients = rows.filter((row) => row.role === "client").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="People"
        title="Agency teams"
        description="View the collaborators sharing project workspaces with you across clients, designers, and administrators."
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite member
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <MetricCard label="Collaborators" value={rows.length} icon="group" helper="Visible teammates" />
        <MetricCard label="Admins" value={admins} icon="admin_panel_settings" helper="Operational owners" tone="tertiary" />
        <MetricCard label="Designers" value={designers} icon="draw" helper="Creative delivery" tone="secondary" />
        <MetricCard label="Clients" value={clients} icon="person" helper="Project stakeholders" tone="neutral" />
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && rows.length === 0 && (
        <EmptyState
          icon="group_off"
          title="No collaborators yet"
          description="Join a project as a member to see the people you share workspaces with."
        />
      )}

      {!loading && rows.length > 0 && (
        <>
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {grouped.map(([role, members]) => (
              <SurfaceCard key={role} className="p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-headline-md font-semibold text-on-surface">{titleize(role)}</h2>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {roleCopy[role] ?? "Workspace collaborators and contributors."}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-container px-3 py-1 text-label-md font-bold text-on-primary-container">
                    {members.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center gap-3 rounded-lg border border-outline-variant p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-primary">
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-on-surface">{member.name}</p>
                        <p className="truncate text-label-sm text-on-surface-variant">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SurfaceCard>
            ))}
          </section>

          <section className="mt-8 rounded-xl bg-primary p-8 text-on-primary">
            <h2 className="mb-3 text-display-lg-mobile font-bold md:text-display-lg">Cross-team visibility</h2>
            <p className="max-w-2xl text-body-lg text-on-primary/90">
              Keep clients, designers, and administrators aligned around the same briefs, tasks, files, and approvals.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
