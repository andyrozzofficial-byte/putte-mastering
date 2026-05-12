const names = ["BTS", "NCT", "TXT", "ITZY", "Warner Chappell"] as const;

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="bg-neutral-100/40 py-8 sm:py-9 md:py-10"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl bg-white px-10 py-14 shadow-[0_22px_90px_-44px_rgba(0,0,0,0.32)] ring-1 ring-black/[0.06] sm:px-12 sm:py-14 md:px-14 md:py-16 lg:px-16 lg:py-18">
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
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-7 sm:mt-11 md:gap-x-16 lg:gap-x-18">
            {names.map((name) => (
              <span
                key={name}
                className={
                  name === "Warner Chappell"
                    ? "text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-neutral-800 sm:text-xs md:text-[0.82rem]"
                    : "text-[2.05rem] font-bold tracking-[-0.06em] text-black sm:text-[2.6rem] md:text-[3rem] lg:text-[3.35rem]"
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
              className="rounded-lg border border-black/85 bg-white px-7 py-2.5 text-[13px] font-medium text-black shadow-[0_2px_10px_-8px_rgba(0,0,0,0.12)] transition-colors hover:bg-neutral-50 sm:text-sm"
            >
              View full credits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
