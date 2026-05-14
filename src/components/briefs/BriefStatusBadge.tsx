import type { BriefStatus } from "../../types/domain";

const CONFIG: Record<BriefStatus, { label: string; cls: string }> = {
  submitted: { label: "Submitted", cls: "bg-primary-fixed text-on-primary-fixed" },
  accepted: { label: "Accepted", cls: "bg-secondary-container text-on-secondary-container" },
  "in-progress": { label: "In progress", cls: "bg-primary-container text-on-primary-container" },
  completed: { label: "Completed", cls: "bg-surface-variant text-on-surface-variant" },
};

export function BriefStatusBadge({ status }: { status: BriefStatus }) {
  const { label, cls } = CONFIG[status] ?? CONFIG.submitted;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
