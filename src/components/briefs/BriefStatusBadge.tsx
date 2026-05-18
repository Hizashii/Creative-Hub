import type { BriefStatus } from "../../types/domain";
import type { BriefStatusBadgeConfig, BriefStatusBadgeProps } from "../../interfaces/brief.interfaces";

const CONFIG: Record<BriefStatus, BriefStatusBadgeConfig> = {
  submitted: { label: "Waiting", cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  accepted: { label: "Accepted", cls: "bg-secondary-container text-on-secondary-container" },
  "in-progress": { label: "In progress", cls: "bg-primary-container text-on-primary-container" },
  pending: { label: "Pending", cls: "bg-tertiary-fixed text-on-tertiary-fixed" },
  completed: { label: "Completed", cls: "bg-secondary-container text-on-secondary-container" },
};

export function BriefStatusBadge({ status }: BriefStatusBadgeProps) {
  const { label, cls } = CONFIG[status] ?? CONFIG.submitted;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-sm font-bold ${cls}`}>
      {label}
    </span>
  );
}
