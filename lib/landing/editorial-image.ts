/** Tiled SVG noise for subtle editorial / hero photography. */
export const EDITORIAL_GRAIN_DATA_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.55"/></svg>`,
  );

/** Hero portrait only — monochrome editorial grade. */
export const HERO_MONO_PHOTO_CLASS =
  "grayscale saturate-0 contrast-[1.08] brightness-[0.9]";

/** @deprecated Use HERO_MONO_PHOTO_CLASS */
export const EDITORIAL_PHOTO_CLASS = HERO_MONO_PHOTO_CLASS;

/** Studio / gear photography — color with darker cinematic grade. */
export const STUDIO_COLOR_PHOTO_CLASS =
  "contrast-[1.14] brightness-[0.86] saturate-[1.08]";
