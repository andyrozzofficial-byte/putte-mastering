import Link from "next/link";
import { UploadDropzone } from "./upload-dropzone";

export function HeroSection() {
  return (
    <section
      id="top"
      className="mx-auto max-w-7xl px-5 pb-12 pt-10 sm:px-6 md:pb-16 md:pt-12 lg:px-10 lg:pb-24 lg:pt-14"
      aria-labelledby="hero-heading"
    >
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-14">
        <div className="max-w-xl space-y-6 sm:space-y-7">
          <p className="inline-flex rounded-full border border-gray-200 bg-[var(--accent-warm)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-700">
            Manuell mastering
          </p>
          <div className="space-y-4 sm:space-y-5">
            <h1
              id="hero-heading"
              className="text-[1.75rem] font-bold leading-[1.12] tracking-[-0.02em] text-black min-[380px]:text-[2rem] sm:text-4xl lg:text-[2.65rem] xl:text-[3.1rem]"
            >
              Professionell mastering.
              <br />
              Mänsklig känsla.
            </h1>
            <p className="text-[15px] leading-relaxed text-gray-600 sm:text-base">
              Jag mastrar ditt spår för hand med fokus på klarhet, punch och
              balans – varje gång.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="#upload"
              className="inline-flex items-center justify-center rounded-md bg-black px-5 py-3 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 sm:text-sm"
            >
              Skicka in ditt spår
            </Link>
            <Link
              href="#hur"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 transition-colors hover:text-black sm:text-sm"
            >
              Så fungerar det
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="lg:pt-1">
          <UploadDropzone />
        </div>
      </div>
    </section>
  );
}
