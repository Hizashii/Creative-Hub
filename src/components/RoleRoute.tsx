import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { RoleRouteProps } from "../interfaces/layout.interfaces";
import type { UserRole } from "../types/roles";

const homeForRole = (role: UserRole) => {
  if (role === "admin") return "/admin/dashboard";
  if (role === "designer") return "/designer/dashboard";
  return "/client/dashboard";
};

export function RoleRoute({ roles, children }: RoleRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" aria-hidden />
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={homeForRole(user.role)} replace />;
  return <>{children}</>;
}
