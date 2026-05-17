import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, ApiRequestError } from "../../api/client";
import type { DocumentRow } from "../../types/dashboard";
import type { Asset, Project } from "../../types/domain";
import { useDashboardNav } from "../../hooks/useDashboardNav";
import { EmptyState, MetricCard, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatDate } from "../../utils/format";

function extensionLabel(filename: string) {
  const ext = filename.split(".").pop()?.toUpperCase();
  return ext && ext !== filename.toUpperCase() ? ext : "FILE";
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function DocumentsPage() {
  const { base } = useDashboardNav();
  const [rows, setRows] = useState<DocumentRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLink, setFileLink] = useState("");
  const [label, setLabel] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [documents, projectRows] = await Promise.all([
        api<DocumentRow[]>("/dashboard/documents"),
        api<Project[]>("/projects"),
      ]);
      setRows(documents);
      setProjects(projectRows);
      setSelectedProjectId((current) => current || projectRows[0]?.id || "");
    } catch {
      setRows([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveDocument(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!selectedProjectId) {
      setError("Select the project this file belongs to.");
      return;
    }
    if (!selectedFile && !fileLink.trim()) {
      setError("Attach a file or paste a file link.");
      return;
    }

    const url = fileLink.trim() || (selectedFile ? await fileToDataUrl(selectedFile) : "");
    const filename = label.trim() || selectedFile?.name || url.split("/").pop() || "Project attachment";

    setSaving(true);
    try {
      await api<Asset>(`/projects/${selectedProjectId}/assets`, {
        method: "POST",
        body: JSON.stringify({
          url,
          filename,
          tags: ["client-upload", "requirement-reference"],
        }),
      });
      setSelectedFile(null);
      setFileLink("");
      setLabel("");
      setFileInputKey((key) => key + 1);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save document");
    } finally {
      setSaving(false);
    }
  }

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      `${row.filename} ${row.projectTitle} ${row.tags.join(" ")}`.toLowerCase().includes(term),
    );
  }, [query, rows]);

  const folders = useMemo(() => {
    const byProject = new Map<string, { projectId: string; title: string; count: number; latest?: string }>();
    for (const row of rows) {
      const current = byProject.get(row.projectId) ?? {
        projectId: row.projectId,
        title: row.projectTitle,
        count: 0,
        latest: row.createdAt,
      };
      current.count += 1;
      if (row.createdAt && (!current.latest || new Date(row.createdAt) > new Date(current.latest))) {
        current.latest = row.createdAt;
      }
      byProject.set(row.projectId, current);
    }
    return [...byProject.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [rows]);

  const taggedCount = rows.filter((row) => row.tags.length > 0).length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Library"
        title="Documents"
        description="Attach images, videos, and reference files to the project that needs them."
        actions={
          <label className="relative block min-w-[240px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
              search
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Search files"
            />
          </label>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <MetricCard label="Documents" value={rows.length} icon="description" helper="Uploaded project assets" />
        <MetricCard label="Projects" value={projects.length} icon="folder" helper="Available for upload" tone="secondary" />
        <MetricCard label="Tagged" value={taggedCount} icon="sell" helper="Files with metadata" tone="tertiary" />
      </div>

      <SurfaceCard className="mb-8 overflow-hidden">
        <div className="border-b border-outline-variant px-6 py-5">
          <h2 className="text-headline-md font-semibold text-on-surface">Attach a file to a project</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Select the project, upload the file or paste a hosted file link, then save it to the project documents.
          </p>
        </div>
        <form onSubmit={(event) => void saveDocument(event)} className="grid gap-5 p-6 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_auto] lg:items-end">
          <label className="block">
            <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Project
            </span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              {projects.length === 0 && <option value="">No projects available</option>}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Upload file
            </span>
            <input
              key={fileInputKey}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file && !label.trim()) setLabel(file.name);
              }}
              className="block h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest text-body-sm text-on-surface file:mr-3 file:h-full file:border-0 file:bg-primary file:px-3 file:text-label-md file:font-bold file:text-on-primary"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              File label
            </span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Reference image"
            />
          </label>

          <button
            type="submit"
            disabled={saving || projects.length === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {saving ? "Saving..." : "Save"}
          </button>

          <label className="block lg:col-span-3">
            <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              Or paste a hosted file link
            </span>
            <input
              value={fileLink}
              onChange={(event) => setFileLink(event.target.value)}
              className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="https://example.com/reference.png"
            />
          </label>

          {error && (
            <div className="rounded-lg bg-error-container p-3 text-body-sm text-on-error-container lg:col-span-4">
              {error}
            </div>
          )}
        </form>
      </SurfaceCard>

      {folders.length > 0 && (
        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {folders.map((folder) => (
            <Link
              key={folder.projectId}
              to={`${base}/projects/${folder.projectId}`}
              className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-on-surface no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="material-symbols-outlined mb-4 text-[34px] text-primary">folder</span>
              <h2 className="line-clamp-1 text-headline-md font-semibold">{folder.title}</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {folder.count} items / Updated {formatDate(folder.latest)}
              </p>
            </Link>
          ))}
        </section>
      )}

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && filteredRows.length === 0 && (
        <EmptyState
          icon="draft"
          title="No documents found"
          description="Files uploaded inside project workspaces will appear here with project links and tags."
        />
      )}

      {!loading && filteredRows.length > 0 && (
        <SurfaceCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-headline-md font-semibold text-on-surface">Recent documents</h2>
            <div className="flex gap-1">
              <button type="button" className="rounded-lg bg-surface-container-high p-2 text-primary" aria-label="List view">
                <span className="material-symbols-outlined text-[20px]">list</span>
              </button>
              <button type="button" className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high" aria-label="Grid view">
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-body-sm">
              <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3">File</th>
                  <th className="px-5 py-3">Project</th>
                  <th className="px-5 py-3">Tags</th>
                  <th className="px-5 py-3">Added</th>
                  <th className="px-5 py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredRows.map((row) => (
                  <tr key={row.id} className="group transition-colors hover:bg-surface-container-low">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-[10px] font-bold text-primary">
                          {extensionLabel(row.filename)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-on-surface">{row.filename}</p>
                          <p className="text-label-sm text-on-surface-variant">Project asset</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`${base}/projects/${row.projectId}`} className="font-semibold text-on-surface-variant no-underline hover:text-primary">
                        {row.projectTitle}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{row.tags.length > 0 ? row.tags.join(", ") : "-"}</td>
                    <td className="px-5 py-4 text-on-surface-variant">{formatDate(row.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-label-md font-bold text-primary no-underline hover:underline"
                      >
                        Open
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SurfaceCard>
      )}
    </div>
  );
}
