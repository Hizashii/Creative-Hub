import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import type { FeedItem } from "../../types/dashboard";
import { useDashboardNav } from "../../hooks/useDashboardNav";

function kindIcon(kind: FeedItem["kind"]) {
  switch (kind) {
    case "feedback":
      return "chat";
    case "asset":
      return "attach_file";
    case "task":
      return "assignment";
    default:
      return "description";
  }
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function UpdatesPage() {
  const { base } = useDashboardNav();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await api<FeedItem[]>("/dashboard/feed");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Updates</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Recent feedback, files, tasks, and brief activity across your workspace.
        </p>
      </div>

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No activity yet. Open a project to add tasks, upload files, or post feedback.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.kind}-${item.id}`}
            className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 flex gap-4"
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[22px]">
                {kindIcon(item.kind)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  {item.kind}
                </span>
                <span className="text-xs text-outline">{formatWhen(item.at)}</span>
              </div>
              {item.projectId && (
                <Link
                  to={`${base}/projects/${item.projectId}`}
                  className="text-sm font-semibold text-primary hover:underline mt-1 inline-block"
                >
                  {item.projectTitle ?? "Project"}
                </Link>
              )}
              {item.authorName && (
                <p className="text-xs text-on-surface-variant mt-0.5">By {item.authorName}</p>
              )}
              <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap break-words">
                {item.detail ?? item.title}
              </p>
              {item.kind === "asset" && item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-primary mt-2 inline-flex items-center gap-1"
                >
                  Open file
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </a>
              )}
              {item.kind === "brief" && item.companyName && (
                <p className="text-xs text-on-surface-variant mt-1">
                  {item.companyName}
                  {item.status ? ` · ${item.status}` : ""}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
