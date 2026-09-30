/**
 * Font roles -> family names of the bundled TTFs in collection/fonts
 * (see collection/fonts/LICENSES.md). Art code must only use these families;
 * resvg never loads system fonts.
 */
export const FONTS = {
  /** Huge red-pen letter grades, SEE ME. */
  marker: "Permanent Marker",
  /** Harrow's handwriting (Teacher Comment). */
  harrow: "Caveat",
  /** Scratchy angry pen. */
  scratch: "Rock Salt",
  /** Student handwriting on doodles. */
  kid: "Gochi Hand",
  /** Kid print (forgeries, crayon). */
  kidPrint: "Schoolbell",
  /** Adult cursive (parent signatures). */
  cursive: "Homemade Apple",
  /** Typewriter (carbon copy, slips). */
  typewriter: "Special Elite",
  /** Office printer mono (Courier Prime has a bold). */
  mono: "Courier Prime",
  /** 9-pin dot matrix. */
  dotMatrix: "Doto",
  /** CRT / LCD. */
  crt: "VT323",
  /** Condensed display. */
  condensed: "Anton",
  /** Stencil. */
  stencil: "Black Ops One",
  /** Fat slab headers. */
  slab: "Alfa Slab One",
  /** Distressed rubber stamp. */
  stamp: "Rubik Dirt",
  /** Engraved certificate serif. */
  serif: "Old Standard TT",
  /** Graffiti. */
  graffiti: "Sedgwick Ave Display",
} as const;

export type FontRole = keyof typeof FONTS;
