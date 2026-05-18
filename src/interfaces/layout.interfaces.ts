import type { ReactNode } from "react";
import type { UserRole } from "../types/roles";

export interface ProtectedRouteProps {
  children: ReactNode;
}

export interface RoleRouteProps {
  roles: UserRole[];
  children: ReactNode;
}

export interface DashboardLayoutProps {
  area: UserRole;
}

export interface MobileDashboardNavProps {
  area: UserRole;
}

export interface SidebarProps {
  role: UserRole;
}

export interface LogoMarkProps {
  className?: string;
}
