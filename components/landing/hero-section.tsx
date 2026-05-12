import Image from "next/image";
import Link from "next/link";
import {
  IconClock,
  IconLock,
  IconShieldCheck,
  IconWaveformFeature,
} from "./feature-icons";
import { UploadDropzone } from "./upload-dropzone";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1800&h=2200&q=88";

const heroPills = [
  {
    icon: IconWaveformFeature,
    title: "100% manual",
    subtitle: "No AI. Ever.",
  },
  {
    icon: IconShieldCheck,
    title: "Highest quality",
    subtitle: "Industry standard",
  },
  {
    icon: IconClock,
    title: "Fast delivery",
    subtitle: "2–3 business days",
  },
  {
    icon: IconLock,
    title: "Secure & private",
    subtitle: "Your files are safe",
  },
] as const;

export function HeroSection() {
  return (
    <section
      id="top"
      className="bg-white pb-20 pt-10 sm:pb-24 sm:pt-12 md:pb-28 md:pt-14 lg:pb-36 lg:pt-16"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid gap-y-14 gap-x-10 lg:grid-cols-2 lg:items-center lg:gap-x-16 lg:gap-y-16 xl:gap-x-20">
          <div className="max-w-xl space-y-10 lg:max-w-lg xl:max-w-xl">
            <div className="space-y-6">
              <div className="flex items-center gap-3.5">
                <span className="h-px w-10 bg-neutral-300" aria-hidden />
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Professional mastering
                </p>
              </div>
              <div className="space-y-6 sm:space-y-7">
                <h1
                  id="hero-heading"
                  className="text-[2.125rem] font-semibold leading-[1.06] tracking-[-0.035em] text-black min-[400px]:text-[2.5rem] sm:text-5xl sm:leading-[1.05] lg:text-[3.35rem] lg:leading-[1.02] xl:text-[3.75rem]"
                >
                  Mastered to be heard.
                </h1>
                <p className="max-w-md text-[15px] leading-[1.65] text-gray-600 sm:text-[16px] sm:leading-relaxed">
                  Professional mastering with full focus on clarity, punch and
                  balance — every time.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4">
              <Link
                href="#upload"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-7 py-3.5 text-[13px] font-medium text-white transition-colors hover:bg-neutral-900 sm:text-sm"
              >
                <UploadGlyph className="shrink-0" />
                Upload your track
              </Link>
              <Link
                href="#how"
                className="inline-flex items-center gap-2 px-0.5 text-[13px] font-medium text-gray-600 transition-colors hover:text-black sm:text-sm"
              >
                How it works
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-5 gap-y-7 border-t border-neutral-200/60 pt-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-4 lg:gap-x-6 lg:pt-10">
              {heroPills.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex gap-3.5">
                  <Icon className="mt-0.5 shrink-0 text-gray-800" />
                  <div className="min-w-0 space-y-1">
                    <p className="text-[12px] font-semibold leading-snug tracking-tight text-black sm:text-[13px]">
                      {title}
                    </p>
                    <p className="text-[11px] leading-snug text-gray-500 sm:text-xs">
                      {subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[300px] overflow-hidden rounded-[1.125rem] border border-neutral-200/90 bg-neutral-200/40 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] sm:min-h-[400px] lg:min-h-[min(78vh,720px)] lg:rounded-[1.25rem]">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              className="scale-[1.02] object-cover object-[center_30%] grayscale contrast-[1.04] brightness-[0.98]"
              sizes="(max-width: 1024px) 100vw, 52vw"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent lg:from-white/[0.93] lg:via-white/15"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.18] via-transparent to-black/[0.04]"
              aria-hidden
            />
          </div>

          <div className="w-full lg:col-span-2 lg:max-w-2xl lg:justify-self-start">
            <div className="pt-2 lg:pt-4">
              <UploadDropzone />
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
