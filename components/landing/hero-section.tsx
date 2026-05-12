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
  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1400&h=1800&q=85";

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
      className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-6 md:pb-20 md:pt-10 lg:px-10 lg:pb-28 lg:pt-12"
      aria-labelledby="hero-heading"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-x-16 lg:gap-y-12">
        <div className="max-w-xl space-y-8 lg:max-w-none">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-gray-300" aria-hidden />
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Professional mastering
              </p>
            </div>
            <div className="space-y-5 sm:space-y-6">
              <h1
                id="hero-heading"
                className="text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-black min-[400px]:text-[2.35rem] sm:text-5xl lg:text-[3.15rem] lg:leading-[1.05]"
              >
                Mastered to be heard.
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-gray-600 sm:text-base">
                Professional mastering with full focus on clarity, punch and
                balance — every time.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Link
              href="#upload"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-[13px] font-medium text-white transition-colors hover:bg-neutral-800 sm:text-sm"
            >
              <UploadGlyph className="shrink-0" />
              Upload your track
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700 transition-colors hover:text-black sm:text-sm"
            >
              How it works
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6 pt-2 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-5">
            {heroPills.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex gap-3">
                <Icon className="mt-0.5 shrink-0 text-gray-800" />
                <div className="min-w-0 space-y-0.5">
                  <p className="text-[12px] font-semibold leading-snug text-black sm:text-[13px]">
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

        <div className="relative min-h-[280px] overflow-hidden rounded-2xl border border-gray-200/90 bg-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.05)] sm:min-h-[360px] lg:min-h-[min(72vh,640px)]">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover object-center grayscale contrast-[1.02]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/25 to-transparent lg:from-white/90"
            aria-hidden
          />
        </div>

        <div className="lg:col-span-2 lg:max-w-2xl">
          <UploadDropzone />
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
