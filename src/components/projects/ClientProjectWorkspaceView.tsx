import { useState } from "react";
import { Link } from "react-router-dom";
import type { Asset, ProjectMember } from "../../types/domain";
import type { ClientAssetsPanelProps, ClientProjectWorkspaceViewProps } from "../../interfaces/clientWorkspace.interfaces";
import { buildProjectProgressSteps } from "../../utils/clientProgress";
import { formatCurrency, formatDate } from "../../utils/format";
import { ProjectChatPanel } from "./ProjectChatPanel";
import { ClientProgressPipeline } from "./ClientProgressPipeline";

function uploaderFor(asset: Asset, members: ProjectMember[]) {
  return members.find((member) => member.userId === asset.uploaderId);
}

function isDesignerAsset(asset: Asset, members: ProjectMember[]) {
  const uploader = uploaderFor(asset, members);
  return asset.tags.includes("preview") || uploader?.user?.role === "designer" || uploader?.user?.role === "admin";
}

function isImageAsset(asset: Asset) {
  return asset.url.startsWith("data:image") || /\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(asset.url);
}

function ClientAssetsPanel({
  assets,
  project,
  canApprovePreview,
  canRequestChanges,
  approvalPending,
  declinePending,
  canDownload,
  changesRequested,
  onApprovePreview,
  onRequestChanges,
  onDeclinePrice,
}: ClientAssetsPanelProps) {
  const latest = assets[0];
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? latest;

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="border-b border-outline-variant px-6 py-4">
        <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Assets</p>
        <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Files from your designer</h2>
      </div>

      {assets.length === 0 ? (
        <div className="p-8 text-center">
          <span className="material-symbols-outlined mx-auto mb-3 block text-[40px] text-on-surface-variant">image</span>
          <p className="font-semibold text-on-surface">No designer assets yet</p>
          <p className="mx-auto mt-2 max-w-md text-body-sm text-on-surface-variant">
            Files and previews sent by the designer will show up here.
          </p>
        </div>
      ) : (
        <div className="p-6">
          {selectedAsset && (
            <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-low">
                {isImageAsset(selectedAsset) ? (
                  <img src={selectedAsset.url} alt={selectedAsset.filename} className="max-h-[360px] w-full object-contain" />
                ) : (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined mx-auto mb-3 block text-[56px] text-on-surface-variant">
                      description
                    </span>
                    <p className="max-w-sm text-body-sm text-on-surface-variant">Preview is not available for this file type.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div>
                  <p className="text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                    {selectedAsset.id === latest?.id ? "Latest file" : "Selected file"}
                  </p>
                  <h3 className="mt-2 text-headline-md font-semibold text-on-surface">{selectedAsset.filename}</h3>
                  <p className="mt-2 text-body-sm text-on-surface-variant">Sent {formatDate(selectedAsset.createdAt)}</p>
                </div>
                {!canDownload && (
                  <div className="rounded-lg bg-surface-container-low p-3 text-body-sm text-on-surface-variant">
                    Downloads unlock after the invoice is paid. You can preview the file here first.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="-mx-1 overflow-x-auto px-1 pb-2">
            <div className="flex gap-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`flex min-h-24 w-[280px] shrink-0 items-center gap-3 rounded-lg border p-3 text-on-surface transition-colors ${
                    selectedAsset?.id === asset.id
                      ? "border-primary bg-primary-container text-on-primary-container"
                      : "border-outline-variant bg-surface-container-low hover:border-primary"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedAssetId(asset.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="material-symbols-outlined text-[22px]">attach_file</span>
                    <span className="min-w-0">
                      <span className="block truncate text-label-md font-bold">{asset.filename}</span>
                      <span className="block text-label-sm opacity-75">{formatDate(asset.createdAt)}</span>
                    </span>
                  </button>
                  {canDownload ? (
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-3 text-label-md font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
                    >
                      Download
                    </a>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-outline" title="Locked until invoice is paid">
                      lock
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {(canApprovePreview || canRequestChanges || changesRequested) && (
            <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-low p-4">
              {changesRequested ? (
                <div className="flex items-start gap-3 text-tertiary">
                  <span className="material-symbols-outlined text-[22px]">report</span>
                  <div>
                    <p className="font-bold">Changes requested</p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      The designer can revise the work and send a new preview.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Price row — always visible */}
                  <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3">
                    <div>
                      <p className="text-label-sm font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                        Invoice amount
                      </p>
                      {project.price != null ? (
                        <p className="mt-0.5 text-[26px] font-bold leading-none text-on-surface">
                          {formatCurrency(project.price)}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-body-sm text-on-surface-variant italic">
                          No price quoted yet — ask your designer to set one.
                        </p>
                      )}
                    </div>
                    <span className="material-symbols-outlined text-[28px] text-primary">receipt_long</span>
                  </div>

                  <p className="mb-4 text-body-sm text-on-surface-variant">
                    {project.price != null
                      ? "Accept to confirm the work and automatically issue the invoice. Decline to negotiate with your designer."
                      : "You can accept the work without a price, or request changes first."}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {canRequestChanges && project.price != null && (
                      <button
                        type="button"
                        disabled={declinePending || approvalPending}
                        onClick={() => void onDeclinePrice().catch(() => undefined)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-tertiary-fixed bg-surface-container-lowest px-4 text-label-md font-bold text-tertiary transition-colors hover:bg-tertiary-fixed disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">thumb_down</span>
                        {declinePending ? "Declining…" : "Decline price"}
                      </button>
                    )}
                    {canRequestChanges && project.price == null && (
                      <button
                        type="button"
                        onClick={() => void onRequestChanges().catch(() => undefined)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-tertiary-fixed bg-surface-container-lowest px-4 text-label-md font-bold text-tertiary transition-colors hover:bg-tertiary-fixed"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        Request changes
                      </button>
                    )}
                    {canApprovePreview && (
                      <button
                        type="button"
                        disabled={approvalPending || declinePending}
                        onClick={onApprovePreview}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        {approvalPending
                          ? "Confirming…"
                          : project.price != null
                            ? `Accept & confirm ${formatCurrency(project.price)}`
                            : "Accept work"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function ClientProjectWorkspaceView({
  project,
  base,
  assets,
  members,
  feedback,
  currentUser,
  message,
  error,
  canApprovePreview,
  canRequestChanges,
  approvalPending,
  declinePending,
  changesRequested,
  onMessageChange,
  onSendMessage,
  onApprovePreview,
  onRequestChanges,
  onDeclinePrice,
}: ClientProjectWorkspaceViewProps) {
  const [approved, setApproved] = useState(false);
  const designerAssets = assets
    .filter((asset) => isDesignerAsset(asset, members))
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  const canDownload = project.status === "completed";
  const steps = buildProjectProgressSteps(project, designerAssets.length > 0, changesRequested);

  async function handleApprove() {
    await onApprovePreview();
    setApproved(true);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to={`${base}/briefs`}
        className="mb-6 inline-flex items-center gap-1 text-label-md font-bold text-on-surface-variant no-underline transition-colors hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
        Briefs
      </Link>

      <header className="mb-6">
        <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Client view</p>
        <h1 className="mt-1 text-display-lg-mobile font-bold leading-tight text-on-surface md:text-display-lg">
          {project.title}
        </h1>
        <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant">
          Follow progress, review designer files, and keep the project conversation in one place.
        </p>
      </header>

      {error && <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>}

      {(approved || project.status === "completed") && project.price != null && (
        <div className="mb-6 overflow-hidden rounded-xl border border-secondary-container bg-secondary-container/60">
          <div className="flex items-start gap-4 p-5">
            <span className="material-symbols-outlined mt-0.5 text-[24px] text-on-secondary-container">receipt_long</span>
            <div className="flex-1">
              <p className="text-label-lg font-bold text-on-secondary-container">Invoice issued</p>
              <p className="mt-1 text-body-sm text-on-secondary-container/80">
                An invoice for <strong>{formatCurrency(project.price)}</strong> has been recorded for this project.
              </p>
            </div>
            <p className="text-[22px] font-bold text-on-secondary-container">{formatCurrency(project.price)}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ClientProgressPipeline steps={steps} />
          <ClientAssetsPanel
            assets={designerAssets}
            project={project}
            canApprovePreview={canApprovePreview}
            canRequestChanges={canRequestChanges}
            approvalPending={approvalPending}
            declinePending={declinePending}
            canDownload={canDownload}
            changesRequested={changesRequested}
            onApprovePreview={() => void handleApprove()}
            onRequestChanges={onRequestChanges}
            onDeclinePrice={onDeclinePrice}
          />
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
