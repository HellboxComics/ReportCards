import localFont from "next/font/local";

/**
 * Self-hosted fonts (assets/fonts, also read by the OG image renderer).
 * Each exposes a CSS variable used by globals.css.
 */

/** The launchpad: heavy condensed hype type. */
export const anton = localFont({
  src: "../../assets/fonts/Anton-Regular.ttf",
  variable: "--f-display",
  display: "swap",
});

/** Terminal readouts. */
export const spaceMono = localFont({
  src: [
    { path: "../../assets/fonts/SpaceMono-Regular.ttf", weight: "400" },
    { path: "../../assets/fonts/SpaceMono-Bold.ttf", weight: "700" },
  ],
  variable: "--f-term",
  display: "swap",
});

/** The school office typewriter. */
export const courierPrime = localFont({
  src: [
    { path: "../../assets/fonts/CourierPrime-Regular.ttf", weight: "400" },
    { path: "../../assets/fonts/CourierPrime-Bold.ttf", weight: "700" },
  ],
  variable: "--f-type",
  display: "swap",
});

/** Red teacher pen, big letters. */
export const marker = localFont({
  src: "../../assets/fonts/PermanentMarker-Regular.ttf",
  variable: "--f-marker",
  display: "swap",
});

/** Red teacher pen, sentences. */
export const pen = localFont({
  src: "../../assets/fonts/NanumPenScript-Latin.ttf",
  variable: "--f-pen",
  display: "swap",
});

export const specialElite = localFont({
  src: "../../assets/fonts/SpecialElite-Regular.ttf",
  variable: "--f-elite",
  display: "swap",
});

export const vt323 = localFont({
  src: "../../assets/fonts/VT323-Regular.ttf",
  variable: "--f-dot",
  display: "swap",
});

export const fontVars = [anton, spaceMono, courierPrime, marker, pen, specialElite, vt323]
  .map((f) => f.variable)
  .join(" ");
