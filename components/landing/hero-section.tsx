import Link from "next/link";
import { UploadDropzone } from "./upload-dropzone";

export function HeroSection() {
  return (
    <section
      id="top"
      className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:pb-24 md:pt-16 lg:px-12 lg:pb-32 lg:pt-20"
      aria-labelledby="hero-heading"
    >
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
        <div className="max-w-xl space-y-8">
          <p className="inline-flex rounded-full border border-gray-200 bg-[var(--accent-warm)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-700">
            Manuell mastering
          </p>
          <div className="space-y-6">
            <h1
              id="hero-heading"
              className="text-4xl font-bold leading-[1.08] tracking-tight text-black sm:text-5xl lg:text-[3.25rem] xl:text-6xl"
            >
              Professionell mastering.
              <br />
              Mänsklig känsla.
            </h1>
            <p className="text-lg leading-relaxed text-gray-600">
              Jag mastrar ditt spår för hand med fokus på klarhet, punch och
              balans – varje gång.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="#upload"
              className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Skicka in ditt spår
            </Link>
            <Link
              href="#hur"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition-colors hover:text-black"
            >
              Så fungerar det
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="lg:pt-2">
          <UploadDropzone />
        </div>
      </div>
    </section>
  );
}
