const names = ["BTS", "NCT", "TXT", "ITZY", "Warner Chappell"] as const;

export function TrustedBySection() {
  return (
    <section
      id="trusted"
      className="border-t border-gray-100/90 bg-neutral-50/50 py-16 md:py-24"
      aria-labelledby="trusted-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:p-10 lg:p-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
            Trusted by
          </p>
          <h2 id="trusted-heading" className="sr-only">
            Artists and partners
          </h2>
          <div className="mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 sm:gap-x-8 md:gap-x-10">
            {names.map((name) => (
              <span
                key={name}
                className={`font-semibold tracking-tight text-black ${
                  name === "Warner Chappell"
                    ? "text-[0.95rem] sm:text-base md:text-lg"
                    : "text-lg sm:text-xl md:text-2xl"
                }`}
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-[13px] leading-relaxed text-gray-600 sm:text-sm">
            Credits include placements on Billboard charts, K-pop releases and
            global streaming hits.
          </p>
          <div className="mt-8">
            <button
              type="button"
              className="rounded-lg border border-gray-900/90 bg-white px-5 py-2.5 text-[13px] font-medium text-black transition-colors hover:bg-neutral-50 sm:text-sm"
            >
              View full credits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
