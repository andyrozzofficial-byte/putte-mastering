const primaryCredits: readonly {
  id: string;
  lines: readonly string[];
  className: string;
}[] = [
  {
    id: "bts",
    lines: ["BTS"],
    className:
      "text-[clamp(1.85rem,5.2vw,2.95rem)] font-semibold tracking-[-0.13em] text-black/[0.82]",
  },
  {
    id: "nct",
    lines: ["NCT"],
    className:
      "text-[clamp(1.6rem,4.6vw,2.5rem)] font-medium tracking-[0.16em] text-black/[0.66]",
  },
  {
    id: "txt",
    lines: ["TXT"],
    className:
      "text-[clamp(1.72rem,4.9vw,2.7rem)] font-light tracking-[0.44em] text-black/[0.72]",
  },
  {
    id: "itzy",
    lines: ["ITZY"],
    className:
      "text-[clamp(1.75rem,5vw,2.8rem)] font-bold tracking-[0.05em] text-black/[0.76]",
  },
] as const;

const warnerMark = {
  lines: ["WARNER", "CHAPPELL"] as const,
  className:
    "text-[0.74rem] font-medium uppercase leading-[1.42] tracking-[0.36em] text-black/[0.56] sm:text-[0.82rem] sm:tracking-[0.4em] md:text-[0.86rem]",
};

function CreditMark({
  lines,
  className,
}: {
  lines: readonly string[];
  className: string;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center text-center ${className}`}
    >
      {lines.map((line) => (
        <span key={line} className="block w-full whitespace-nowrap text-center">
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
      className="border-y border-black/[0.06] bg-[#fafafa] pt-14 pb-24 sm:pt-16 sm:pb-28 md:pt-[4.75rem] md:pb-32"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/36 sm:text-[11px] sm:tracking-[0.44em]">
            Credits
          </p>
          <h2
            id="trusted-heading"
            className="mt-4 text-[1.4rem] font-normal leading-[1.2] tracking-[-0.025em] text-black/[0.9] sm:text-2xl md:text-[1.8rem]"
          >
            Selected collaborations
          </h2>
          <p className="mx-auto mt-5 max-w-2xl px-1 text-[13px] leading-[1.7] text-black/42 sm:mt-6 sm:text-sm sm:leading-[1.75]">
            Credits spanning global streaming releases, major-label projects, and
            internationally recognized artists.
          </p>
        </header>

        <div
          className="mx-auto mt-14 grid max-w-4xl grid-cols-2 justify-items-center gap-x-6 gap-y-12 sm:mt-16 sm:gap-x-10 sm:gap-y-14 md:mt-[4.85rem] md:grid-cols-5 md:gap-x-5 md:gap-y-0 lg:gap-x-7"
          role="list"
          aria-label="Past credits and collaborations"
        >
          {primaryCredits.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className="flex w-full max-w-[11rem] items-center justify-center sm:max-w-none"
            >
              <CreditMark lines={item.lines} className={item.className} />
            </div>
          ))}
          <div
            role="listitem"
            className="col-span-2 flex w-full max-w-[14rem] items-center justify-center border-t border-black/[0.06] pt-11 sm:max-w-none md:col-span-1 md:max-w-[10.5rem] md:border-l md:border-t-0 md:pt-0 md:pl-9 lg:pl-11"
          >
            <CreditMark lines={warnerMark.lines} className={warnerMark.className} />
          </div>
        </div>

        <p className="mt-16 text-center sm:mt-[4.25rem]">
          <a
            href="#contact"
            className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/42 transition-colors hover:text-black/62 sm:text-xs sm:tracking-[0.26em]"
          >
            Full credit list on request
          </a>
        </p>

        <p
          className="mx-auto mt-11 max-w-xl px-4 py-4 text-center text-[10px] leading-[1.75] tracking-[0.01em] text-black/32 sm:mt-12 sm:max-w-2xl sm:px-8 sm:py-5 sm:text-[11px] sm:leading-[1.8]"
          role="note"
        >
          Artists and labels shown represent past credits and collaborations. No official
          endorsement implied.
        </p>
      </div>
    </section>
  );
}
