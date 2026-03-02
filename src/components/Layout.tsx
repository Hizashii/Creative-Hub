import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/projects" className="brand">
          Creative Hub
        </Link>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
