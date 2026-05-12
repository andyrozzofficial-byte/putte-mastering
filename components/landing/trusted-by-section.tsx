const names = ["BTS", "NCT", "TXT", "ITZY", "Warner Chappell"] as const;

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="border-t border-neutral-200/85 bg-neutral-100/35 py-20 sm:py-24 md:py-28"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-[1.125rem] border border-neutral-200/90 bg-white p-8 shadow-[0_2px_14px_-6px_rgba(0,0,0,0.08)] md:p-12 lg:p-14 lg:rounded-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Trusted by
          </p>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-black/25 to-transparent" aria-hidden />
          <h2 id="trusted-heading" className="sr-only">
            Artists and partners
          </h2>
          <div className="mt-10 flex flex-wrap items-baseline gap-x-7 gap-y-5 sm:gap-x-9 md:gap-x-11 lg:gap-x-12">
            {names.map((name) => (
              <span
                key={name}
                className={
                  name === "Warner Chappell"
                    ? "text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-neutral-800 sm:text-xs md:text-[0.8rem]"
                    : "text-[1.35rem] font-semibold tracking-[-0.03em] text-black sm:text-2xl md:text-[1.85rem] lg:text-[2.125rem]"
                }
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-10 max-w-2xl text-[13px] leading-[1.65] text-gray-600 sm:mt-12 sm:text-sm">
            Credits include placements on Billboard charts, K-pop releases and
            global streaming hits.
          </p>
          <div className="mt-10 sm:mt-11">
            <button
              type="button"
              className="rounded-lg border border-black/90 bg-white px-6 py-2.5 text-[13px] font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-neutral-50 sm:text-sm"
            >
              View full credits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
