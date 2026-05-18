import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { AcceptBriefResponse, AdminUser, Brief, Project } from "../../types/domain";
import type { ProjectLinkCopy } from "../../interfaces/brief.interfaces";
import type { BriefRouteParams } from "../../types/routes";
import { BriefStatusBadge } from "../../components/briefs/BriefStatusBadge";
import { ClientBriefProgressView } from "../../components/briefs/ClientBriefProgressView";
import { useAuth } from "../../hooks/useAuth";
import { EmptyState, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatCurrency, formatDate, titleize } from "../../utils/format";

export function BriefDetailPage() {
  const { id } = useParams<BriefRouteParams>();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const created = new URLSearchParams(search).get("created") === "1";
  const { user } = useAuth();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [designers, setDesigners] = useState<AdminUser[]>([]);
  const [designerId, setDesignerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const loaded = await api<Brief>(`/briefs/${id}`);
        if (!cancelled) setBrief(loaded);
      } catch {
        if (!cancelled) setBrief(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    let cancelled = false;
    async function loadDesigners() {
      try {
        const users = await api<AdminUser[]>("/admin/users");
        if (!cancelled) setDesigners(users.filter((item) => item.role === "designer"));
      } catch {
        if (!cancelled) setDesigners([]);
      }
    }
    void loadDesigners();
    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  useEffect(() => {
    if (user?.role !== "client" || !brief || brief.status === "submitted") return;
    let cancelled = false;
    const briefId = brief.id;

    async function openLinkedProject() {
      try {
        const projects = await api<Project[]>("/projects");
        const linkedProject = projects.find((project) => project.briefId === briefId);
        if (!cancelled && linkedProject) {
          navigate(`${base}/projects/${linkedProject.id}`, { replace: true });
        }
      } catch {
        // Keep the client on the progress-only brief view if the workspace cannot be resolved.
      }
    }

    void openLinkedProject();
    return () => {
      cancelled = true;
    };
  }, [base, brief, navigate, user?.role]);

  async function accept() {
    if (!id) return;
    setError(null);
    setAccepting(true);
    try {
      const res = await api<AcceptBriefResponse>(`/briefs/${id}/accept`, {
        method: "POST",
        body: JSON.stringify({ designerUserId: user?.role === "admin" ? designerId || undefined : undefined }),
      });
      navigate(`${base}/projects/${res.project.id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not pick up requirement");
    } finally {
      setAccepting(false);
    }
  }

  async function deleteRequirement() {
    if (!id || !window.confirm("Delete this requirement?")) return;
    setError(null);
    setDeleting(true);
    try {
      await api(`/briefs/${id}`, { method: "DELETE" });
      navigate(`${base}/briefs`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not delete requirement");
    } finally {
      setDeleting(false);
    }
  }

  if (!brief) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon="description"
          title="Requirement not found"
          description="The requirement may have been removed or you may not have access to it."
          action={
            <Link to={`${base}/briefs`} className="rounded-lg bg-primary px-4 py-2 text-label-md font-bold text-on-primary no-underline">
              Back to requirements
            </Link>
          }
        />
      </div>
    );
  }

  const canEditClient = user?.role === "client" && brief.clientId === user.id && brief.status === "submitted";
  const canPickUp = (user?.role === "admin" || user?.role === "designer") && brief.status === "submitted";
  const showClientProjectLink =
    user?.role === "client" && ["in-progress", "pending", "completed"].includes(brief.status);
  const projectLinkCopy: Record<string, ProjectLinkCopy> = {
    "in-progress": {
      title: "Picked up",
      body: "A professional has picked this up. Open your projects area to follow the workspace and preview.",
    },
    pending: {
      title: "Ready for approval",
      body: "The professional marked the work all done. Open the project to review the preview and approve it.",
    },
    completed: {
      title: "Completed",
      body: "This requirement has been approved and the project is closed.",
    },
  };

  if (user?.role === "client") {
    return <ClientBriefProgressView brief={brief} base={base} created={created} />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={`${base}/briefs`}
        className="mb-6 inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant no-underline transition-colors hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Requirements
      </Link>

      {created && (
        <div className="mb-6 rounded-xl border border-tertiary-fixed bg-tertiary-fixed/60 p-5 text-tertiary">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            <div>
              <p className="font-bold">Requirement created.</p>
              <p className="mt-1 text-body-sm">Waiting for a professional to pick it up!</p>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        eyebrow={titleize(brief.designType)}
        title={brief.title}
        description={`${brief.companyName} requirement submitted for professional review.`}
        actions={<BriefStatusBadge status={brief.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {brief.status === "submitted" && (
            <SurfaceCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tertiary-fixed text-tertiary">
                  <span className="material-symbols-outlined text-[26px]">hourglass_top</span>
                </div>
                <div>
                  <h2 className="text-headline-md font-semibold text-on-surface">Waiting for a professional to pick it up!</h2>
                  <p className="mt-2 text-body-sm text-on-surface-variant">
                    The requirement is live in the queue. Once a professional accepts it, a project workspace will be created and assigned.
                  </p>
                </div>
              </div>
            </SurfaceCard>
          )}

          <SurfaceCard className="p-6">
            <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Creative brief</h2>
            <p className="whitespace-pre-wrap text-body-sm leading-6 text-on-surface-variant">{brief.description}</p>
          </SurfaceCard>

          <div className="grid gap-5 md:grid-cols-2">
            <SurfaceCard className="p-5">
              <p className="text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">Audience</p>
              <p className="mt-2 text-body-sm text-on-surface">{brief.targetAudience}</p>
            </SurfaceCard>
            <SurfaceCard className="p-5">
              <p className="text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">Style direction</p>
              <p className="mt-2 whitespace-pre-wrap text-body-sm text-on-surface">{brief.stylePreference}</p>
            </SurfaceCard>
          </div>

          {brief.references.length > 0 && (
            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">References</h2>
              <div className="grid gap-2">
                {brief.references.map((reference) => (
                  <a
                    key={reference}
                    href={reference}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-body-sm text-primary no-underline hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span className="truncate">{reference}</span>
                  </a>
                ))}
              </div>
            </SurfaceCard>
          )}
        </div>

        <aside className="space-y-6">
          <SurfaceCard className="p-5">
            <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                <span className="text-body-sm text-on-surface-variant">Status</span>
                <BriefStatusBadge status={brief.status} />
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                <span className="text-body-sm text-on-surface-variant">Deadline</span>
                <span className="text-body-sm font-semibold text-on-surface">{formatDate(brief.deadline)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                <span className="text-body-sm text-on-surface-variant">Budget</span>
                <span className="text-body-sm font-semibold text-on-surface">
                  {brief.budget != null ? formatCurrency(brief.budget) : "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-body-sm text-on-surface-variant">Type</span>
                <StatusPill tone="primary">{titleize(brief.designType)}</StatusPill>
              </div>
            </div>
          </SurfaceCard>

          {canEditClient && (
            <div className="grid gap-3">
              <Link
                to={`${base}/briefs/${brief.id}/edit`}
                className="flex h-11 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-lowest text-label-md font-bold text-on-surface no-underline transition-colors hover:bg-surface-container-low"
              >
                Edit submission
              </Link>
              <button
                type="button"
                onClick={() => void deleteRequirement()}
                disabled={deleting}
                className="flex h-11 items-center justify-center rounded-lg border border-error-container bg-surface-container-lowest text-label-md font-bold text-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete request"}
              </button>
            </div>
          )}

          {showClientProjectLink && (
            <SurfaceCard className="p-5">
              <h2 className="text-headline-md font-semibold text-on-surface">
                {projectLinkCopy[brief.status]?.title ?? "Project ready"}
              </h2>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                {projectLinkCopy[brief.status]?.body ?? "Open your projects area to follow this requirement."}
              </p>
              <Link
                to={`${base}/projects`}
                className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline"
              >
                View projects
              </Link>
            </SurfaceCard>
          )}

          {canPickUp && (
            <SurfaceCard className="p-5">
              <h2 className="mb-2 text-headline-md font-semibold text-on-surface">
                {user?.role === "admin" ? "Assign professional" : "Pick up submission"}
              </h2>
              <p className="mb-4 text-body-sm text-on-surface-variant">
                {user?.role === "admin"
                  ? "This creates a project workspace and assigns the selected professional."
                  : "This creates a project workspace and assigns it to you."}
              </p>
              {error && (
                <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>
              )}
              {user?.role === "admin" && (
                <label className="mb-4 block">
                  <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                    Professional
                  </span>
                  <select
                    className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={designerId}
                    onChange={(event) => setDesignerId(event.target.value)}
                  >
                    <option value="">Assign later</option>
                    {designers.map((designer) => (
                      <option key={designer.id} value={designer.id}>
                        {designer.name} ({designer.email})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                type="button"
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={accepting}
                onClick={() => void accept()}
              >
                <span className="material-symbols-outlined text-[18px]">work</span>
                {accepting ? "Creating workspace..." : "Create project"}
              </button>
            </SurfaceCard>
          )}
        </aside>
      </div>
    </div>
  );
}
