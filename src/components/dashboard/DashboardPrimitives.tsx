import type { ReactNode } from "react";

type Tone = "primary" | "secondary" | "tertiary" | "error" | "neutral";

const toneClasses: Record<Tone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  error: "bg-error-container text-on-error-container",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

const iconToneClasses: Record<Tone, string> = {
  primary: "bg-primary-fixed text-primary",
  secondary: "bg-secondary-fixed text-secondary",
  tertiary: "bg-tertiary-fixed text-tertiary",
  error: "bg-error-container text-error",
  neutral: "bg-surface-container-high text-on-surface-variant",
};

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-label-md font-bold uppercase tracking-[0.08em] text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-display-lg-mobile font-bold leading-tight text-on-surface md:text-display-lg">
          {title}
        </h1>
        <p className="mt-2 text-body-sm text-on-surface-variant md:text-body-lg">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  icon: string;
  helper?: ReactNode;
  tone?: Tone;
};

export function MetricCard({ label, value, icon, helper, tone = "primary" }: MetricCardProps) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <p className="text-label-md font-bold uppercase tracking-[0.08em] text-on-surface-variant">
          {label}
        </p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconToneClasses[tone]}`}>
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
      </div>
      <div className="text-[28px] font-bold leading-none text-on-surface">{value}</div>
      {helper && <div className="mt-3 text-body-sm text-on-surface-variant">{helper}</div>}
    </section>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className = "" }: SurfaceCardProps) {
  return (
    <section className={`rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm ${className}`}>
      {children}
    </section>
  );
}

type StatusPillProps = {
  children: ReactNode;
  tone?: Tone;
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-sm font-bold capitalize ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

type EmptyStateProps = {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center">
      <span className="material-symbols-outlined mx-auto mb-3 block text-[40px] text-on-surface-variant">
        {icon}
      </span>
      <h2 className="text-headline-md font-semibold text-on-surface">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-body-sm text-on-surface-variant">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

type IconButtonProps = {
  icon: string;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
};

export function IconButton({ icon, label, onClick, type = "button", className = "" }: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface ${className}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}
