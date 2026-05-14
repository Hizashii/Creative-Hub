import { NavLink } from "react-router-dom";
import type { UserRole } from "../../types/roles";

type NavItem = { to: string; label: string; icon: string };

const ADMIN_NAV: NavItem[] = [
  { to: "/admin/updates",    label: "Updates",   icon: "notifications" },
  { to: "/admin/dashboard",  label: "Dashboard", icon: "dashboard" },
  { to: "/admin/calendar",   label: "Calendar",  icon: "calendar_today" },
  { to: "/admin/tasks",      label: "My Tasks",  icon: "assignment_turned_in" },
  { to: "/admin/projects",   label: "Projects",  icon: "folder_open" },
  { to: "/admin/users",      label: "Teams",     icon: "group" },
  { to: "/admin/leads",      label: "Leads",     icon: "analytics" },
  { to: "/admin/clients",    label: "Clients",   icon: "person" },
  { to: "/admin/invoices",   label: "Invoices",  icon: "receipt_long" },
  { to: "/admin/documents",  label: "Documents", icon: "description" },
];

const DESIGNER_NAV: NavItem[] = [
  { to: "/designer/updates",   label: "Updates",   icon: "notifications" },
  { to: "/designer/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/designer/calendar",  label: "Calendar",  icon: "calendar_today" },
  { to: "/designer/tasks",     label: "My Tasks",  icon: "assignment_turned_in" },
  { to: "/designer/projects",  label: "Projects",  icon: "folder_open" },
  { to: "/designer/teams",     label: "Teams",     icon: "group" },
  { to: "/designer/leads",     label: "Leads",     icon: "analytics" },
  { to: "/designer/clients",   label: "Clients",   icon: "person" },
  { to: "/designer/invoices",  label: "Invoices",  icon: "receipt_long" },
  { to: "/designer/documents", label: "Documents", icon: "description" },
];

const CLIENT_NAV: NavItem[] = [
  { to: "/client/updates",   label: "Updates",   icon: "notifications" },
  { to: "/client/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/client/calendar",  label: "Calendar",  icon: "calendar_today" },
  { to: "/client/invoices",  label: "Invoices",  icon: "receipt_long" },
  { to: "/client/documents", label: "Documents", icon: "description" },
];

const NAV: Record<UserRole, NavItem[]> = {
  admin: ADMIN_NAV,
  designer: DESIGNER_NAV,
  client: CLIENT_NAV,
};

const areaLabel: Record<UserRole, string> = {
  admin: "Administration",
  designer: "Creative Pro",
  client: "Client Workspace",
};

const activeClass =
  "bg-primary-container text-on-primary-container rounded-lg font-bold flex items-center gap-3 px-4 py-3 border-l-4 border-primary shadow-sm no-underline";
const inactiveClass =
  "text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors duration-200 rounded-lg no-underline";

export function Sidebar({ role }: { role: UserRole }) {
  const items = NAV[role];

  return (
    <nav className="w-[280px] h-screen fixed left-0 top-0 border-r border-outline-variant bg-surface hidden md:flex flex-col py-6 px-4 z-50 overflow-y-auto">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xl">
          CH
        </div>
        <div>
          <h1 className="text-base font-bold text-on-surface leading-tight">Creative Hub</h1>
          <p className="text-xs text-on-surface-variant font-normal">{areaLabel[role]}</p>
        </div>
      </div>

      {/* Main nav */}
      <div className="flex-1 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith("/dashboard")}
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-xs font-semibold tracking-wide">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
