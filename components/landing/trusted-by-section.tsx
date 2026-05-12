const names = ["BTS", "NCT", "TXT", "ITZY", "Warner Chappell"] as const;

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="border-t border-neutral-200/90 bg-neutral-100/40 py-12 sm:py-14 md:py-16"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-neutral-200/75 bg-white px-7 py-10 shadow-[0_4px_28px_-10px_rgba(0,0,0,0.1)] sm:px-10 sm:py-12 md:px-12 md:py-14 lg:px-14 lg:py-16">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gray-500">
            Trusted by
          </p>
          <div
            className="mx-auto mt-4 h-px w-14 bg-gradient-to-r from-transparent via-black/15 to-transparent"
            aria-hidden
          />
          <h2 id="trusted-heading" className="sr-only">
            Artists and partners
          </h2>
          <div className="mt-10 flex flex-wrap items-baseline justify-center gap-x-8 gap-y-5 sm:mt-11 sm:gap-x-10 md:gap-x-12 lg:gap-x-14">
            {names.map((name) => (
              <span
                key={name}
                className={
                  name === "Warner Chappell"
                    ? "text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-neutral-800 sm:text-xs md:text-[0.82rem]"
                    : "text-[1.5rem] font-semibold tracking-[-0.035em] text-black sm:text-2xl md:text-[2rem] lg:text-[2.35rem]"
                }
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-xl text-center text-[13px] leading-[1.65] text-gray-600 sm:mt-11 sm:text-sm md:max-w-2xl">
            Credits include placements on Billboard charts, K-pop releases and
            global streaming hits.
          </p>
          <div className="mt-10 flex justify-center sm:mt-11">
            <button
              type="button"
              className="rounded-lg border border-black/85 bg-white px-7 py-2.5 text-[13px] font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-neutral-50 sm:text-sm"
            >
              View full credits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
