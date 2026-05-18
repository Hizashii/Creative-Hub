import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Brief, Project } from "../../types/domain";
import { formatDate, titleize } from "../../utils/format";

interface Props {
  project: Project;
  area: string;
  onClose: () => void;
  onAccepted: () => void;
}

export function ProjectPreviewModal({ project, area, onClose, onAccepted }: Props) {
  const navigate = useNavigate();
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project.briefId) return;
    setLoadingBrief(true);
    api<Brief>(`/briefs/${project.briefId}`)
      .then(setBrief)
      .catch(() => {})
      .finally(() => setLoadingBrief(false));
  }, [project.briefId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleAccept() {
    if (!project.briefId) return;
    setError(null);
    setAccepting(true);
    try {
      await api(`/briefs/${project.briefId}/accept`, { method: "POST", body: JSON.stringify({}) });
      onAccepted();
      navigate(`/${area}/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not accept project");
      setAccepting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-outline-variant">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-tertiary-fixed text-tertiary">
                Available
              </span>
              {brief && (
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surface-container-high text-on-surface-variant">
                  {titleize(brief.designType)}
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-on-surface">{project.title}</h2>
            {brief?.companyName && (
              <p className="text-sm text-on-surface-variant mt-0.5">{brief.companyName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded-lg hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1.5">Description</p>
            <p className="text-sm text-on-surface leading-relaxed">
              {project.description || "No description provided."}
            </p>
          </div>

          {loadingBrief && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Loading brief details…
            </div>
          )}

          {brief && (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1">Target Audience</p>
                  <p className="text-sm text-on-surface">{brief.targetAudience || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1">Style Preference</p>
                  <p className="text-sm text-on-surface">{brief.stylePreference || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1">Deadline</p>
                  <p className="text-sm font-semibold text-error">{formatDate(brief.deadline)}</p>
                </div>
                {brief.budget != null && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1">Budget</p>
                    <p className="text-sm text-on-surface">${brief.budget.toLocaleString()}</p>
                  </div>
                )}
              </div>

              {project.price != null && (
                <div className="rounded-xl border border-primary/30 bg-primary-container/30 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-primary mb-0.5">Client budget</p>
                    <p className="text-lg font-bold text-on-surface">${project.price.toLocaleString()}</p>
                  </div>
                  <span className="material-symbols-outlined text-[24px] text-primary">payments</span>
                </div>
              )}

              {brief.references.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-outline mb-1.5">References</p>
                  <ul className="space-y-1">
                    {brief.references.map((ref, i) => (
                      <li key={i} className="text-sm text-primary break-all">{ref}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-error bg-error-container/20 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleAccept()}
            disabled={accepting || !project.briefId}
            className="px-5 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {accepting && (
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            )}
            Accept &amp; Start Working
          </button>
        </div>
      </div>
    </div>
  );
}
