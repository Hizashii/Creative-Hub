import type { UserRole } from "../../types/roles";
import type { NavItem } from "../../interfaces/navigation.interfaces";

export const DASHBOARD_NAV: Record<UserRole, NavItem[]> = {
  admin: [
    { to: "/admin/updates", label: "Updates", icon: "notifications" },
    { to: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/calendar", label: "Calendar", icon: "calendar_today" },
    { to: "/admin/tasks", label: "My Tasks", icon: "assignment_turned_in" },
    { to: "/admin/projects", label: "Projects", icon: "folder_open" },
    { to: "/admin/users", label: "Teams", icon: "group" },
    { to: "/admin/clients", label: "Clients", icon: "person" },
    { to: "/admin/invoices", label: "Invoices", icon: "receipt_long" },
    { to: "/admin/documents", label: "Documents", icon: "description" },
  ],
  designer: [
    { to: "/designer/updates", label: "Updates", icon: "notifications" },
    { to: "/designer/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/designer/calendar", label: "Calendar", icon: "calendar_today" },
    { to: "/designer/tasks", label: "My Tasks", icon: "assignment_turned_in" },
    { to: "/designer/projects", label: "Projects", icon: "folder_open" },
    { to: "/designer/teams", label: "Teams", icon: "group" },
    { to: "/designer/clients", label: "Clients", icon: "person" },
    { to: "/designer/invoices", label: "Invoices", icon: "receipt_long" },
    { to: "/designer/documents", label: "Documents", icon: "description" },
  ],
  client: [
    { to: "/client/updates", label: "Updates", icon: "notifications" },
    { to: "/client/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/client/calendar", label: "Calendar", icon: "calendar_today" },
    { to: "/client/invoices", label: "Invoices", icon: "receipt_long" },
    { to: "/client/documents", label: "Documents", icon: "description" },
  ],
};

export const AREA_LABEL: Record<UserRole, string> = {
  admin: "Administration",
  designer: "Creative Pro",
  client: "Client Workspace",
};
