import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../../types/domain";
import type { DesignerProjectWorkspaceViewProps } from "../../interfaces/project.interfaces";
import { formatDate } from "../../utils/format";
import { ProjectChatPanel } from "./ProjectChatPanel";

function tasksForColumn(tasks: Task[], columnId: string) {
  return tasks.filter((task) => task.columnId === columnId).sort((a, b) => a.order - b.order);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

export function DesignerProjectWorkspaceView({
  project,
  base,
  columns,
  tasks,
  assets,
  members,
  feedback,
  currentUser,
  message,
  error,
  fileUrl,
  fileName,
  newTaskTitle,
  newTaskCol,
  requestPending,
  pickUpPending,
  priceUpdatePending,
  onFileUrlChange,
  onFileNameChange,
  onUploadFile,
  onTaskTitleChange,
  onTaskColChange,
  onAddTask,
  onMessageChange,
  onSendMessage,
  onRequestReview,
  onPickUp,
  onSetPrice,
}: DesignerProjectWorkspaceViewProps) {
  const [selectedFileName, setSelectedFileName] = useState("");
  const [priceInput, setPriceInput] = useState(project.price != null ? String(project.price) : "");
  const isAvailable = project.status === "draft";
  const hasReviewFile = assets.some((asset) => asset.tags.includes("preview"));
  const isPendingReview = project.status === "pending";
  const isCompleted = project.status === "completed";
  const hasLocalFile = fileUrl.startsWith("data:");
  const canUploadFile = Boolean(fileUrl.trim() && fileName.trim()) && !isCompleted;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSelectedFileName(file.name);
      onFileUrlChange(dataUrl);
      onFileNameChange(file.name);
    } catch {
      setSelectedFileName("");
      onFileUrlChange("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to={`${base}/projects`}
        className="mb-6 inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant no-underline transition-colors hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Projects
      </Link>

      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Designer workspace</p>
          <h1 className="mt-1 text-display-lg-mobile font-bold leading-tight text-on-surface md:text-display-lg">
            {project.title}
          </h1>
          <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">
            Upload review files, keep your task tracker tidy, and chat with the client.
          </p>
        </div>
        <button
          type="button"
          disabled={!hasReviewFile || requestPending || isPendingReview || isCompleted}
          onClick={onRequestReview}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">rate_review</span>
          {requestPending ? "Requesting..." : isPendingReview ? "Review requested" : "Request review"}
        </button>
      </header>

      {error && <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>}

      {isAvailable && (
        <div className="mb-6 overflow-hidden rounded-xl border border-tertiary-fixed bg-tertiary-fixed/20 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-label-md font-bold uppercase tracking-[0.08em] text-tertiary">Open for pickup</p>
              <h2 className="mt-1 text-headline-md font-semibold text-on-surface">
                This project is waiting for a designer
              </h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                Pick it up to become the assigned designer and open the full workspace.
              </p>
            </div>
            <button
              type="button"
              disabled={pickUpPending}
              onClick={onPickUp}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">work</span>
              {pickUpPending ? "Picking up..." : "Pick up project"}
            </button>
          </div>
        </div>
      )}

      {isPendingReview && (
        <div className="mb-4 rounded-xl border border-tertiary-fixed/40 bg-tertiary-fixed/20 p-4 text-on-surface">
          <p className="text-label-lg font-bold">Waiting for client review</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            The client can approve the review file or request changes from their simplified view.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Pricing */}
          {!isAvailable && !isCompleted && (
            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Quote</p>
                  <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Project price</h2>
                  <p className="mt-1 text-body-sm text-on-surface-variant">
                    {project.price != null
                      ? `Current quote: $${project.price.toLocaleString()}`
                      : "No price set yet — enter your quote below."}
                  </p>
                </div>
                <form
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    const val = parseFloat(priceInput);
                    if (!Number.isNaN(val) && val >= 0) void onSetPrice(val);
                  }}
                  className="flex items-center gap-2"
                >
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-on-surface-variant text-body-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="h-10 w-36 rounded-lg border border-outline-variant bg-surface-container-lowest pl-7 pr-3 text-body-sm text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="0"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={priceUpdatePending || priceInput === ""}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {priceUpdatePending ? "Saving…" : "Set quote"}
                  </button>
                </form>
              </div>
            </section>
          )}

          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="border-b border-outline-variant px-6 py-4">
              <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Project files</p>
              <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Upload review file</h2>
            </div>

            <form
              onSubmit={onUploadFile}
              className="grid gap-3 border-b border-outline-variant p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm text-on-surface transition-colors hover:border-primary hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">attach_file</span>
                <span className="min-w-0 flex-1 truncate">{hasLocalFile ? selectedFileName || "File selected" : "Choose file"}</span>
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*,application/pdf,.zip,.svg,.fig,.sketch"
                  onClick={(event) => {
                    event.currentTarget.value = "";
                  }}
                  onChange={(event) => void handleFileChange(event)}
                />
              </label>
              <input
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="File label"
                value={fileName}
                onChange={(event) => onFileNameChange(event.target.value)}
              />
              <button
                type="submit"
                disabled={!canUploadFile}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">upload_file</span>
                Upload and send
              </button>
            </form>

            <div className="p-6">
              {assets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-6 text-center">
                  <span className="material-symbols-outlined mb-2 block text-[36px] text-on-surface-variant">folder_open</span>
                  <p className="font-semibold text-on-surface">No files uploaded yet</p>
                  <p className="mt-1 text-body-sm text-on-surface-variant">Upload a file before requesting client review.</p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-label-md font-bold text-on-surface">{assets.length} uploaded files</p>
                    <p className="text-label-sm text-on-surface-variant">Scroll sideways to review history</p>
                  </div>
                  <div className="-mx-1 overflow-x-auto px-1 pb-2">
                    <div className="flex gap-3">
                      {assets.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-24 w-[260px] shrink-0 items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3 text-on-surface no-underline transition-colors hover:border-primary hover:bg-primary-container hover:text-on-primary-container"
                        >
                          <span className="material-symbols-outlined text-[22px]">attach_file</span>
                          <span className="min-w-0">
                            <span className="block truncate text-label-md font-bold">{asset.filename}</span>
                            <span className="block text-label-sm opacity-75">{formatDate(asset.createdAt)}</span>
                            {asset.tags.includes("preview") && (
                              <span className="mt-2 inline-flex rounded-full bg-primary-container px-2 py-0.5 text-label-sm font-bold text-on-primary-container">
                                Client review
                              </span>
                            )}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Tasks</p>
                <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Personal tracker</h2>
              </div>
              <span className="text-label-md text-on-surface-variant">{tasks.length} tasks</span>
            </div>

            <form onSubmit={onAddTask} className="mb-5 grid gap-2 md:grid-cols-[160px_1fr_auto]">
              <select
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                value={newTaskCol}
                onChange={(event) => onTaskColChange(event.target.value)}
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
              <input
                className="h-10 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm text-on-surface outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="New task..."
                value={newTaskTitle}
                onChange={(event) => onTaskTitleChange(event.target.value)}
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-outline-variant px-4 text-label-md font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Add
              </button>
            </form>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {columns.map((column) => (
                <div key={column.id} className="rounded-xl bg-surface-container-low p-3">
                  <h3 className="mb-3 text-label-md font-bold text-on-surface-variant">{column.title}</h3>
                  <div className="space-y-2">
                    {tasksForColumn(tasks, column.id).map((task) => (
                      <div key={task.id} className="rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
                        <p className="text-body-sm font-semibold text-on-surface">{task.title}</p>
                        {task.description && <p className="mt-1 text-label-sm text-on-surface-variant">{task.description}</p>}
                      </div>
                    ))}
                    {tasksForColumn(tasks, column.id).length === 0 && (
                      <p className="rounded-lg border border-dashed border-outline-variant p-3 text-label-sm text-on-surface-variant">
                        No tasks
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <ProjectChatPanel
          feedback={feedback}
          members={members}
          currentUser={currentUser}
          message={message}
          onMessageChange={onMessageChange}
          onSend={onSendMessage}
        />
      </div>
    </div>
  );
}
