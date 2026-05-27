import { EditorialWaveformPlayer } from "@/components/landing/editorial-waveform-player";

export function BeforeAfterSection() {
  return (
    <section
      id="before-after"
      className="border-t border-neutral-200/90 bg-white py-9 sm:py-10 md:py-12"
      aria-labelledby="before-after-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-neutral-200/70 bg-neutral-100/45 p-9 shadow-[0_10px_44px_-20px_rgba(0,0,0,0.18)] sm:p-11 md:p-12 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[360px_1fr] lg:items-start lg:gap-14">
            <div className="space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                Hear the difference
              </p>
              <h2
                id="before-after-heading"
                className="text-[1.75rem] font-bold leading-[1.04] tracking-[-0.045em] text-black sm:text-[2.05rem] md:text-[2.35rem]"
              >
                Before &amp; after mastering
              </h2>
              <p className="text-[13px] leading-[1.65] text-gray-600 sm:text-sm">
                Industry-ready translation — clarity, punch and balance designed
                to make your music catch attention from the first second.
              </p>
            </div>

            <EditorialWaveformPlayer />
          </div>
        </div>
      </div>
    </section>
  );
}
