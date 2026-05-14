import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import type { UserRole } from "../../types/roles";

export function DashboardLayout({ area }: { area: UserRole }) {
  return (
    <div className="min-h-screen flex bg-background text-on-background">
      <Sidebar role={area} />
      <div className="flex-1 md:ml-[280px] flex flex-col min-h-screen bg-surface-container-lowest">
        <Navbar />
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
