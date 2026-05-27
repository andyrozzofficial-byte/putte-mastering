import Image from "next/image";

import { EDITORIAL_GRAIN_DATA_URI, STUDIO_COLOR_PHOTO_CLASS } from "@/lib/landing/editorial-image";

const STUDIO_WIDE = "/images/studio-wide.jpg";
const STUDIO_RACK = "/images/studio-hardware-close.jpg";
const STUDIO_ANALOG_RED = "/images/studio-analog-red.jpg";

type ColorFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  grainOpacity?: number;
};

function ColorFrame({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  imageClassName = "",
  grainOpacity = 0.06,
}: ColorFrameProps) {
  return (
    <div className={`relative overflow-hidden bg-neutral-900 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${STUDIO_COLOR_PHOTO_CLASS} ${imageClassName}`}
        sizes={sizes}
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
        <div className="grid gap-5 md:grid-cols-2 md:gap-x-12 md:gap-y-0 lg:gap-x-16">
          <header>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
              The studio
            </p>
            <h2
              id="studio-editorial-heading"
              className="mt-3 text-[1.35rem] font-normal leading-[1.18] tracking-[-0.03em] text-black/[0.9] sm:text-[1.55rem]"
            >
              Inside the room
            </h2>
          </header>
          <p className="text-[13px] leading-[1.7] text-black/44 sm:text-sm md:flex md:items-end md:pb-0.5">
            A treated listening environment and selective analog processing — decisions
            made by ear, with hardware chosen for tone.
          </p>
        </div>

        <div className="mt-9 sm:mt-10 md:mt-11">
          <div className="overflow-hidden rounded-xl bg-neutral-950 shadow-[0_20px_56px_-28px_rgba(0,0,0,0.38)] ring-1 ring-black/[0.08]">
            <figure className="relative">
              <ColorFrame
                src={STUDIO_WIDE}
                alt="Wide view of the mastering studio with monitors and outboard gear"
                sizes="(max-width: 1152px) 100vw, 72rem"
                className="aspect-[2.35/1] sm:aspect-[2.5/1]"
                imageClassName="object-[center_50%]"
                grainOpacity={0.04}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/80 from-0% via-neutral-950/15 via-40% to-transparent"
                aria-hidden
              />
              <figcaption className="absolute bottom-3.5 left-5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/50 sm:bottom-4 sm:left-6">
                Listening environment
              </figcaption>
            </figure>

            <div className="border-t border-white/[0.06] px-5 py-6 sm:px-7 sm:py-7 md:px-8 md:py-8">
              <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10 lg:gap-12">
                <figure className="min-w-0">
                  <ColorFrame
                    src={STUDIO_RACK}
                    alt="Close-up of analog mastering hardware in the equipment rack"
                    sizes="(max-width: 768px) 92vw, 26rem"
                    className="aspect-[3/2]"
                    imageClassName="object-[center_44%]"
                  />
                  <figcaption className="mt-3 text-[10px] font-medium uppercase tracking-[0.26em] text-white/42">
                    Outboard rack
                  </figcaption>
                </figure>

                <figure className="flex min-w-0 flex-col items-center md:items-end">
                  <div className="w-full max-w-[15.5rem] sm:max-w-[16.5rem] md:max-w-[14.25rem] lg:max-w-[15rem]">
                    <ColorFrame
                      src={STUDIO_ANALOG_RED}
                      alt="D.W. Fearn vacuum tube analog equalizer and compressor in the mastering chain"
                      sizes="(max-width: 768px) 72vw, 15rem"
                      className="aspect-[3/2]"
                      imageClassName="object-[center_48%]"
                      grainOpacity={0.04}
                    />
                  </div>
                  <figcaption className="mt-3 w-full max-w-[15.5rem] text-center text-[10px] font-medium uppercase tracking-[0.26em] text-white/42 sm:max-w-[16.5rem] md:max-w-[14.25rem] md:text-right lg:max-w-[15rem]">
                    Analog chain
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
