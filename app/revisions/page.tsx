import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Revisions — First Listen Mastering",
  description: "Revision policy for mastering orders.",
};

export default function RevisionsPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <header className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              Legal
            </p>
            <h1 className="text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-black sm:text-[2.25rem]">
              Revisions
            </h1>
            <p className="text-[13px] leading-[1.7] text-gray-600 sm:text-sm">
              A clear, compact revision policy to keep the process fast and
              predictable.
            </p>
          </header>

          <div className="space-y-6 text-[13px] leading-[1.7] text-gray-600 sm:text-sm sm:leading-relaxed">
            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Included revisions
              </h2>
              <p>
                Each order includes up to <span className="text-black">2</span>{" "}
                revision rounds unless your order page or agreement states
                otherwise.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Scope
              </h2>
              <p>
                Revisions cover mastering adjustments (level, tone, dynamics,
                stereo image, and translation). Changes that require a new mix,
                edits to the song, or new stems are outside scope.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Delivery expectations
              </h2>
              <p>
                Revision turnaround is typically fast, but timing depends on
                workload and the clarity of feedback. Delivery times are
                estimates, not guarantees.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Refund handling
              </h2>
              <p>
                If a refund is offered, it is handled on a case-by-case basis.
                Work already performed and delivered may limit eligibility.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

