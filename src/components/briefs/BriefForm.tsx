import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Brief, DesignType } from "../../types/domain";
import type { DesignTypeOption } from "../../interfaces/brief.interfaces";
import { PageHeader, SurfaceCard } from "../dashboard/DashboardPrimitives";

const designTypes: DesignTypeOption[] = [
  { value: "logo", label: "Logo", icon: "signature", description: "Marks, symbols, and identity lockups." },
  { value: "poster", label: "Poster", icon: "newspaper", description: "Campaign posters and event visuals." },
  { value: "branding", label: "Branding", icon: "palette", description: "Full visual identity direction." },
  { value: "social-media", label: "Social media", icon: "grid_view", description: "Posts, banners, and launch assets." },
  { value: "website", label: "Website", icon: "language", description: "Landing pages and web visuals." },
];

export function BriefForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designType, setDesignType] = useState<DesignType>("logo");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [references, setReferences] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const refs = references
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
      const created = await api<Brief>("/briefs", {
        method: "POST",
        body: JSON.stringify({
          title,
          companyName,
          designType,
          description,
          targetAudience,
          stylePreference,
          deadline: new Date(deadline).toISOString(),
          budget: budget ? Number(budget) : undefined,
          references: refs.length ? refs : undefined,
        }),
      });
      navigate(`/client/briefs/${created.id}?created=1`, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not submit requirement");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="New requirement"
        title="Tell us what you want created"
        description="Share the goal, audience, style direction, budget, and references so a professional can pick it up with the right context."
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
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Brand refresh, poster campaign, website hero..."
                required
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                Company or brand
              </span>
              <input
                className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Your company name"
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
                  onClick={() => setDesignType(item.value)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    designType === item.value
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
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What should be made, what problem should it solve, and what should the finished work communicate?"
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
                  value={targetAudience}
                  onChange={(event) => setTargetAudience(event.target.value)}
                  placeholder="Founders, students, local customers..."
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
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
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
                value={stylePreference}
                onChange={(event) => setStylePreference(event.target.value)}
                placeholder="Clean and premium, playful, minimal, bold colors, references to avoid..."
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
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="Optional"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Reference links
                </span>
                <textarea
                  className="min-h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={references}
                  onChange={(event) => setReferences(event.target.value)}
                  placeholder="One link per line"
                />
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t border-outline-variant pt-5">
            <button
              type="submit"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={pending}
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              {pending ? "Submitting..." : "Submit requirement"}
            </button>
          </div>
        </SurfaceCard>

        <aside className="space-y-5">
          <SurfaceCard className="p-5">
            <h2 className="mb-3 text-headline-md font-semibold text-on-surface">What happens next</h2>
            <ol className="space-y-4">
              {[
                ["1", "You submit the requirement."],
                ["2", "It shows as waiting for a professional to pick it up."],
                ["3", "A professional accepts it and gets assigned to the project."],
                ["4", "You receive a PNG preview before final delivery."],
              ].map(([step, label]) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md font-bold text-on-primary-container">
                    {step}
                  </span>
                  <span className="pt-1 text-body-sm text-on-surface-variant">{label}</span>
                </li>
              ))}
            </ol>
          </SurfaceCard>

          <SurfaceCard className="p-5">
            <h2 className="mb-2 text-headline-md font-semibold text-on-surface">Selected package</h2>
            <p className="text-body-sm text-on-surface-variant">
              {designTypes.find((item) => item.value === designType)?.description}
            </p>
          </SurfaceCard>
        </aside>
      </form>
    </div>
  );
}
