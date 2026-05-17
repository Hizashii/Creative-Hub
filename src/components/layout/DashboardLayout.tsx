import { NavLink, Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "../../types/roles";
import { DASHBOARD_NAV } from "./dashboardNav";

function MobileDashboardNav({ area }: { area: UserRole }) {
  const items = DASHBOARD_NAV[area].slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant bg-surface-bright/95 px-2 py-2 backdrop-blur-md md:hidden">
      <div className="grid grid-cols-5 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to.endsWith("/dashboard")}
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-center no-underline transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            <span className="mt-1 max-w-full truncate text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function DashboardLayout({ area }: { area: UserRole }) {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Sidebar role={area} />
      <div className="flex min-h-screen flex-col bg-background md:ml-[280px]">
        <Navbar />
        <main className="flex-1 px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-10 lg:px-10">
          <Outlet />
        </main>
      </div>
      <MobileDashboardNav area={area} />
    </div>
  );
}
