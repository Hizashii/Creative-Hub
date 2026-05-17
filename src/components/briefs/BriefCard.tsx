import { Link } from "react-router-dom";
import type { Brief } from "../../types/domain";
import { BriefStatusBadge } from "./BriefStatusBadge";
import { formatDate, titleize } from "../../utils/format";

export function BriefCard({ brief, to }: { brief: Brief; to: string }) {
  return (
    <Link
      to={to}
      className="group flex min-h-[230px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-on-surface no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
          <span className="material-symbols-outlined text-[24px]">description</span>
        </div>
        <BriefStatusBadge status={brief.status} />
      </div>

      <h2 className="line-clamp-2 text-headline-md font-semibold text-on-surface group-hover:text-primary">
        {brief.title}
      </h2>
      <p className="mt-2 text-body-sm text-on-surface-variant">{brief.companyName}</p>
      <p className="mt-1 text-label-md font-bold text-primary">{titleize(brief.designType)}</p>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-sm font-semibold text-on-surface-variant">Deadline</span>
          <span className="text-label-sm font-bold text-on-surface">{formatDate(brief.deadline)}</span>
        </div>
        {brief.status === "submitted" && (
          <p className="mt-3 rounded-lg bg-tertiary-fixed px-3 py-2 text-label-md font-bold text-tertiary">
            Waiting for a professional to pick it up!
          </p>
        )}
      </div>
    </Link>
  );
}
