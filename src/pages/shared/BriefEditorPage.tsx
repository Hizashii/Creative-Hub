import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Brief, DesignType } from "../../types/domain";
import { EmptyState, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";

const designTypes: { value: DesignType; label: string; icon: string }[] = [
  { value: "logo", label: "Logo", icon: "signature" },
  { value: "poster", label: "Poster", icon: "newspaper" },
  { value: "branding", label: "Branding", icon: "palette" },
  { value: "social-media", label: "Social media", icon: "grid_view" },
  { value: "website", label: "Website", icon: "language" },
];

function toDateInputValue(iso: string) {
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function BriefEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [error, setError] = useState<string | null>(null);
  const [brief, setBrief] = useState<Brief | null>(null);
  const [fields, setFields] = useState({
    title: "",
    companyName: "",
    designType: "logo" as DesignType,
    description: "",
    targetAudience: "",
    stylePreference: "",
    deadline: "",
    budget: "",
    references: "",
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function load() {
      try {
        const loaded = await api<Brief>(`/briefs/${id}`);
        if (!cancelled) {
          setBrief(loaded);
          setFields({
            title: loaded.title,
            companyName: loaded.companyName,
            designType: loaded.designType,
            description: loaded.description,
            targetAudience: loaded.targetAudience,
            stylePreference: loaded.stylePreference,
            deadline: toDateInputValue(loaded.deadline),
            budget: loaded.budget != null ? String(loaded.budget) : "",
            references: loaded.references.join("\n"),
          });
        }
      } catch {
        if (!cancelled) setBrief(null);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!id) return;
    setError(null);
    try {
      const refs = fields.references
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
      await api(`/briefs/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: fields.title,
          companyName: fields.companyName,
          designType: fields.designType,
          description: fields.description,
          targetAudience: fields.targetAudience,
          stylePreference: fields.stylePreference,
          deadline: new Date(fields.deadline).toISOString(),
          budget: fields.budget ? Number(fields.budget) : undefined,
          references: refs,
        }),
      });
      navigate(`${base}/briefs/${id}`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed");
    }
  }

  if (!brief) {
    return (
      <div className="mx-auto max-w-4xl">
        <EmptyState
          icon="description"
          title="Loading requirement"
          description="If this stays visible, the requirement may no longer be available."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        to={`${base}/briefs/${id}`}
        className="mb-6 inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant no-underline transition-colors hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Back to requirement
      </Link>

      <PageHeader
        eyebrow="Edit requirement"
        title="Refine your creative request"
        description="Update the brief while it is still waiting for a professional to pick it up."
      />

      <form onSubmit={(event) => void onSubmit(event)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SurfaceCard className="p-6">
          {error && (
            <div className="mb-5 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Project title
              </span>
              <input
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={fields.title}
                onChange={(event) => setFields({ ...fields, title: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Company or brand
              </span>
              <input
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={fields.companyName}
                onChange={(event) => setFields({ ...fields, companyName: event.target.value })}
                required
              />
            </label>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Design type
            </p>
            <div className="grid gap-3 md:grid-cols-5">
              {designTypes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFields({ ...fields, designType: item.value })}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    fields.designType === item.value
                      ? "border-primary bg-primary-container text-on-primary-container shadow-sm"
                      : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <span className="material-symbols-outlined mb-3 block text-[24px]">{item.icon}</span>
                  <span className="block text-label-md font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Creative brief
              </span>
              <textarea
                className="min-h-[150px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={fields.description}
                onChange={(event) => setFields({ ...fields, description: event.target.value })}
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Target audience
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={fields.targetAudience}
                  onChange={(event) => setFields({ ...fields, targetAudience: event.target.value })}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Desired deadline
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  type="date"
                  value={fields.deadline}
                  onChange={(event) => setFields({ ...fields, deadline: event.target.value })}
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Style preferences
              </span>
              <textarea
                className="min-h-[110px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={fields.stylePreference}
                onChange={(event) => setFields({ ...fields, stylePreference: event.target.value })}
                required
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Budget
                </span>
                <input
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  type="number"
                  min={0}
                  value={fields.budget}
                  onChange={(event) => setFields({ ...fields, budget: event.target.value })}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Reference links
                </span>
                <textarea
                  className="min-h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={fields.references}
                  onChange={(event) => setFields({ ...fields, references: event.target.value })}
                  placeholder="One link per line"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-outline-variant pt-5">
            <Link
              to={`${base}/briefs/${id}`}
              className="inline-flex h-11 items-center rounded-lg border border-outline-variant px-5 text-label-md font-bold text-on-surface no-underline transition-colors hover:bg-surface-container-low"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save changes
            </button>
          </div>
        </SurfaceCard>

        <aside className="space-y-5">
          <SurfaceCard className="p-5">
            <h2 className="mb-2 text-headline-md font-semibold text-on-surface">Editable while waiting</h2>
            <p className="text-body-sm text-on-surface-variant">
              Once a professional picks up the requirement, the project moves into the workspace and this submission becomes locked.
            </p>
          </SurfaceCard>
        </aside>
      </form>
    </div>
  );
}
