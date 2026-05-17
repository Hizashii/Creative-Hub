import { NavLink } from "react-router-dom";
import type { UserRole } from "../../types/roles";
import { AREA_LABEL, DASHBOARD_NAV } from "./dashboardNav";
import { LogoMark } from "../LogoMark";

const activeClass =
  "bg-primary-container text-on-primary-container rounded-lg font-bold flex items-center gap-3 px-4 py-3 border-l-4 border-primary shadow-sm no-underline";
const inactiveClass =
  "text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors duration-200 rounded-lg no-underline";

export function Sidebar({ role }: { role: UserRole }) {
  const items = DASHBOARD_NAV[role];

  return (
    <nav className="fixed left-0 top-0 z-50 hidden h-screen w-[280px] flex-col overflow-y-auto border-r border-outline-variant bg-surface px-4 py-6 md:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <LogoMark className="h-11 w-11" />
        <div className="min-w-0">
          <h1 className="truncate text-headline-md font-bold leading-tight text-on-surface">Creative Hub</h1>
          <p className="text-label-md text-on-surface-variant">{AREA_LABEL[role]}</p>
        </div>
        <span className="material-symbols-outlined ml-auto text-[18px] text-on-surface-variant">unfold_more</span>
      </div>

      <div className="flex-1 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith("/dashboard")}
            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="text-label-md font-semibold">{item.label}</span>
            {item.badge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-on-error">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-8">
        <p className="mb-2 px-4 text-label-sm font-bold uppercase tracking-[0.08em] text-outline">
          Favourite
        </p>
        <div className="space-y-1">
          <NavLink
            to={`/${role}/projects`}
            className="flex items-center gap-3 rounded-lg px-4 py-2 text-on-surface-variant no-underline transition-colors hover:bg-surface-container-high"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded bg-primary-container text-[10px] text-primary">
              <span className="material-symbols-outlined text-[12px]">star</span>
            </span>
            <span className="text-label-md font-semibold">Active Projects</span>
          </NavLink>
        </div>
      </div>

      <div className="mt-auto border-t border-outline-variant pt-6">
        <p className="px-4 text-label-sm leading-5 text-on-surface-variant">
          Creative Hub workspace
        </p>
      </div>
    </nav>
  );
}
