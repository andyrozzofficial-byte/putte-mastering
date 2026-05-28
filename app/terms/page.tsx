import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms — First Listen Mastering",
  description: "Terms for uploading and mastering services.",
};

export default function TermsPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14 md:py-16 lg:px-10">
        <div className="mx-auto max-w-2xl space-y-8">
          <header className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              Legal
            </p>
            <h1 className="text-[2rem] font-bold leading-[1.06] tracking-[-0.04em] text-black sm:text-[2.25rem]">
              Terms
            </h1>
            <p className="text-[13px] leading-[1.7] text-gray-600 sm:text-sm">
              By uploading audio files or ordering mastering services, you agree to
              these terms.
            </p>
          </header>

          <div className="space-y-6 text-[13px] leading-[1.7] text-gray-600 sm:text-sm sm:leading-relaxed">
            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Ownership and rights
              </h2>
              <p>
                You confirm that you own the audio you upload or have the
                necessary rights and permissions to upload, process, and request
                mastering for it.
              </p>
              <p>
                You are responsible for any claims arising from content you
                submit.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Your files remain yours
              </h2>
              <p>
                Your uploaded files and your music remain your property. We do
                not claim ownership over your content.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Scope of service
              </h2>
              <p>
                The service provided is mastering only. Mixing, editing, vocal
                tuning, arrangement, production, and composition changes are not
                included unless explicitly agreed in writing.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Delivery times
              </h2>
              <p>
                Any delivery times are estimates. Actual delivery may vary
                depending on workload, complexity, and communication.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Limitation of liability
              </h2>
              <p>
                To the maximum extent permitted by law, First Listen Mastering is
                not liable for indirect, incidental, special, consequential, or
                punitive damages, or any loss of profits, revenue, or data.
              </p>
              <p>
                Our total liability for any claim related to the service will not
                exceed the amount paid for the specific order giving rise to the
                claim.
              </p>
            </section>

            <section className="space-y-2.5">
              <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-black sm:text-base">
                Right to refuse content
              </h2>
              <p>
                We reserve the right to refuse service for content we consider
                unlawful, harmful, abusive, or otherwise inappropriate.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

