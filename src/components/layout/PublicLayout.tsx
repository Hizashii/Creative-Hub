import { Outlet, Link } from "react-router-dom";
import { LogoMark } from "../LogoMark";

const navLinkClass =
  "px-1.5 py-2 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors no-underline sm:px-3 sm:text-sm";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-on-surface no-underline">
            <LogoMark className="h-9 w-9" />
            <span>Creative Hub</span>
          </Link>
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <a href="#features" className={navLinkClass}>
              Features
            </a>
            <a href="#for-clients" className={navLinkClass}>
              For Clients
            </a>
            <a href="#for-teams" className={navLinkClass}>
              For Teams
            </a>
          </nav>
          <nav className="flex items-center gap-2">
            <Link to="/login" className={`${navLinkClass} hidden sm:inline`}>
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-on-primary no-underline hover:opacity-90"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
