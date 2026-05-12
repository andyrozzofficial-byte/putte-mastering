const primaryCredits: readonly {
  id: string;
  lines: readonly string[];
  className: string;
}[] = [
  {
    id: "bts",
    lines: ["BTS"],
    className:
      "text-[clamp(1.85rem,5.2vw,2.95rem)] font-semibold tracking-[-0.13em] text-black/[0.9]",
  },
  {
    id: "nct",
    lines: ["NCT"],
    className:
      "text-[clamp(1.6rem,4.6vw,2.5rem)] font-medium tracking-[0.16em] text-black/[0.74]",
  },
  {
    id: "txt",
    lines: ["TXT"],
    className:
      "text-[clamp(1.72rem,4.9vw,2.7rem)] font-light tracking-[0.44em] text-black/[0.8]",
  },
  {
    id: "itzy",
    lines: ["ITZY"],
    className:
      "text-[clamp(1.75rem,5vw,2.8rem)] font-bold tracking-[0.05em] text-black/[0.86]",
  },
] as const;

const warnerMark = {
  lines: ["WARNER", "CHAPPELL"] as const,
  className:
    "text-[0.65rem] font-medium uppercase leading-[1.4] tracking-[0.4em] text-black/[0.58] sm:text-[0.7rem] sm:tracking-[0.44em]",
};

function CreditMark({
  lines,
  className,
}: {
  lines: readonly string[];
  className: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {lines.map((line) => (
        <span key={line} className="block whitespace-nowrap">
          {line}
        </span>
      ))}
    </div>
  );
}

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="border-y border-black/[0.06] bg-[#fafafa] py-14 sm:py-16 md:py-20"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <header className="mx-auto max-w-xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
            Credits
          </p>
          <h2
            id="trusted-heading"
            className="mt-4 text-[1.4rem] font-normal leading-[1.2] tracking-[-0.025em] text-black/[0.92] sm:text-2xl md:text-[1.8rem]"
          >
            Selected collaborations
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[13px] leading-relaxed text-black/44 sm:text-sm">
            A snapshot of recent mastering work across pop, electronic, and label projects.
          </p>
        </header>

        <div
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-12 sm:mt-16 sm:gap-x-10 sm:gap-y-14 md:mt-[4.75rem] md:grid-cols-5 md:gap-x-4 md:gap-y-0 lg:gap-x-6"
          role="list"
          aria-label="Past credits and collaborations"
        >
          {primaryCredits.map((item) => (
            <div key={item.id} role="listitem" className="flex items-end justify-center pb-1">
              <CreditMark lines={item.lines} className={item.className} />
            </div>
          ))}
          <div
            role="listitem"
            className="col-span-2 flex items-end justify-center border-t border-black/[0.07] pt-10 md:col-span-1 md:border-l md:border-t-0 md:pt-0 md:pl-8 lg:pl-10"
          >
            <CreditMark lines={warnerMark.lines} className={warnerMark.className} />
          </div>
        </div>

        <p className="mt-14 text-center sm:mt-16">
          <a
            href="#contact"
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/45 transition-colors hover:text-black/65 sm:text-xs sm:tracking-[0.26em]"
          >
            Full credit list on request
          </a>
        </p>

        <p
          className="mx-auto mt-8 max-w-2xl text-center text-[10px] leading-[1.65] text-black/34 sm:mt-9 sm:text-[11px] sm:leading-relaxed"
          role="note"
        >
          Artists and labels shown represent past credits and collaborations. No official
          endorsement implied.
        </p>
      </div>
    </section>
  );
}
