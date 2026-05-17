import { Outlet, Link } from "react-router-dom";

const navLinkClass =
  "px-1.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors no-underline sm:px-3 sm:text-sm";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-sm font-bold text-slate-900 no-underline">
            Creative Hub
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
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary no-underline hover:opacity-90"
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
