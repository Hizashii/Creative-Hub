import type { ClientProgressPipelineProps } from "../../interfaces/clientWorkspace.interfaces";

const stepClasses = {
  complete: {
    marker: "bg-secondary-container text-secondary",
    line: "bg-secondary-container",
    label: "text-on-surface",
  },
  current: {
    marker: "bg-primary text-on-primary",
    line: "bg-outline-variant",
    label: "text-primary",
  },
  attention: {
    marker: "bg-tertiary-fixed text-tertiary",
    line: "bg-tertiary-fixed",
    label: "text-tertiary",
  },
  upcoming: {
    marker: "bg-surface-container-high text-on-surface-variant",
    line: "bg-outline-variant",
    label: "text-on-surface-variant",
  },
};

export function ClientProgressPipeline({ steps }: ClientProgressPipelineProps) {
  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-label-md font-bold uppercase tracking-[0.08em] text-primary">Progress</p>
        <h2 className="mt-1 text-headline-md font-semibold text-on-surface">Delivery pipeline</h2>
      </div>
      <ol className="grid gap-4 md:grid-cols-4">
        {steps.map((step, index) => {
          const classes = stepClasses[step.state];
          return (
            <li key={step.id} className="relative">
              {index < steps.length - 1 && (
                <span className={`absolute left-5 top-5 hidden h-0.5 w-[calc(100%+1rem)] md:block ${classes.line}`} />
              )}
              <div className="relative flex gap-3 md:block">
                <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${classes.marker}`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {step.state === "complete"
                      ? "check"
                      : step.state === "current"
                        ? "pending"
                        : step.state === "attention"
                          ? "report"
                          : "radio_button_unchecked"}
                  </span>
                </span>
                <div className="min-w-0 md:mt-3">
                  <h3 className={`text-label-lg font-bold ${classes.label}`}>{step.label}</h3>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{step.description}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
