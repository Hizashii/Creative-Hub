import { useState } from "react";
import { Link } from "react-router-dom";
import type { ClientPaymentMethod, ClientPaymentOption, ClientPaymentState } from "../../types/clientWorkspace";
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

const paymentOptions: ClientPaymentOption[] = [
  { id: "card", label: "Card", detail: "Visa, Mastercard, or debit card", icon: "credit_card" },
  { id: "wallet", label: "Digital wallet", detail: "Fast checkout with saved wallet", icon: "account_balance_wallet" },
  { id: "bank", label: "Bank transfer", detail: "Mock invoice payment", icon: "account_balance" },
];

function ClientAssetsPanel({
  assets,
  canApprovePreview,
  canRequestChanges,
  approvalPending,
  canDownload,
  changesRequested,
  onApprovePreview,
  onRequestChanges,
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
                  <p className="mb-3 text-label-lg font-bold text-on-surface">Ready to review?</p>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {canRequestChanges && (
                      <button
                        type="button"
                        onClick={() => void onRequestChanges().catch(() => undefined)}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-tertiary-fixed bg-surface-container-lowest px-4 text-label-md font-bold text-tertiary transition-colors hover:bg-tertiary-fixed"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit_note</span>
                        Requested changes
                      </button>
                    )}
                    {canApprovePreview && (
                      <button
                        type="button"
                        disabled={approvalPending}
                        onClick={onApprovePreview}
                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        This is amazing, I love it
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
  changesRequested,
  onMessageChange,
  onSendMessage,
  onApprovePreview,
  onRequestChanges,
}: ClientProjectWorkspaceViewProps) {
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<ClientPaymentMethod>("card");
  const [paymentState, setPaymentState] = useState<ClientPaymentState>("idle");
  const designerAssets = assets
    .filter((asset) => isDesignerAsset(asset, members))
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  const canDownload = project.status === "completed";
  const deliveryPrice = project.price ?? 0;
  const steps = buildProjectProgressSteps(project, designerAssets.length > 0, changesRequested);

  async function payInvoiceAndApprove() {
    try {
      await onApprovePreview();
      setPaymentState("paid");
    } catch {
      // Parent view surfaces the failure message.
    }
  }

  function openInvoice() {
    setPaymentState("sent");
    setInvoiceOpen(true);
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <ClientProgressPipeline steps={steps} />
          <ClientAssetsPanel
            assets={designerAssets}
            canApprovePreview={canApprovePreview}
            canRequestChanges={canRequestChanges}
            approvalPending={approvalPending}
            canDownload={canDownload}
            changesRequested={changesRequested}
            onApprovePreview={openInvoice}
            onRequestChanges={onRequestChanges}
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

      {invoiceOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-inverse-surface/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
            {paymentState === "paid" ? (
              <div className="p-6 text-center">
                <span className="material-symbols-outlined mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-container text-[30px] text-on-secondary-container">
                  verified
                </span>
                <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Payment complete</p>
                <h2 className="mt-2 text-headline-md font-semibold text-on-surface">It's all paid up!</h2>
                <p className="mx-auto mt-2 max-w-sm text-body-sm text-on-surface-variant">
                  The invoice is paid, review is complete, and every project file is now unlocked for download.
                </p>
                <button
                  type="button"
                  onClick={() => setInvoiceOpen(false)}
                  className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  View downloads
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-outline-variant px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Invoice sent</p>
                      <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Final approval invoice</h2>
                      <p className="mt-1 text-body-sm text-on-surface-variant">
                        {deliveryPrice > 0
                          ? `Pay ${formatCurrency(deliveryPrice)} to complete review and unlock every file.`
                          : "Pay to complete review and unlock every file."}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInvoiceOpen(false)}
                      className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-high"
                      aria-label="Close invoice"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 p-6">
                  {paymentOptions.map((option) => (
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
                    <p className="text-label-sm font-bold uppercase tracking-[0.08em] text-on-surface-variant">Due now</p>
                    <p className="text-headline-md font-bold text-on-surface">{formatCurrency(deliveryPrice)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={approvalPending}
                    onClick={() => void payInvoiceAndApprove()}
                    className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    {approvalPending ? "Processing..." : `Pay with ${paymentOptions.find((option) => option.id === paymentMethod)?.label ?? "selected method"}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
