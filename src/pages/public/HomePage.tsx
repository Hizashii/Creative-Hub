import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const features = [
  { title: "Client briefs", text: "Collect requirements and references before work starts." },
  { title: "Project boards", text: "Track status and ownership from request to delivery." },
  { title: "Tasks & deadlines", text: "Assign work and keep the team aligned." },
  { title: "Files & handoff", text: "Keep assets tied to the right project." },
  { title: "Feedback & approvals", text: "Comments and approvals in one place." },
  { title: "Role-based views", text: "Separate workspaces for clients, designers, and leads." },
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
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Deliver creative work in one calm, focused hub
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Briefs, projects, tasks, files, and feedback for creative teams and their clients.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary no-underline hover:opacity-90"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 no-underline hover:bg-slate-50"
            >
              See features
            </a>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 border-b border-slate-200 bg-[#f4f7fb]">
        <div className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
          <h2 className="text-xl font-bold text-slate-900">Features</h2>
          <p className="mt-2 text-sm text-slate-600">What you get in Creative Hub.</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f.title} className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="for-clients" className="scroll-mt-20 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
          <h2 className="text-xl font-bold text-slate-900">For clients</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Submit requests, review progress, give feedback, and approve work without chasing updates
            in email or chat.
          </p>
        </div>
      </section>

      <section id="for-teams" className="scroll-mt-20 bg-[#f4f7fb]">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
          <h2 className="text-xl font-bold text-slate-900">For teams</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Designers see tasks, files, and deadlines in one place. Leads assign work and monitor
            delivery across projects.
          </p>
        </div>
      </section>

    </>
  );
}
