import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Project, Column, Task, Asset, FeedbackMessage, ProjectMember } from "../../types/domain";
import { ProjectStatusSelect } from "../../components/projects/ProjectStatusSelect";
import { useAuth } from "../../hooks/useAuth";
import { SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatCurrency, formatDate, getInitials } from "../../utils/format";

export function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { pathname } = useLocation();
  const area = pathname.split("/")[1] || "client";
  const base = `/${area}`;
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [feedback, setFeedback] = useState<FeedbackMessage[]>([]);
  const [message, setMessage] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [assetName, setAssetName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewName, setPreviewName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCol, setNewTaskCol] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const [p, c, t, a, m, f] = await Promise.all([
        api<Project>(`/projects/${projectId}`),
        api<Column[]>(`/projects/${projectId}/columns`),
        api<Task[]>(`/projects/${projectId}/tasks`),
        api<Asset[]>(`/projects/${projectId}/assets`),
        api<ProjectMember[]>(`/projects/${projectId}/members`),
        api<FeedbackMessage[]>(`/projects/${projectId}/feedback`),
      ]);
      setProject(p); setColumns(c); setTasks(t); setAssets(a); setMembers(m); setFeedback(f);
      setNewTaskCol((prev) => prev || c[0]?.id || "");
    } catch {
      setProject(null);
    }
  }, [projectId]);

  useEffect(() => {
    const h = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(h);
  }, [load]);

  useEffect(() => {
    if (!projectId) return;
    const t = window.setInterval(() => {
      void api<FeedbackMessage[]>(`/projects/${projectId}/feedback`).then(setFeedback).catch(() => {});
    }, 5000);
    return () => window.clearInterval(t);
  }, [projectId]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !message.trim()) return;
    setError(null);
    try {
      await api(`/projects/${projectId}/feedback`, { method: "POST", body: JSON.stringify({ message: message.trim() }) });
      setMessage("");
      setFeedback(await api<FeedbackMessage[]>(`/projects/${projectId}/feedback`));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Message failed");
    }
  }

  async function addAsset(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !assetUrl.trim() || !assetName.trim()) return;
    setError(null);
    try {
      await api(`/projects/${projectId}/assets`, { method: "POST", body: JSON.stringify({ url: assetUrl.trim(), filename: assetName.trim() }) });
      setAssetUrl(""); setAssetName("");
      setAssets(await api<Asset[]>(`/projects/${projectId}/assets`));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add asset");
    }
  }

  async function sendPreview(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !previewUrl.trim() || !previewName.trim()) return;
    setError(null);
    try {
      await api(`/projects/${projectId}/assets`, {
        method: "POST",
        body: JSON.stringify({
          url: previewUrl.trim(),
          filename: previewName.trim(),
          tags: ["preview", "client-review"],
        }),
      });
      setPreviewUrl("");
      setPreviewName("");
      setAssets(await api<Asset[]>(`/projects/${projectId}/assets`));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not send preview");
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !newTaskTitle.trim() || !newTaskCol) return;
    setError(null);
    try {
      await api(`/projects/${projectId}/tasks`, { method: "POST", body: JSON.stringify({ columnId: newTaskCol, title: newTaskTitle.trim() }) });
      setNewTaskTitle("");
      setTasks(await api<Task[]>(`/projects/${projectId}/tasks`));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not add task");
    }
  }

  if (!project || !projectId) {
    return (
      <div className="max-w-7xl mx-auto">
        <p className="text-sm text-on-surface-variant mb-4">Project not found.</p>
        <Link to={`${base}/projects`} className="text-primary text-sm hover:underline no-underline">Back to projects</Link>
      </div>
    );
  }

  const tasksByCol = new Map<string, Task[]>();
  for (const col of columns) {
    tasksByCol.set(col.id, tasks.filter((t) => t.columnId === col.id).sort((a, b) => a.order - b.order));
  }

  const canManage = user?.role === "admin" || user?.id === project.ownerId;
  const canSendPreview = user?.role === "admin" || user?.role === "designer";
  const canApprovePreview = user?.role === "client" && user.id === project.ownerId;
  const previewAssets = assets.filter((asset) => asset.tags.includes("preview"));
  const deliveryPrice = 49;

  return (
    <div className="max-w-7xl mx-auto">
      <Link to={`${base}/projects`} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface mb-6 no-underline transition-colors">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Projects
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">{project.title}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{project.description || "Shared workspace with tasks, gallery, and chat."}</p>
        </div>
        {canManage && (
          <ProjectStatusSelect projectId={projectId} value={project.status} onUpdated={(p) => setProject(p)} />
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Team */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="text-sm font-semibold text-on-surface mb-4">Team</h2>
            <div className="flex items-center gap-1 mb-2">
              {members.slice(0, 6).map((m) => (
                <span
                  key={m.id}
                  title={m.user?.email}
                  className="w-8 h-8 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center text-xs font-bold border-2 border-surface-container-lowest -ml-1 first:ml-0"
                >
                  {getInitials(m.user?.name ?? "?")}
                </span>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">{members.length} people on this project</p>
          </div>

          {/* Task board */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="text-sm font-semibold text-on-surface mb-4">Task board</h2>
            <form onSubmit={addTask} className="flex gap-2 flex-wrap mb-4">
              <select
                className="bg-surface-container border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
                value={newTaskCol}
                onChange={(e) => setNewTaskCol(e.target.value)}
              >
                {columns.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <input
                className="flex-1 min-w-[160px] bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="New task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
                Add
              </button>
            </form>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {columns.map((col) => (
                <div key={col.id} className="min-w-[220px] bg-surface-container-low rounded-xl p-4 border border-outline-variant/50">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">{col.title}</h4>
                  <div className="space-y-2">
                    {(tasksByCol.get(col.id) ?? []).map((t) => (
                      <div key={t.id} className="bg-surface-container-lowest rounded-lg p-3 border border-outline-variant text-sm">
                        <p className="font-medium text-on-surface">{t.title}</p>
                        {t.description && <p className="text-xs text-on-surface-variant mt-1">{t.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview handoff */}
          <SurfaceCard className="overflow-hidden">
            <div className="border-b border-outline-variant px-6 py-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-headline-md font-semibold text-on-surface">Client preview</h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    Send a PNG preview for approval before final delivery.
                  </p>
                </div>
                {previewAssets.length > 0 && (
                  <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md font-bold text-secondary">
                    Preview ready
                  </span>
                )}
              </div>
            </div>

            {canSendPreview && (
              <form onSubmit={(event) => void sendPreview(event)} className="grid gap-3 border-b border-outline-variant p-6 md:grid-cols-[1fr_1fr_auto]">
                <input
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Preview PNG URL"
                  value={previewUrl}
                  onChange={(event) => setPreviewUrl(event.target.value)}
                />
                <input
                  className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Preview label"
                  value={previewName}
                  onChange={(event) => setPreviewName(event.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[18px]">image</span>
                  Send preview
                </button>
              </form>
            )}

            <div className="p-6">
              {previewAssets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
                  <span className="material-symbols-outlined mb-2 block text-[36px] text-on-surface-variant">
                    image
                  </span>
                  <p className="font-semibold text-on-surface">No preview has been sent yet.</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    The client will approve and choose payment once a preview is available.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
                  <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                    <img
                      src={previewAssets[0].url}
                      alt={previewAssets[0].filename}
                      className="h-full max-h-[360px] w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <p className="text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                        Latest preview
                      </p>
                      <h3 className="mt-2 text-headline-md font-semibold text-on-surface">{previewAssets[0].filename}</h3>
                      <p className="mt-2 text-body-sm text-on-surface-variant">
                        Sent {formatDate(previewAssets[0].createdAt)} for client review.
                      </p>
                    </div>
                    {canApprovePreview && (
                      <button
                        type="button"
                        onClick={() => setPaymentOpen(true)}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        I love it! Please send it!
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SurfaceCard>

          {/* Asset gallery */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h2 className="text-sm font-semibold text-on-surface mb-4">Asset gallery</h2>
            <form onSubmit={addAsset} className="grid gap-2 mb-4">
              <input
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="File URL"
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
              />
              <input
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Label"
                value={assetName}
                onChange={(e) => setAssetName(e.target.value)}
              />
              <button type="submit" className="px-4 py-2 text-xs font-semibold text-on-surface border border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors text-left">
                + Add link to gallery
              </button>
            </form>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {assets.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-lg bg-surface-container border border-outline-variant p-3 text-xs text-on-surface hover:border-primary hover:bg-surface-container-low transition-colors no-underline truncate"
                >
                  <span className="material-symbols-outlined text-[14px] text-on-surface-variant mr-1">link</span>
                  {a.filename}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Chat panel */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl flex flex-col max-h-[calc(100vh-12rem)] sticky top-24">
          <div className="px-6 py-4 border-b border-outline-variant">
            <h2 className="text-sm font-semibold text-on-surface">Project chat</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {feedback.map((fb) => (
              <div key={fb.id} className="bg-surface-container rounded-xl p-3">
                <p className="text-xs text-on-surface-variant mb-1">
                  {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : ""}
                  {fb.authorId === user?.id ? " / You" : ""}
                </p>
                <p className="text-sm text-on-surface">{fb.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-outline-variant">
            <input
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="px-3 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </div>

      {(paymentOpen || paymentComplete) && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-inverse-surface/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
            {paymentComplete ? (
              <div className="p-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-secondary">
                  <span className="material-symbols-outlined text-[34px]">verified</span>
                </div>
                <h2 className="text-display-lg-mobile font-bold text-on-surface">Payment complete</h2>
                <p className="mt-3 text-body-sm text-on-surface-variant">
                  Your mock payment went through. The professional can now prepare the final delivery files.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentComplete(false);
                    setPaymentOpen(false);
                  }}
                  className="mt-6 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary"
                >
                  Back to project
                </button>
              </div>
            ) : (
              <div>
                <div className="border-b border-outline-variant px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-headline-md font-semibold text-on-surface">Choose payment option</h2>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        Mock checkout for the approved preview.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPaymentOpen(false)}
                      className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high"
                      aria-label="Close payment modal"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3 p-6">
                  {[
                    { id: "card", label: "Card", detail: "Visa, Mastercard, or debit card", icon: "credit_card" },
                    { id: "wallet", label: "Digital wallet", detail: "Fast checkout with saved wallet", icon: "account_balance_wallet" },
                    { id: "bank", label: "Bank transfer", detail: "Mock invoice payment", icon: "account_balance" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                        paymentMethod === option.id
                          ? "border-primary bg-primary-container text-on-primary-container"
                          : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">{option.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold">{option.label}</span>
                        <span className="block text-label-sm opacity-80">{option.detail}</span>
                      </span>
                      <span className="material-symbols-outlined text-[20px]">
                        {paymentMethod === option.id ? "radio_button_checked" : "radio_button_unchecked"}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-outline-variant bg-surface-container-low px-6 py-5">
                  <div>
                    <p className="text-label-sm font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                      Due now
                    </p>
                    <p className="text-headline-md font-bold text-on-surface">{formatCurrency(deliveryPrice)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentComplete(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Pay mock invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
