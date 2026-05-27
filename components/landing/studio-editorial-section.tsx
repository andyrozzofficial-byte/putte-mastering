import Image from "next/image";

import {
  EDITORIAL_GRAIN_DATA_URI,
  EDITORIAL_PHOTO_CLASS,
} from "@/lib/landing/editorial-image";

const STUDIO_WIDE = "/images/studio-wide.jpg";
const STUDIO_HARDWARE = "/images/studio-hardware-close.jpg";

type EditorialFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

function EditorialFrame({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
  imageClassName = "",
}: EditorialFrameProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-neutral-900/10 ring-1 ring-black/[0.07] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover ${EDITORIAL_PHOTO_CLASS} ${imageClassName}`}
        sizes={sizes}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-soft-light"
        style={{
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
      className="border-t border-black/[0.06] bg-white py-16 sm:py-20 md:py-24"
      aria-labelledby="studio-editorial-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
        <header className="max-w-lg">
          <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-black/38 sm:text-[11px] sm:tracking-[0.44em]">
            The studio
          </p>
          <h2
            id="studio-editorial-heading"
            className="sr-only"
          >
            Mastering studio and analog chain
          </h2>
          <p className="mt-4 text-[13px] leading-[1.75] text-black/44 sm:text-sm sm:leading-[1.8]">
            A treated listening room, selective analog processing, and decisions made by
            ear — not presets.
          </p>
        </header>

        <div className="mt-12 space-y-8 sm:mt-14 sm:space-y-10 lg:mt-16">
          <figure className="mx-auto w-full max-w-3xl lg:max-w-none lg:w-[88%]">
            <EditorialFrame
              src={STUDIO_WIDE}
              alt="Wide view of the mastering studio with monitors and outboard gear"
              sizes="(max-width: 1024px) 92vw, 52rem"
              className="aspect-[16/10] sm:aspect-[5/3]"
              imageClassName="object-[center_42%]"
            />
            <figcaption className="mt-3 text-[10px] font-medium uppercase tracking-[0.28em] text-black/32 sm:text-[11px]">
              Listening environment
            </figcaption>
          </figure>

          <figure className="ml-auto w-full max-w-[15.5rem] sm:max-w-[17.5rem] lg:mr-[6%] lg:max-w-[19rem]">
            <EditorialFrame
              src={STUDIO_HARDWARE}
              alt="Close-up of analog mastering hardware in the rack"
              sizes="(max-width: 640px) 55vw, 19rem"
              className="aspect-[4/5]"
              imageClassName="object-[center_45%] scale-[1.06]"
            />
            <figcaption className="mt-3 text-right text-[10px] font-medium uppercase tracking-[0.28em] text-black/32 sm:text-[11px]">
              Analog outboard
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
