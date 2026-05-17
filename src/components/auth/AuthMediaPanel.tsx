const MARQUEE = "BRIEFS · PROJECTS · FEEDBACK · DELIVER · ";

export function AuthMediaPanel() {
  return (
    <aside className="auth-motion-panel hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden border-l border-outline-variant">
      <div className="auth-motion-bg" aria-hidden />

      <div className="auth-motion-shapes" aria-hidden>
        <div className="auth-card auth-card--primary" />
        <div className="auth-card auth-card--secondary" />
        <div className="auth-card auth-card--tertiary" />
        <div className="auth-ring" />
      </div>

      <div className="auth-marquee" aria-hidden>
        <div className="auth-marquee-track">
          <span>{MARQUEE}</span>
          <span>{MARQUEE}</span>
        </div>
      </div>

      <div className="auth-motion-copy">
        <p className="auth-motion-eyebrow">Creative Hub</p>
        <h2 className="auth-motion-headline">
          Move work <span className="auth-motion-headline-accent">forward.</span>
        </h2>
        <p className="auth-motion-sub">One workspace for agencies, designers, and clients.</p>
      </div>
    </aside>
  );
}
