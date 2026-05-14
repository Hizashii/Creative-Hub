import { Link } from "react-router-dom";
import type { Brief } from "../../types/domain";
import { BriefStatusBadge } from "./BriefStatusBadge";

export function BriefCard({ brief, to }: { brief: Brief; to: string }) {
  return (
    <Link
      to={to}
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col no-underline group"
    >
      <div className="flex justify-between items-start gap-2 mb-3">
        <h3 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors leading-snug flex-1">
          {brief.title}
        </h3>
        <BriefStatusBadge status={brief.status} />
      </div>
      <p className="text-sm text-on-surface-variant">{brief.companyName}</p>
      <p className="text-xs text-outline mt-1 capitalize">{brief.designType.replace("-", " ")}</p>
    </Link>
  );
}
