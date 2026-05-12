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
        <div className="grid min-h-[min(96vh,1040px)] grid-cols-1 items-stretch gap-0 lg:min-h-[min(98vh,1120px)] lg:grid-cols-2">
          {/* Left column — copy + upload as one vertical story */}
          <div className="flex flex-col justify-center gap-8 py-14 sm:gap-9 sm:py-16 md:py-18 lg:gap-10 lg:py-16 lg:pr-8 xl:pr-12">
            <div className="space-y-6 sm:space-y-7">
              <div className="space-y-3">
                <div className="h-px w-10 bg-neutral-300" aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Professional mastering
                </p>
              </div>
              <div className="space-y-5 sm:space-y-6">
                <h1
                  id="hero-heading"
                  className="max-w-[12ch] text-[2.9rem] font-bold leading-[0.98] tracking-[-0.05em] text-black min-[420px]:text-[3.25rem] sm:text-7xl sm:leading-[0.94] lg:text-[4.35rem] lg:leading-[0.92] xl:text-[4.85rem]"
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

            <div className="w-full max-w-lg pt-2 lg:max-w-xl">
              <UploadDropzone variant="embedded" />
            </div>
          </div>

          {/* Right column — full-height cinematic frame */}
          <div className="relative min-h-[min(48vh,400px)] w-full lg:min-h-0 lg:h-full">
            <div className="relative h-full min-h-[min(48vh,400px)] overflow-hidden rounded-2xl border border-neutral-200/60 bg-neutral-200/30 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.04] lg:ml-2 lg:min-h-full lg:rounded-[1.25rem] lg:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.15)]">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                className="object-cover object-[center_28%] grayscale contrast-[1.05] brightness-[0.97] saturate-0"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Soft blend into white column (reference fade) */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white from-[-35%] via-white/70 via-[18%] via-white/30 via-[38%] to-transparent to-[58%] lg:from-[-45%] lg:via-white/65 lg:via-[16%] lg:via-white/25 lg:via-[34%] lg:to-[56%]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.22] via-transparent to-transparent"
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
