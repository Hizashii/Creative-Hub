import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { RotatingCubeScene } from "../../components/public/RotatingCubeScene";

const features = [
  { icon: "assignment", title: "Client briefs", text: "Collect requirements and references before work starts." },
  { icon: "view_kanban", title: "Project boards", text: "Track status and ownership from request to delivery." },
  { icon: "event_available", title: "Tasks & deadlines", text: "Assign work and keep the team aligned." },
  { icon: "folder_open", title: "Files & handoff", text: "Keep assets tied to the right project." },
  { icon: "forum", title: "Feedback & approvals", text: "Comments and approvals in one place." },
  { icon: "admin_panel_settings", title: "Role-based views", text: "Separate workspaces for clients, designers, and admins." },
];

const clientFlow = [
  ["1", "Submit a clear requirement"],
  ["2", "Track progress in the project workspace"],
  ["3", "Approve previews and receive final files"],
];

const teamFlow = [
  ["Queue", "Pick up new requirements when they are ready."],
  ["Work", "Manage tasks, files, feedback, and deadlines together."],
  ["Deliver", "Send previews, handle approval, and close the project."],
];

export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, [hash]);

  return (
    <>
      <section className="relative min-h-[calc(100svh-7rem)] overflow-hidden border-b border-outline-variant bg-surface-container-lowest">
        <RotatingCubeScene />
        <div className="absolute inset-y-0 left-0 w-full lg:w-[58%]" />
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-7rem)] max-w-7xl items-center px-6 py-16 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="text-[44px] font-bold leading-[48px] text-on-surface sm:text-[64px] sm:leading-[68px]">
              Creative Hub
            </h1>
            <p className="mt-5 max-w-xl text-body-lg leading-7 text-on-surface-variant">
              Deliver creative work in one focused workspace for briefs, projects, tasks, files,
              feedback, approvals, and mock payments.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-on-primary no-underline transition-opacity hover:opacity-90"
              >
                Get started
                <span aria-hidden="true">-&gt;</span>
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest px-5 text-sm font-bold text-on-surface no-underline transition-colors hover:bg-surface-container-low"
              >
                See features
                <span aria-hidden="true">v</span>
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Briefs", "Projects", "Approvals"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1 text-label-md font-semibold text-on-surface-variant"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-b border-outline-variant bg-surface-container-low">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-16">
          <div className="max-w-2xl">
            <h2 className="text-display-lg-mobile font-bold text-on-surface sm:text-display-lg">Features</h2>
            <p className="mt-3 text-body-sm leading-6 text-on-surface-variant">
              What you get in Creative Hub, organized around the way creative projects actually move.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li
                key={feature.title}
                className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-colors hover:border-primary/50 hover:bg-surface-container"
              >
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                  <span className="material-symbols-outlined text-[22px]">{feature.icon}</span>
                </span>
                <h3 className="text-body-lg font-bold text-on-surface">{feature.title}</h3>
                <p className="mt-2 text-body-sm leading-6 text-on-surface-variant">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="for-clients" className="scroll-mt-20 border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.6fr)] lg:items-center">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-label-md font-bold text-secondary">
              <span className="material-symbols-outlined text-[18px]">business_center</span>
              Client workspace
            </p>
            <h2 className="text-display-lg-mobile font-bold text-on-surface sm:text-display-lg">For clients</h2>
            <p className="mt-4 max-w-2xl text-body-sm leading-7 text-on-surface-variant">
              Submit requests, review progress, give feedback, and approve work without chasing updates
              in email or chat.
            </p>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-5">
            <div className="space-y-3">
              {clientFlow.map(([step, label]) => (
                <div key={step} className="flex items-center gap-3 rounded-lg bg-surface-container-lowest p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-secondary">
                    {step}
                  </span>
                  <span className="text-body-sm font-semibold text-on-surface">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="for-teams" className="scroll-mt-20 bg-surface-container-low">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:py-16 lg:grid-cols-[minmax(320px,0.6fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="order-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-5 shadow-sm lg:order-1">
            <div className="space-y-3">
              {teamFlow.map(([label, text]) => (
                <div key={label} className="flex gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    <span className="material-symbols-outlined text-[20px]">task_alt</span>
                  </span>
                  <div>
                    <p className="text-body-sm font-bold text-on-surface">{label}</p>
                    <p className="mt-1 text-label-md text-on-surface-variant">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="mb-3 inline-flex items-center gap-2 text-label-md font-bold text-primary">
              <span className="material-symbols-outlined text-[18px]">groups</span>
              Delivery team
            </p>
            <h2 className="text-display-lg-mobile font-bold text-on-surface sm:text-display-lg">For teams</h2>
            <p className="mt-4 max-w-2xl text-body-sm leading-7 text-on-surface-variant">
              Designers see tasks, files, and deadlines in one place. Admins assign work and monitor
              delivery across projects.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
