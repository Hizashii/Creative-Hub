import { Link } from "react-router-dom";

const features = [
  {
    title: "Client briefs",
    description:
      "Collect clear requirements, goals, references, and deliverables before work begins.",
    icon: "assignment",
  },
  {
    title: "Project boards",
    description:
      "Track every project from request to final delivery with clear status and ownership.",
    icon: "dashboard",
  },
  {
    title: "Tasks and deadlines",
    description: "Assign work, set priorities, and keep everyone aligned on what happens next.",
    icon: "event_available",
  },
  {
    title: "Files and handoff",
    description: "Keep assets, references, and final files tied to the right project.",
    icon: "folder_shared",
  },
  {
    title: "Feedback and approvals",
    description: "Centralize comments, revisions, and approvals so nothing gets lost.",
    icon: "fact_check",
  },
  {
    title: "Team and client views",
    description: "Give clients, designers, and leads the right workspace for their role.",
    icon: "groups",
  },
] as const;

const audience = [
  {
    id: "for-clients",
    title: "For clients",
    description:
      "Submit requests, review progress, give feedback, and approve work without chasing updates.",
    icon: "person",
    accent: "from-violet-500/15 to-blue-500/10",
  },
  {
    id: "for-designers",
    title: "For designers",
    description:
      "See assigned tasks, project context, files, feedback, and deadlines in one focused place.",
    icon: "palette",
    accent: "from-emerald-500/15 to-cyan-500/10",
  },
  {
    id: "for-leads",
    title: "For leads",
    description:
      "Manage workload, assign projects, monitor progress, and keep delivery on track.",
    icon: "leaderboard",
    accent: "from-indigo-500/15 to-violet-500/10",
  },
] as const;

const steps = [
  { n: "1", title: "Submit the brief", detail: "Capture goals, references, and success criteria up front." },
  { n: "2", title: "Organize the project", detail: "Structure boards, owners, and timelines in one workspace." },
  { n: "3", title: "Collaborate and review", detail: "Share files, feedback, and status without tool-hopping." },
  { n: "4", title: "Deliver and approve", detail: "Close the loop with clear approvals and handoff." },
] as const;

const credibility = [
  "No more lost feedback",
  "No more unclear client requirements",
  "No more searching across chats and folders",
  "No more guessing project status",
] as const;

function FloatingPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg shadow-indigo-500/5 backdrop-blur-sm">
      <span className="material-symbols-outlined text-[16px] text-indigo-600">{icon}</span>
      {label}
    </div>
  );
}

