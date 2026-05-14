import { Outlet, Link } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="h-16 w-full sticky top-0 z-50 bg-surface-bright/80 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-6 md:px-10">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[20px]">widgets</span>
          </div>
          <span className="text-base font-bold text-on-surface">Creative Hub</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors no-underline">
            Log in
          </Link>
          <Link to="/register" className="px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity no-underline">
            Sign up
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
