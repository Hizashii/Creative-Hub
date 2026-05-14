import { Outlet, Link } from "react-router-dom";

const navLinkClass =
  "px-2 py-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors no-underline sm:px-3";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:h-16 sm:flex-nowrap sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2 no-underline">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <span className="material-symbols-outlined text-[20px] text-white">widgets</span>
            </div>
            <span className="text-base font-bold text-slate-950">Creative Hub</span>
          </Link>
          <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:order-none sm:flex-1 sm:justify-center md:w-auto md:gap-x-2">
            <Link to="/#features" className={navLinkClass}>
              Features
            </Link>
            <Link to="/#for-clients" className={navLinkClass}>
              For Clients
            </Link>
            <Link to="/#for-teams" className={navLinkClass}>
              For Teams
            </Link>
            <Link to="/#pricing" className={navLinkClass}>
              Pricing
            </Link>
          </nav>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/login"
              className="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 no-underline sm:px-4"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-500 hover:to-violet-500 no-underline sm:px-4"
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
