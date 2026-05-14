import { useCallback, useEffect, useState } from "react";
import { api, ApiRequestError } from "../../api/client";
import type { InvoiceRow } from "../../types/dashboard";
import type { Project } from "../../types/domain";
import type { ClientDirectoryRow } from "../../types/dashboard";
import { useAuth } from "../../hooks/useAuth";

const statuses = ["draft", "sent", "paid", "void"] as const;

export function InvoicesPage() {
  const { user } = useAuth();
  const canEdit = user?.role === "admin" || user?.role === "designer";

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientDirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [projectId, setProjectId] = useState("");
  const [clientUserId, setClientUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("draft");

  const refresh = useCallback(async () => {
    try {
      const [inv, proj, cli] = await Promise.all([
        api<InvoiceRow[]>("/invoices"),
        api<Project[]>("/projects"),
        canEdit ? api<ClientDirectoryRow[]>("/dashboard/clients").catch(() => [] as ClientDirectoryRow[]) : Promise.resolve([] as ClientDirectoryRow[]),
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

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
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

  async function patchStatus(id: string, next: (typeof statuses)[number]) {
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
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Invoices</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {canEdit
              ? "Create and track invoices tied to projects and clients."
              : "Invoices shared with your account."}
          </p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            {showForm ? "Close form" : "New invoice"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      {canEdit && showForm && (
        <form
          onSubmit={(e) => void createInvoice(e)}
          className="mb-8 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Amount (USD)
              </label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Project (optional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Client (optional)
              </label>
              <select
                value={clientUserId}
                onChange={(e) => setClientUserId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
              >
                <option value="">—</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Due date (optional)
              </label>
              <input
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                type="date"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90"
          >
            Create invoice
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-on-surface-variant">Loading…</p>}

      {!loading && invoices.length === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-sm text-on-surface-variant">
          No invoices yet.
        </div>
      )}

      {!loading && invoices.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Project
                </th>
                <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Due
                </th>
                {canEdit && (
                  <th className="text-right px-4 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{inv.title}</p>
                    {inv.description && <p className="text-xs text-on-surface-variant mt-0.5">{inv.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">{inv.projectTitle ?? "—"}</td>
                  <td className="px-4 py-3 text-right font-medium text-on-surface whitespace-nowrap">
                    {inv.currency} {inv.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    {canEdit ? (
                      <select
                        value={inv.status}
                        onChange={(e) => void patchStatus(inv.id, e.target.value as (typeof statuses)[number])}
                        className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1 text-xs font-medium"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs font-semibold capitalize">{inv.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void remove(inv.id)}
                        className="text-xs font-semibold text-error hover:underline"
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
      )}
    </div>
  );
}