export function HomePage() {
  return (
    <div className="relative overflow-x-hidden bg-gradient-to-b from-[#eef2ff] via-[#f0f9ff] to-[#ecfdf5]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 102, 241, 0.22), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(59, 130, 246, 0.12), transparent), radial-gradient(ellipse 50% 30% at 0% 20%, rgba(16, 185, 129, 0.1), transparent)",
        }}
      />

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 md:pb-24 md:pt-14 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700 shadow-sm backdrop-blur-sm">
            Creative Operations Platform
          </div>
          <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl md:leading-[1.1]">
            Deliver creative projects from brief to approval in one calm hub
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
            Manage client requests, project boards, assets, feedback, deadlines, and team updates
            without scattered files, messy chats, or unclear status.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              to="/register"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 sm:w-auto"
            >
              Get started free
            </Link>
            <a
              href="#product-preview"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-white sm:w-auto"
            >
              View product demo
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-500 sm:text-sm">
            Built for creative teams, agencies, freelancers, and clients
          </p>
        </div>

        <div id="product-preview" className="relative mx-auto mt-14 max-w-5xl scroll-mt-24">
          <div className="absolute -left-4 top-1/4 z-10 hidden motion-safe:animate-[float_6s_ease-in-out_infinite] md:block lg:-left-8">
            <FloatingPill icon="post_add" label="New client brief" />
          </div>
          <div className="absolute -right-2 top-1/3 z-10 hidden motion-safe:animate-[float_7s_ease-in-out_infinite_0.5s] md:block lg:-right-6">
            <FloatingPill icon="chat" label="Feedback received" />
          </div>
          <div className="absolute -left-2 bottom-1/4 z-10 hidden motion-safe:animate-[float_5.5s_ease-in-out_infinite_1s] lg:block">
            <FloatingPill icon="check_circle" label="File approved" />
          </div>
          <div className="absolute -right-4 bottom-1/3 z-10 hidden motion-safe:animate-[float_6.5s_ease-in-out_infinite_0.2s] xl:block">
            <FloatingPill icon="schedule" label="Deadline approaching" />
          </div>

          <div className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-2xl shadow-indigo-500/10 ring-1 ring-slate-900/5 backdrop-blur-sm sm:p-3 md:rounded-3xl">
            <div className="flex overflow-hidden rounded-xl bg-slate-50 md:rounded-2xl">
              <aside className="hidden w-48 shrink-0 flex-col border-r border-slate-200 bg-white py-4 pl-3 pr-2 md:flex">
                <div className="mb-6 flex items-center gap-2 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                    <span className="material-symbols-outlined text-[18px]">widgets</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">Workspace</span>
                </div>
                {["Overview", "Projects", "Briefs", "Files", "Team"].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-lg px-2 py-2 text-xs font-medium ${i === 1 ? "bg-indigo-50 text-indigo-700" : "text-slate-600"}`}
                  >
                    {item}
                  </div>
                ))}
              </aside>
              <div className="min-w-0 flex-1 p-3 sm:p-4 md:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Client dashboard
                    </p>
                    <p className="text-sm font-bold text-slate-900">Active projects</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                      On track
                    </span>
                    <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-800">
                      Review
                    </span>
                  </div>
                </div>
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {["Brand refresh", "Social kit Q2", "Web hero"].map((title, idx) => (
                    <div
                      key={title}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <p className="text-[11px] font-bold text-slate-900">{title}</p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {idx === 0 ? "Brief approved" : idx === 1 ? "Assets in review" : "Final handoff"}
                      </p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${55 + idx * 15}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 lg:grid-cols-5">
                  <div className="lg:col-span-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Task board
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Backlog", "In progress", "Done"].map((col) => (
                        <div
                          key={col}
                          className="rounded-lg border border-slate-200 bg-slate-50/80 p-2"
                        >
                          <p className="mb-2 text-[10px] font-bold text-slate-700">{col}</p>
                          <div className="space-y-1.5">
                            <div className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] text-slate-700 shadow-sm">
                              Layout v3
                            </div>
                            {col !== "Done" && (
                              <div className="rounded-md border border-dashed border-slate-300 bg-white/50 px-2 py-1.5 text-[9px] text-slate-400">
                                + Add
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Recent updates
                    </p>
                    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                      {[
                        { t: "Comment on hero art", m: "2m ago" },
                        { t: "Version 4 uploaded", m: "1h ago" },
                        { t: "Client approved copy deck", m: "Yesterday" },
                      ].map((u) => (
                        <div
                          key={u.t}
                          className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                        >
                          <span className="text-[10px] font-medium text-slate-800">{u.t}</span>
                          <span className="shrink-0 text-[9px] text-slate-400">{u.m}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-2 py-2">
                      <span className="material-symbols-outlined text-[16px] text-indigo-600">
                        attach_file
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-900">Handoff package</p>
                        <p className="text-[9px] text-indigo-700/80">Final exports + source files</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative scroll-mt-24 border-t border-slate-200/60 bg-white/50 py-16 backdrop-blur-sm sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Everything your creative workflow needs
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              One workspace shaped around how agencies and clients actually ship work together.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                  <span className="material-symbols-outlined text-[22px]">{f.icon}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
          <div
            id="for-clients"
            className={`scroll-mt-24 rounded-2xl border border-slate-200/80 bg-gradient-to-br ${audience[0].accent} p-6 shadow-sm backdrop-blur-sm`}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-indigo-700 shadow-sm ring-1 ring-slate-200/60">
              <span className="material-symbols-outlined text-[24px]">{audience[0].icon}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{audience[0].title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{audience[0].description}</p>
          </div>
          <div id="for-teams" className="scroll-mt-24 grid gap-6 md:grid-cols-2">
            {audience.slice(1).map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl border border-slate-200/80 bg-gradient-to-br ${a.accent} p-6 shadow-sm backdrop-blur-sm`}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-indigo-700 shadow-sm ring-1 ring-slate-200/60">
                  <span className="material-symbols-outlined text-[24px]">{a.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-y border-slate-200/60 bg-slate-950 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="relative text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-lg font-bold text-white shadow-lg">
                  {s.n}
                </div>
                <h3 className="text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-indigo-50/40 to-emerald-50/30 p-8 shadow-xl shadow-indigo-500/5 sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Replace scattered tools with one shared creative workspace
              </h2>
              <ul className="mx-auto mt-8 max-w-xl space-y-3 text-left text-sm text-slate-700 sm:text-base">
                {credibility.map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 shrink-0 text-emerald-600 text-[20px]">
                      check_circle
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="relative scroll-mt-24 pb-20 pt-4 sm:pb-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white/90 p-8 text-center shadow-lg backdrop-blur-sm sm:p-10">
            <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">
              Ready to bring calm to your creative workflow?
            </h2>
            <p className="mt-3 text-sm text-slate-600 sm:text-base">
              Start free and invite your team when you are ready. No credit card required to explore.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500"
              >
                Start free
              </Link>
              <a
                href="#product-preview"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300"
              >
                View demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
