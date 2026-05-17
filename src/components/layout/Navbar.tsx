import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { IconButton } from "../dashboard/DashboardPrimitives";
import { getInitials, titleize } from "../../utils/format";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-bright/85 px-4 backdrop-blur-md sm:px-6 md:px-10">
      <div className="flex min-w-0 flex-1 items-center">
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-sm font-bold text-on-primary-container md:hidden">
          CH
        </div>
        <div className="relative hidden w-full max-w-md md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            className="h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-10 pr-4 text-body-sm text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
            placeholder="Search projects, clients, or documents"
            type="text"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <IconButton icon="notifications" label="Notifications" />
        <IconButton icon="settings" label="Settings" className="hidden sm:inline-flex" />
        {user && (
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 shadow-sm sm:px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-label-md font-semibold leading-none text-on-surface">{user.name}</p>
              <p className="text-label-sm text-on-surface-variant">{titleize(user.role)}</p>
            </div>
          </div>
        )}
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex h-10 items-center gap-1.5 rounded-lg border border-outline-variant px-3 text-label-md font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:block">Log out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary no-underline transition-opacity hover:opacity-90"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
