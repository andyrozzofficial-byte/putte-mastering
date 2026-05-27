/** Tiled SVG noise for subtle editorial / hero photography. */
export const EDITORIAL_GRAIN_DATA_URI =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="4" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.55"/></svg>`,
  );

/** Shared monochrome grade for studio photography. */
export const EDITORIAL_PHOTO_CLASS =
  "grayscale saturate-0 contrast-[1.08] brightness-[0.9]";
