const steps = [
  {
    title: "Upload",
    description: "Upload your track and choose a service.",
  },
  {
    title: "Pay",
    description: "Secure card payment.",
  },
  {
    title: "Mastering",
    description: "Manual mastering by an engineer.",
  },
  {
    title: "Receive",
    description: "Download your finished master in high quality.",
  },
] as const;

function StepCircle({
  n,
  active,
}: {
  n: number;
  active: boolean;
}) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors sm:h-10 sm:w-10 sm:text-sm ${
        active
          ? "bg-black text-white"
          : "border border-gray-300 bg-white text-black"
      }`}
    >
      {n}
    </span>
  );
}

type StepProgressProps = {
  /** 1-based index of the active step (filled circle). */
  activeStep?: number;
};

export function StepProgress({ activeStep = 1 }: StepProgressProps) {
  return (
    <section className="w-full" aria-labelledby="flow-steps-heading">
      <p
        id="flow-steps-heading"
        className="text-center text-[13px] font-medium text-gray-500 sm:text-sm"
      >
        How it works
      </p>

      {/* Mobile: vertical list */}
      <ol className="mt-6 space-y-0 md:hidden">
        {steps.map((step, index) => {
          const n = index + 1;
          const isActive = n === activeStep;
          return (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepCircle n={n} active={isActive} />
                {index < steps.length - 1 ? (
                  <div className="my-2.5 min-h-[2.5rem] w-px flex-1 bg-gray-200" />
                ) : null}
              </div>
              <div className={`pb-8 pt-0.5 ${index === steps.length - 1 ? "pb-0" : ""}`}>
                <p className="text-[13px] font-semibold text-black sm:text-sm">
                  {step.title}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal with connecting line */}
      <div className="relative mt-10 hidden md:block">
        <div
          className="pointer-events-none absolute left-[11%] right-[11%] top-5 z-0 h-px bg-gray-200 lg:left-[9%] lg:right-[9%]"
          aria-hidden
        />
        <ol className="relative z-10 flex justify-between gap-1.5 lg:gap-3">
          {steps.map((step, index) => {
            const n = index + 1;
            const isActive = n === activeStep;
            return (
              <li
                key={step.title}
                className="flex w-[22%] min-w-0 flex-col items-center text-center lg:w-[23%]"
              >
                <StepCircle n={n} active={isActive} />
                <p className="mt-3 text-[13px] font-semibold text-black sm:text-sm">
                  {step.title}
                </p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
