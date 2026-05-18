import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiRequestError } from "../../api/client";
import type { CollaboratorRow, DesignerDirectoryRow } from "../../types/dashboard";
import type { Project } from "../../types/domain";
import { EmptyState, MetricCard, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { getInitials, titleize } from "../../utils/format";

const roleCopy: Record<string, string> = {
  admin: "Workspace governance, approvals, and delivery coordination.",
  designer: "Creative execution, production tasks, and design reviews.",
  client: "Brief ownership, approvals, and stakeholder feedback.",
};

export function CollaboratorsPage() {
  const [rows, setRows] = useState<CollaboratorRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [designers, setDesigners] = useState<DesignerDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDesigner, setSelectedDesigner] = useState<DesignerDirectoryRow | null>(null);
  const [designerQuery, setDesignerQuery] = useState("");
  const [invitePending, setInvitePending] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collaborators, projectRows, designerRows] = await Promise.all([
        api<CollaboratorRow[]>("/dashboard/collaborators"),
        api<Project[]>("/projects"),
        api<DesignerDirectoryRow[]>("/dashboard/designers"),
      ]);
      setRows(collaborators);
      setProjects(projectRows);
      setDesigners(designerRows);
      setSelectedProjectId((current) => current || projectRows[0]?.id || "");
    } catch {
      setRows([]);
      setProjects([]);
      setDesigners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, CollaboratorRow[]>();
    for (const row of rows) {
      if (!map.has(row.role)) map.set(row.role, []);
      map.get(row.role)!.push(row);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  const filteredDesigners = useMemo(() => {
    const query = designerQuery.trim().toLowerCase();
    if (!query) return designers;
    return designers.filter((designer) => `${designer.name} ${designer.email}`.toLowerCase().includes(query));
  }, [designerQuery, designers]);

  const admins = rows.filter((row) => row.role === "admin").length;
  const designerCount = rows.filter((row) => row.role === "designer").length;
  const clients = rows.filter((row) => row.role === "client").length;

  async function inviteDesigner(event: FormEvent) {
    event.preventDefault();
    if (!selectedProjectId || !selectedDesigner) return;

    setInvitePending(true);
    setInviteError(null);
    setInviteNotice(null);
    try {
      await api(`/projects/${selectedProjectId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId: selectedDesigner.id, memberRole: "member" }),
      });
      setInviteNotice(`${selectedDesigner.name} was added to the project team.`);
      setSelectedDesigner(null);
      setDesignerQuery("");
      await load();
    } catch (err) {
      setInviteError(err instanceof ApiRequestError ? err.message : "Could not invite designer");
    } finally {
      setInvitePending(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="People"
        title="Agency teams"
        description="View collaborators, invite designers, and build project teams around active work."
        actions={
          <button
            type="button"
            onClick={() => {
              setInviteOpen((open) => !open);
              setInviteError(null);
              setInviteNotice(null);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">{inviteOpen ? "close" : "person_add"}</span>
            {inviteOpen ? "Close invite" : "Invite member"}
          </button>
        }
      />

      {inviteOpen && (
        <SurfaceCard className="mb-8 p-5">
          <form onSubmit={(event) => void inviteDesigner(event)} className="grid gap-4 lg:grid-cols-[minmax(220px,0.8fr)_minmax(280px,1fr)_auto] lg:items-end">
            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Project
              </span>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {projects.length === 0 ? (
                  <option value="">No projects available</option>
                ) : (
                  projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))
                )}
              </select>
            </label>

            <div className="relative">
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Designer
                </span>
                <input
                  value={selectedDesigner ? `${selectedDesigner.name} (${selectedDesigner.email})` : designerQuery}
                  onChange={(event) => {
                    setSelectedDesigner(null);
                    setDesignerQuery(event.target.value);
                  }}
                  onFocus={() => setSelectedDesigner(null)}
                  placeholder="Search designers..."
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              {!selectedDesigner && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-lg">
                  {filteredDesigners.length === 0 ? (
                    <p className="px-3 py-3 text-body-sm text-on-surface-variant">No designers found.</p>
                  ) : (
                    filteredDesigners.map((designer) => (
                      <button
                        key={designer.id}
                        type="button"
                        onClick={() => {
                          setSelectedDesigner(designer);
                          setDesignerQuery("");
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-container-low"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-primary">
                          {getInitials(designer.name)}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-body-sm font-semibold text-on-surface">{designer.name}</span>
                          <span className="block truncate text-label-sm text-on-surface-variant">{designer.email}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedProjectId || !selectedDesigner || invitePending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {invitePending ? "Inviting..." : "Add to team"}
            </button>
          </form>
          {inviteError && <p className="mt-3 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{inviteError}</p>}
          {inviteNotice && <p className="mt-3 rounded-lg bg-secondary-container p-3 text-body-sm font-semibold text-secondary">{inviteNotice}</p>}
        </SurfaceCard>
      )}

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <MetricCard label="Collaborators" value={rows.length} icon="group" helper="Visible teammates" />
        <MetricCard label="Admins" value={admins} icon="admin_panel_settings" helper="Operational owners" tone="tertiary" />
        <MetricCard label="Designers" value={designerCount} icon="draw" helper="Creative delivery" tone="secondary" />
        <MetricCard label="Clients" value={clients} icon="person" helper="Project stakeholders" tone="neutral" />
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && rows.length === 0 && (
        <EmptyState
          icon="group_off"
          title="No collaborators yet"
          description="Invite another designer to one of your projects to start building a team."
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
