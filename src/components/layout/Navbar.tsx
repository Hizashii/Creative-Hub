import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 w-full sticky top-0 z-40 bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant flex justify-between items-center px-6 md:px-10">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant"
            placeholder="Search anything"
            type="text"
            readOnly
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-low">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-fixed font-bold text-sm">
              {initials(user.name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-on-surface leading-none">{user.name}</p>
              <p className="text-xs text-on-surface-variant capitalize">{user.role}</p>
            </div>
          </div>
        )}
        {user ? (
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:block">Log out</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity no-underline"
          >
            Log in
          </Link>
        )}
      </div>
    </header>
  );
}
