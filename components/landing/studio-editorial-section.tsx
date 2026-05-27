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
      className={`studio-editorial-photo group relative overflow-hidden bg-neutral-950 transition-shadow duration-500 ease-out hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)] ${
        variant === "hero" ? "studio-editorial-photo--hero" : ""
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
        className="pointer-events-none absolute inset-0 bg-black/25 mix-blend-multiply"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(0,0,0,0.38)_100%)]"
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
          <div className="overflow-hidden rounded-xl bg-neutral-950 shadow-[0_18px_48px_-26px_rgba(0,0,0,0.42)] ring-1 ring-black/[0.08] transition-shadow duration-500 hover:shadow-[0_22px_56px_-24px_rgba(0,0,0,0.48)]">
            <figure className="relative">
              <ColorFrame
                variant="hero"
                src={STUDIO_WIDE}
                alt="Wide view of the mastering studio with monitors and outboard gear"
                sizes="(max-width: 1152px) 100vw, 72rem"
                className="aspect-[2.55/1] max-h-[13.5rem] sm:max-h-[15rem] md:max-h-[16.5rem] w-full"
                imageClassName="object-[center_52%]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/85 from-0% via-neutral-950/20 via-38% to-transparent"
                aria-hidden
              />
              <figcaption className="absolute bottom-3 left-5 text-[10px] font-medium uppercase tracking-[0.28em] text-white/48 sm:bottom-3.5 sm:left-6">
                Listening environment
              </figcaption>
            </figure>

            <div className="border-t border-white/[0.07] px-4 py-5 sm:px-6 sm:py-6 md:px-7 md:py-6">
              <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-[1.12fr_0.88fr] md:items-center md:gap-8">
                <figure className="min-w-0">
                  <ColorFrame
                    src={STUDIO_RACK}
                    alt="Close-up of analog mastering hardware in the equipment rack"
                    sizes="(max-width: 768px) 100vw, 22rem"
                    className="aspect-[16/10] w-full"
                    imageClassName="object-[center_46%]"
                  />
                  <figcaption className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/40">
                    Outboard rack
                  </figcaption>
                </figure>

                <figure className="flex min-w-0 flex-col items-stretch sm:items-center md:items-end">
                  <div className="w-full max-w-[17rem] sm:max-w-[18rem] md:max-w-[12.75rem] lg:max-w-[13.5rem]">
                    <ColorFrame
                      src={STUDIO_ANALOG_RED}
                      alt="Vacuum tube analog equalizer and compressor in the mastering chain"
                      sizes="(max-width: 768px) 85vw, 13.5rem"
                      className="aspect-[16/10] w-full"
                      imageClassName="object-[center_50%]"
                    />
                  </div>
                  <figcaption className="mt-2.5 text-center text-[10px] font-medium uppercase tracking-[0.24em] text-white/40 md:text-right">
                    Analog chain
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>

          <p className="mt-7 text-center text-[10px] font-medium uppercase tracking-[0.34em] text-black/34 sm:mt-8 sm:text-[11px] sm:tracking-[0.36em]">
            {GEAR_LINE}
          </p>
        </div>
      </div>
    </section>
  );
}
