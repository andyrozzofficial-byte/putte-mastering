import Image from "next/image";
import Link from "next/link";
import { UploadDropzone } from "./upload-dropzone";

import {
  EDITORIAL_GRAIN_DATA_URI,
  EDITORIAL_PHOTO_CLASS,
} from "@/lib/landing/editorial-image";

/** Portrait — mastering engineer in the studio (main hero). */
const HERO_IMAGE = "/images/hero-mastering-studio.jpg";

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

          {/* Right column — cinematic frame, vertically balanced */}
          <div className="relative min-h-[min(48vh,400px)] w-full lg:flex lg:items-center lg:py-12">
            <div className="relative h-full min-h-[min(48vh,400px)] overflow-hidden rounded-2xl bg-neutral-900/20 shadow-[0_14px_58px_-26px_rgba(0,0,0,0.32)] ring-1 ring-black/[0.06] lg:ml-2 lg:h-[min(72vh,780px)] lg:min-h-0 lg:w-full lg:rounded-[1.25rem]">
              <div className="absolute inset-0">
                <Image
                  src={HERO_IMAGE}
                  alt="Mastering engineer in the studio at the console"
                  fill
                  priority
                  className={`object-cover object-[center_30%] scale-[1.14] sm:scale-[1.16] lg:object-[center_34%] lg:scale-[1.18] ${EDITORIAL_PHOTO_CLASS} contrast-[1.11] brightness-[0.92]`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              {/* Light editorial grain */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-soft-light"
                style={{
                  backgroundImage: `url("${EDITORIAL_GRAIN_DATA_URI}")`,
                  backgroundSize: "200px 200px",
                }}
                aria-hidden
              />
              {/* Narrower blend into copy column — keeps the frame sharp */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/95 from-[-28%] via-white/22 via-[8%] via-white/8 via-[18%] to-transparent to-[34%] lg:from-[-32%] lg:via-white/18 lg:via-[7%] lg:via-white/6 lg:via-[16%] lg:to-[36%]"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.22] via-black/[0.04] via-35% to-transparent"
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
