import Image from "next/image";

import { EDITORIAL_GRAIN_DATA_URI, STUDIO_COLOR_PHOTO_CLASS } from "@/lib/landing/editorial-image";

const STUDIO_WIDE = "/images/studio-wide.jpg";
const STUDIO_RACK = "/images/studio-hardware-close.jpg";
const STUDIO_ANALOG_RED = "/images/studio-analog-red.jpg";

const GEAR_LINE = "ATC monitoring · Analog outboard · Custom mastering chain";

type ColorFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  grainOpacity?: number;
  variant?: "hero" | "detail";
};

function ColorFrame({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  imageClassName = "",
  grainOpacity = 0.05,
  variant = "detail",
}: ColorFrameProps) {
  return (
    <div
      className={`studio-editorial-photo group relative overflow-hidden bg-neutral-900 transition-shadow duration-500 ease-out ${
        variant === "hero"
          ? "studio-editorial-photo--hero"
          : "hover:shadow-[0_10px_36px_-14px_rgba(0,0,0,0.5)]"
      } ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${STUDIO_COLOR_PHOTO_CLASS} ${imageClassName}`}
        sizes={sizes}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-black/20 mix-blend-multiply"
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.32)_100%)] ${
          variant === "hero" ? "opacity-80" : "opacity-100"
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{
          opacity: grainOpacity,
          backgroundImage: `url("${EDITORIAL_GRAIN_DATA_URI}")`,
          backgroundSize: "200px 200px",
        }}
        aria-hidden
      />
    </div>
  );
}

function DetailCaption({ children, className = "" }: { children: string; className?: string }) {
  return (
    <figcaption
      className={`mt-2.5 text-[10px] font-medium uppercase tracking-[0.26em] text-white/45 ${className}`}
    >
      {children}
    </figcaption>
  );
}

export function StudioEditorialSection() {
  return (
    <section
      className="border-t border-black/[0.06] bg-[#f6f4f1] py-12 sm:py-14 md:py-16"
      aria-labelledby="studio-editorial-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-2 md:gap-x-12 lg:gap-x-14">
          <header className="pt-2 sm:pt-4 md:pt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
              The studio
            </p>
            <h2
              id="studio-editorial-heading"
              className="mt-6 text-[1.35rem] font-normal leading-[1.18] tracking-[-0.03em] text-black/[0.9] sm:mt-7 sm:text-[1.55rem]"
            >
              Inside the room
            </h2>
          </header>
          <p className="text-[13px] leading-[1.7] text-black/44 sm:text-sm md:flex md:items-end md:pb-1 md:pt-6 lg:pt-8">
            A treated listening environment and selective analog processing — decisions
            made by ear, with hardware chosen for tone.
          </p>
        </div>

        <div className="mt-8 sm:mt-9 md:mt-10">
          <div className="overflow-hidden rounded-xl bg-neutral-950 shadow-[0_20px_52px_-28px_rgba(0,0,0,0.45)] ring-1 ring-black/[0.08] transition-shadow duration-500 hover:shadow-[0_24px_60px_-26px_rgba(0,0,0,0.5)]">
            {/* Dominant hero — full width, no dead padding */}
            <figure className="relative">
              <ColorFrame
                variant="hero"
                src={STUDIO_WIDE}
                alt="Wide view of the mastering studio with monitors and outboard gear"
                sizes="(max-width: 1152px) 100vw, 72rem"
                priority
                className="aspect-[2.1/1] w-full sm:aspect-[2.2/1] md:aspect-[2.55/1] lg:aspect-[2.6/1]"
                imageClassName="object-[center_48%] md:object-[center_46%]"
                grainOpacity={0.04}
              />
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-neutral-950/75 to-transparent"
                aria-hidden
              />
              <figcaption className="absolute bottom-3 left-4 text-[10px] font-medium uppercase tracking-[0.28em] text-white/50 sm:bottom-3.5 sm:left-5">
                Listening environment
              </figcaption>
            </figure>

            {/* Gear pair — equal columns, flush grid, intentional scale */}
            <div className="grid grid-cols-1 gap-[3px] border-t border-white/[0.08] sm:grid-cols-2">
              <figure className="min-w-0 bg-neutral-950 p-[3px] sm:pr-[1.5px]">
                <ColorFrame
                  src={STUDIO_RACK}
                  alt="Close-up of analog mastering hardware in the equipment rack"
                  sizes="(max-width: 640px) 100vw, 28rem"
                  className="aspect-[4/3] w-full sm:aspect-[3/2] md:aspect-[5/3]"
                  imageClassName="object-[center_44%] md:object-[center_42%]"
                />
                <DetailCaption className="px-0.5">Outboard rack</DetailCaption>
              </figure>

              <figure className="min-w-0 bg-neutral-950 p-[3px] sm:pl-[1.5px]">
                <ColorFrame
                  src={STUDIO_ANALOG_RED}
                  alt="Vacuum tube analog equalizer and compressor in the mastering chain"
                  sizes="(max-width: 640px) 100vw, 28rem"
                  className="aspect-[4/3] w-full sm:aspect-[3/2] md:aspect-[5/3]"
                  imageClassName="object-[center_46%] md:object-[center_44%]"
                  grainOpacity={0.04}
                />
                <DetailCaption className="px-0.5 sm:text-right">Analog chain</DetailCaption>
              </figure>
            </div>
          </div>

          <p className="mt-7 text-center text-[10px] font-medium uppercase tracking-[0.34em] text-black/34 sm:mt-8 sm:text-[11px] sm:tracking-[0.36em]">
            {GEAR_LINE}
          </p>

          <div className="mt-9 border-t border-black/[0.06] pt-7 sm:mt-10 sm:pt-8">
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-8 md:grid-cols-2 md:gap-x-12 md:gap-y-10">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
                    Studio / Gear
                  </p>
                  <p className="mt-4 text-[13px] leading-[1.7] text-black/44 sm:text-sm">
                    Analog processing and monitoring chain used during mastering.
                  </p>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.32em] text-black/70">
                    Monitoring
                  </h3>
                  <ul className="space-y-3 text-[13px] leading-[1.65] text-black/56 sm:space-y-3.5 sm:text-sm">
                    <li className="border-b border-black/[0.06] pb-3">ATC SCM45A Pro</li>
                    <li className="border-b border-black/[0.06] pb-3">Dual ATC SCS70 Sub</li>
                  </ul>
                </div>

                <div className="space-y-5">
                  <h3 className="text-[11px] font-medium uppercase tracking-[0.32em] text-black/70">
                    Conversion &amp; processing
                  </h3>
                  <ul className="space-y-3 text-[13px] leading-[1.65] text-black/56 sm:space-y-3.5 sm:text-sm">
                    <li className="border-b border-black/[0.06] pb-3">Mytek Manhattan II</li>
                    <li className="border-b border-black/[0.06] pb-3">Neve Portico II MBP</li>
                    <li className="border-b border-black/[0.06] pb-3">DW Fearn VT-7</li>
                    <li className="border-b border-black/[0.06] pb-3">DW Fearn VT-5</li>
                    <li className="border-b border-black/[0.06] pb-3">LAAL Analog Limiter</li>
                    <li className="border-b border-black/[0.06] pb-3">Lavry Gold</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
