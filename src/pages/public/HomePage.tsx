import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative px-6 py-20 md:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 via-transparent to-secondary-container/20 pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-container bg-surface-container border border-outline-variant mb-6">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            Creative operations platform
          </div>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-on-surface mb-5">
            Deliver creative work in one{" "}
            <span className="text-primary">calm, focused hub</span>
          </h1>
          <p className="text-base md:text-lg text-on-surface-variant max-w-xl mx-auto mb-8">
            Briefs, boards, assets, and chat stay together so clients and teams always share the same context—without noisy threads or lost files.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/register"
              className="px-6 py-3 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md no-underline"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-surface-container-lowest text-on-surface text-sm font-semibold rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors no-underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-primary-fixed-variant">business_center</span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-2">For clients</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Structured requirements, clear status, and a gallery plus chat tied to each project.</p>
          </article>
          <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-secondary-container">palette</span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-2">For designers</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Columns that mirror delivery, quick asset links, and feedback where the work lives.</p>
          </article>
          <article className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-on-tertiary-fixed-variant">analytics</span>
            </div>
            <h3 className="text-base font-bold text-on-surface mb-2">For leads</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">Accept briefs into projects, assign people, and keep the portfolio health visible at a glance.</p>
          </article>
        </div>
      </section>
    </div>
  );
}
