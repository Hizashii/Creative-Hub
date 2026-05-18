import { Link } from "react-router-dom";
import type { ClientBriefProgressViewProps } from "../../interfaces/clientWorkspace.interfaces";
import { buildBriefProgressSteps } from "../../utils/clientProgress";
import { ClientProgressPipeline } from "../projects/ClientProgressPipeline";

export function ClientBriefProgressView({ brief, base, created }: ClientBriefProgressViewProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to={`${base}/briefs`}
        className="mb-6 inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant no-underline transition-colors hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Briefs
      </Link>

      {created && (
        <div className="mb-6 rounded-xl border border-tertiary-fixed bg-tertiary-fixed/60 p-5 text-tertiary">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
            <div>
              <p className="font-bold">Brief created.</p>
              <p className="mt-1 text-body-sm">Waiting for a designer to pick it up.</p>
            </div>
          </div>
        </div>
      )}

      <header className="mb-6">
        <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Client view</p>
        <h1 className="mt-1 text-display-lg-mobile font-bold leading-tight text-on-surface md:text-display-lg">
          {brief.title}
        </h1>
        <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">
          Once a designer picks this up, chat and designer assets will appear in the project workspace.
        </p>
      </header>

      <ClientProgressPipeline steps={buildBriefProgressSteps(brief)} />
    </div>
  );
}
