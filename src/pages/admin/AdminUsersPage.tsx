import { useEffect, useState } from "react";
import { api, ApiRequestError } from "../../api/client";
import type { AdminUser } from "../../types/domain";
import type { UserRole } from "../../types/roles";
import { MetricCard, PageHeader, SurfaceCard } from "../../components/dashboard/DashboardPrimitives";
import { getInitials, titleize } from "../../utils/format";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setUsers(await api<AdminUser[]>("/admin/users"));
    } catch {
      setUsers([]);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  async function updateRole(id: string, role: UserRole) {
    setError(null);
    try {
      await api(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this user?")) return;
    setError(null);
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      await refresh();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed");
    }
  }

  const admins = users.filter((user) => user.role === "admin").length;
  const designers = users.filter((user) => user.role === "designer").length;
  const clients = users.filter((user) => user.role === "client").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Access"
        title="Users and teams"
        description="Control roles, promote designers, and keep the roster aligned with delivery needs."
        actions={
          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-label-md font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Invite user
          </button>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-4">
        <MetricCard label="Total users" value={users.length} icon="group" helper="All registered accounts" />
        <MetricCard label="Admins" value={admins} icon="admin_panel_settings" helper="Full access" tone="tertiary" />
        <MetricCard label="Designers" value={designers} icon="draw" helper="Delivery team" tone="secondary" />
        <MetricCard label="Clients" value={clients} icon="person" helper="Brief owners" tone="neutral" />
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-error-container p-3 text-body-sm text-on-error-container">{error}</div>
      )}

      <SurfaceCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead className="bg-surface-container-low text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-surface-container-low">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-md font-bold text-primary">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-semibold text-on-surface">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">{user.email}</td>
                  <td className="px-5 py-4">
                    <select
                      className="h-9 min-w-[130px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-label-md font-semibold text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      value={user.role}
                      onChange={(event) => void updateRole(user.id, event.target.value as UserRole)}
                    >
                      <option value="client">{titleize("client")}</option>
                      <option value="designer">{titleize("designer")}</option>
                      <option value="admin">{titleize("admin")}</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => void remove(user.id)}
                      className="rounded-lg border border-error-container px-3 py-1.5 text-label-md font-bold text-error transition-colors hover:bg-error-container"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-body-sm text-on-surface-variant">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  );
}
