import { useLocation, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../api/client";
import type { Brief, BriefStatus } from "../../types/domain";
import type { BriefFilterOption } from "../../interfaces/brief.interfaces";
import { BriefCard } from "../../components/briefs/BriefCard";
import { EmptyState, MetricCard, PageHeader } from "../../components/dashboard/DashboardPrimitives";

const filters: BriefFilterOption[] = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Waiting" },
  { id: "in-progress", label: "In progress" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
];

export function BriefsBrowsePage() {
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const [items, setItems] = useState<Brief[]>([]);
  const [filter, setFilter] = useState<"all" | BriefStatus>("all");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await api<Brief[]>("/briefs");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => items.filter((item) => filter === "all" || item.status === filter),
    [filter, items],
  );

  const waiting = items.filter((item) => item.status === "submitted").length;
  const inProgress = items.filter((item) => item.status === "in-progress").length;
  const pending = items.filter((item) => item.status === "pending").length;
  const completed = items.filter((item) => item.status === "completed").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Requirements"
        title={area === "client" ? "Your requirements" : area === "designer" ? "Assigned requirements" : "Requirements queue"}
        description={
          area === "client"
            ? "Track submitted creative requests from waiting queue through preview and delivery."
            : area === "designer"
              ? "View requirements connected to projects where you have been added as a team member."
              : "Review submitted client requirements and assign them to project workspaces."
        }
        actions={
          area === "client" && (
            <Link
              to={`${base}/briefs/new`}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New requirement
            </Link>
          )
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Waiting" value={waiting} icon="hourglass_top" helper="Ready for pickup" tone="tertiary" />
        <MetricCard label="In progress" value={inProgress} icon="draw" helper="Assigned to a professional" />
        <MetricCard label="Pending" value={pending} icon="pending_actions" helper="Waiting for client approval" tone="tertiary" />
        <MetricCard label="Completed" value={completed} icon="check_circle" helper="Delivery approved" tone="secondary" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-4 py-2 text-label-md font-bold transition-colors ${
              filter === item.id
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No requirements found"
          description={
            area === "client"
              ? "Create a new requirement to brief a professional and start the project flow."
              : area === "designer"
                ? "You only see requirements from projects where you have been invited or assigned."
                : "There are no matching client requirements in the queue."
          }
          action={
            area === "client" ? (
              <Link
                to={`${base}/briefs/new`}
                className="rounded-lg bg-primary px-4 py-2 text-label-md font-bold text-on-primary no-underline"
              >
                Create requirement
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((brief) => (
            <BriefCard key={brief.id} brief={brief} to={`${base}/briefs/${brief.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
