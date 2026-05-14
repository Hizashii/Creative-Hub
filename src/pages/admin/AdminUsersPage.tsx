import { useEffect, useState } from "react";
import { api, ApiRequestError } from "../../api/client";
import type { AdminUser } from "../../types/domain";
import type { UserRole } from "../../types/roles";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try { setUsers(await api<AdminUser[]>("/admin/users")); }
    catch { setUsers([]); }
  }

  useEffect(() => {
    const h = window.setTimeout(() => { void refresh(); }, 0);
    return () => window.clearTimeout(h);
  }, []);

  async function updateRole(id: string, role: UserRole) {
    setError(null);
    try {
      await api(`/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      await refresh();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Update failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this user?")) return;
    setError(null);
    try {
      await api(`/admin/users/${id}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Delete failed");
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-on-surface tracking-tight">Users & team</h1>
          <p className="text-sm text-on-surface-variant mt-1">Control access, promote designers, and keep the roster aligned with delivery needs.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-sm">{error}</div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Role</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-medium text-on-surface">{u.name}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                  <td className="px-6 py-4">
                    <select
                      className="bg-surface-container border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-medium text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors min-w-[130px]"
                      value={u.role}
                      onChange={(e) => void updateRole(u.id, e.target.value as UserRole)}
                    >
                      <option value="client">Client</option>
                      <option value="designer">Designer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => void remove(u.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-error border border-error-container rounded-lg hover:bg-error-container transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-on-surface-variant">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
