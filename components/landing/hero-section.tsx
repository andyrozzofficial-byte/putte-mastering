import Image from "next/image";
import Link from "next/link";
import { UploadDropzone } from "./upload-dropzone";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=2000&h=2500&q=90";

export function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid min-h-[min(88vh,900px)] grid-cols-1 items-stretch gap-0 lg:min-h-[min(84vh,920px)] lg:grid-cols-2">
          {/* Left column — copy + upload as one vertical story */}
          <div className="flex flex-col justify-center gap-7 py-11 sm:gap-8 sm:py-12 md:py-14 lg:gap-9 lg:py-12 lg:pr-8 xl:pr-12">
            <div className="space-y-6 sm:space-y-7">
              <div className="space-y-3">
                <div className="h-px w-10 bg-neutral-300/80" aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Professional mastering
                </p>
              </div>
              <div className="space-y-5 sm:space-y-6">
                <h1
                  id="hero-heading"
                  className="max-w-[12ch] text-[3.05rem] font-bold leading-[0.965] tracking-[-0.052em] text-black min-[420px]:text-[3.35rem] sm:text-7xl sm:leading-[0.93] lg:text-[4.55rem] lg:leading-[0.905] xl:text-[5.05rem]"
                >
                  Mastered to be heard.
                </h1>
                <p className="max-w-md text-[15px] font-normal leading-[1.65] text-gray-600 sm:text-[16px] sm:leading-relaxed">
                  Professional mastering with full focus on clarity, punch and
                  balance — every time.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="#upload"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-black px-7 py-3.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-900 sm:text-sm"
              >
                <UploadGlyph className="shrink-0" />
                Upload your track
              </Link>
              <Link
                href="#how"
                className="inline-flex w-fit items-center gap-2 px-0.5 text-[13px] font-medium text-gray-600 transition-colors hover:text-black sm:text-sm"
              >
                How it works
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="w-full max-w-xl pt-1">
              <UploadDropzone variant="embedded" />
            </div>
          </div>

          {/* Right column — full-height cinematic frame */}
          <div className="relative min-h-[min(48vh,400px)] w-full lg:min-h-0 lg:h-full">
            <div className="relative h-full min-h-[min(48vh,400px)] overflow-hidden rounded-2xl bg-neutral-200/30 shadow-[0_12px_54px_-24px_rgba(0,0,0,0.24)] ring-1 ring-black/[0.05] lg:ml-2 lg:min-h-full lg:rounded-[1.25rem]">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                className="object-cover object-[center_44%] grayscale contrast-[1.03] brightness-[1.04] saturate-0 lg:object-[center_56%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Soft blend into white column (reference fade) */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white from-[-45%] via-white/52 via-[16%] via-white/18 via-[36%] to-transparent to-[56%] lg:from-[-55%] lg:via-white/48 lg:via-[14%] lg:via-white/16 lg:via-[32%] lg:to-[54%]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.18] via-transparent to-transparent"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
