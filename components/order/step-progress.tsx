const steps = [
  {
    title: "Skicka in",
    description: "Ladda upp ditt spår och välj tjänst.",
  },
  {
    title: "Betala",
    description: "Säker betalning med kort.",
  },
  {
    title: "Jag mastrar",
    description: "Jag mastrar ditt spår för hand.",
  },
  {
    title: "Få din master",
    description: "Du laddar ner din färdiga master i hög kvalitet.",
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
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
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
        className="text-center text-sm font-medium text-gray-500"
      >
        Så fungerar det
      </p>

      {/* Mobile: vertical list */}
      <ol className="mt-8 space-y-0 md:hidden">
        {steps.map((step, index) => {
          const n = index + 1;
          const isActive = n === activeStep;
          return (
            <li key={step.title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepCircle n={n} active={isActive} />
                {index < steps.length - 1 ? (
                  <div className="my-3 min-h-[3rem] w-px flex-1 bg-gray-200" />
                ) : null}
              </div>
              <div className={`pb-10 pt-0.5 ${index === steps.length - 1 ? "pb-0" : ""}`}>
                <p className="text-sm font-semibold text-black">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Desktop: horizontal with connecting line */}
      <div className="relative mt-12 hidden md:block">
        <div
          className="pointer-events-none absolute left-[11%] right-[11%] top-5 z-0 h-px bg-gray-200 lg:left-[9%] lg:right-[9%]"
          aria-hidden
        />
        <ol className="relative z-10 flex justify-between gap-2 lg:gap-4">
          {steps.map((step, index) => {
            const n = index + 1;
            const isActive = n === activeStep;
            return (
              <li
                key={step.title}
                className="flex w-[22%] min-w-0 flex-col items-center text-center lg:w-[23%]"
              >
                <StepCircle n={n} active={isActive} />
                <p className="mt-4 text-sm font-semibold text-black">{step.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
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
