import { useCallback, useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { Project, Column, Task, Asset, FeedbackMessage, ProjectMember } from "../../types/domain";
import { ProjectStatusSelect } from "../../components/projects/ProjectStatusSelect";
import { useAuth } from "../../hooks/useAuth";

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
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCol, setNewTaskCol] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        <Link to={`${base}/projects`} className="text-primary text-sm hover:underline no-underline">← Back to projects</Link>
      </div>
    );
  }

  const tasksByCol = new Map<string, Task[]>();
  for (const col of columns) {
    tasksByCol.set(col.id, tasks.filter((t) => t.columnId === col.id).sort((a, b) => a.order - b.order));
  }

  const canManage = user?.role === "admin" || user?.id === project.ownerId;

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
                  {(m.user?.name ?? "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
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
                placeholder="New task title…"
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
                  {fb.authorId === user?.id ? " · You" : ""}
                </p>
                <p className="text-sm text-on-surface">{fb.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 p-4 border-t border-outline-variant">
            <input
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="Message…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="px-3 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
