import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiRequestError } from "../../api/client";
import type { InvoiceRow } from "../../types/dashboard";
import type { Project } from "../../types/domain";
import type { ClientDirectoryRow } from "../../types/dashboard";
import { useAuth } from "../../hooks/useAuth";
import { EmptyState, MetricCard, PageHeader, StatusPill, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { formatCurrency, formatDate, titleize } from "../../utils/format";

const statuses = ["draft", "sent", "paid", "void"] as const;
type InvoiceStatus = (typeof statuses)[number];
type InvoiceFilter = "all" | InvoiceStatus;

const statusTone: Record<string, "primary" | "secondary" | "tertiary" | "error" | "neutral"> = {
  draft: "neutral",
  sent: "tertiary",
  paid: "secondary",
  void: "error",
};

export function InvoicesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "designer";

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<InvoiceFilter>("all");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientUserId, setClientUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("draft");

  const refresh = useCallback(async () => {
    try {
      const [inv, proj, cli] = await Promise.all([
        api<InvoiceRow[]>("/invoices"),
        api<Project[]>("/projects"),
        canEdit
          ? api<ClientDirectoryRow[]>("/dashboard/clients").catch(() => [] as ClientDirectoryRow[])
          : Promise.resolve([] as ClientDirectoryRow[]),
      ]);
      setInvoices(inv);
      setProjects(proj);
      setClients(cli);
    } catch {
      setInvoices([]);
    }
  }, [canEdit]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const visibleInvoices = useMemo(
    () => invoices.filter((invoice) => filter === "all" || invoice.status === filter),
    [filter, invoices],
  );

  const paidRevenue = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstanding = invoices
    .filter((invoice) => invoice.status === "draft" || invoice.status === "sent")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdue = invoices.filter((invoice) => {
    if (!invoice.dueDate || invoice.status === "paid" || invoice.status === "void") return false;
    return new Date(invoice.dueDate).getTime() < Date.now();
  });

  async function createInvoice(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const amt = Number.parseFloat(amount);
    if (!title.trim() || Number.isNaN(amt) || amt < 0) {
      setError("Enter a title and a valid amount.");
      return;
    }
    try {
      await api<InvoiceRow>("/invoices", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          amount: amt,
          status,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          projectId: projectId || null,
          clientUserId: clientUserId || null,
        }),
      });
      setTitle("");
      setAmount("");
      setProjectId("");
      setClientUserId("");
      setDueDate("");
      setStatus("draft");
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not create invoice");
    }
  }

  async function patchStatus(id: string, next: InvoiceStatus) {
    setError(null);
    try {
      await api(`/invoices/${id}`, { method: "PATCH", body: JSON.stringify({ status: next }) });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this invoice?")) return;
    setError(null);
    try {
      await api(`/invoices/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Finance"
        title="Invoices"
        description={canEdit ? "Manage agency finances and track client payments." : "Invoices shared with your account."}
        actions={
          canEdit && (
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-[18px]">{showForm ? "close" : "add"}</span>
              {showForm ? "Close form" : "New invoice"}
            </button>
          )
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricCard label="Total revenue" value={formatCurrency(paidRevenue)} icon="payments" helper="Paid invoices" tone="secondary" />
        <MetricCard label="Outstanding" value={formatCurrency(outstanding)} icon="pending" helper="Draft and sent invoices" tone="tertiary" />
        <MetricCard label="Overdue" value={formatCurrency(overdue.reduce((sum, invoice) => sum + invoice.amount, 0))} icon="warning" helper={`${overdue.length} require attention`} tone="error" />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>
      )}

      {canEdit && showForm && (
        <SurfaceCard className="mb-8 p-6">
          <form onSubmit={(event) => void createInvoice(event)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Amount (USD)
                </span>
                <input
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Project
                </span>
                <select
                  value={projectId}
                  onChange={(event) => setProjectId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">No project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Client
                </span>
                <select
                  value={clientUserId}
                  onChange={(event) => setClientUserId(event.target.value)}
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">No client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as InvoiceStatus)}
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {titleize(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  Due date
                </span>
                <input
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  type="date"
                  className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
            >
              Create invoice
            </button>
          </form>
        </SurfaceCard>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...statuses] as InvoiceFilter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-label-md font-bold transition-colors ${
              filter === item
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            {item === "all" ? "All invoices" : titleize(item)}
          </button>
        ))}
      </div>

      {loading && <p className="text-body-sm text-on-surface-variant">Loading...</p>}

      {!loading && visibleInvoices.length === 0 && (
        <EmptyState
          icon="receipt_long"
          title="No invoices found"
          description={filter === "all" ? "Create an invoice tied to a client or project." : "No invoices match this status."}
        />
      )}

      {!loading && visibleInvoices.length > 0 && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SurfaceCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-body-sm">
                <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Due</th>
                    {canEdit && <th className="px-5 py-3 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {visibleInvoices.map((invoice) => (
                    <tr key={invoice.id} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-on-surface">{invoice.title}</p>
                        {invoice.description && <p className="mt-1 text-label-sm text-on-surface-variant">{invoice.description}</p>}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">{invoice.projectTitle ?? "-"}</td>
                      <td className="px-5 py-4 text-right font-semibold text-on-surface">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-5 py-4">
                        {canEdit ? (
                          <select
                            value={invoice.status}
                            onChange={(event) => void patchStatus(invoice.id, event.target.value as InvoiceStatus)}
                            className="h-9 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 text-label-md font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                          >
                            {statuses.map((item) => (
                              <option key={item} value={item}>
                                {titleize(item)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusPill tone={statusTone[invoice.status] ?? "neutral"}>{titleize(invoice.status)}</StatusPill>
                        )}
                      </td>
                      <td className="px-5 py-4 text-on-surface-variant">{formatDate(invoice.dueDate)}</td>
                      {canEdit && (
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => void remove(invoice.id)}
                            className="rounded-lg border border-error-container px-3 py-1.5 text-label-md font-bold text-error transition-colors hover:bg-error-container"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <aside className="space-y-6">
            <SurfaceCard className="p-5">
              <h2 className="mb-4 text-headline-md font-semibold text-on-surface">Recent activity</h2>
              <ul className="space-y-4">
                {invoices.slice(0, 4).map((invoice) => (
                  <li key={invoice.id} className="border-b border-outline-variant pb-4 last:border-b-0 last:pb-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="font-semibold text-on-surface">{invoice.title}</p>
                      <StatusPill tone={statusTone[invoice.status] ?? "neutral"}>{titleize(invoice.status)}</StatusPill>
                    </div>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatCurrency(invoice.amount, invoice.currency)}
                      {invoice.projectTitle ? ` / ${invoice.projectTitle}` : ""}
                    </p>
                    <p className="mt-1 text-label-sm text-outline">Updated {formatDate(invoice.updatedAt ?? invoice.createdAt)}</p>
                  </li>
                ))}
              </ul>
            </SurfaceCard>

            <SurfaceCard className="bg-primary p-6 text-on-primary">
              <h2 className="mb-3 text-headline-md font-semibold">Payment setup</h2>
              <p className="text-body-sm text-on-primary/90">
                Keep payment method notes and client billing follow-up connected to each invoice status.
              </p>
            </SurfaceCard>
          </aside>
        </div>
      )}
    </div>
  );
}
