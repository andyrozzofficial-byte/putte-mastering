const names = ["BTS", "NCT", "TXT", "ITZY", "Warner Chappell"] as const;

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="border-t border-neutral-200/90 bg-neutral-100/40 py-10 sm:py-12 md:py-14"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-neutral-200/75 bg-white px-8 py-12 shadow-[0_8px_38px_-16px_rgba(0,0,0,0.16)] sm:px-12 sm:py-14 md:px-14 md:py-16 lg:px-16 lg:py-18">
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
          <div className="mt-10 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-6 sm:mt-11 md:gap-x-14 lg:gap-x-16">
            {names.map((name) => (
              <span
                key={name}
                className={
                  name === "Warner Chappell"
                    ? "text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-neutral-800 sm:text-xs md:text-[0.82rem]"
                    : "text-[1.8rem] font-semibold tracking-[-0.05em] text-black sm:text-3xl md:text-[2.6rem] lg:text-[3rem]"
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
