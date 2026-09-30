/**
 * The canvas layout: exact pixel zones every art group draws into.
 * All coordinates are canvas px on the 2000x2000 image, in CARD space: the
 * compositor rotates everything from Paper up by the token's card rotation
 * (a few degrees) around CARD_PIVOT. Background is never rotated.
 *
 * Reading order at thumbnail size: status stamp over the header (top third),
 * six huge red grades (middle), Harrow's comment + attachments (bottom).
 *
 * SPEC.md mirrors these numbers; if you change one, change both.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const CANVAS = 2000;

/** The report card itself (the cardstock rectangle). */
export const CARD: Rect = { x: 170, y: 120, w: 1660, h: 1780 };

/** Rotation pivot for the card group. */
export const CARD_PIVOT = { x: 1000, y: 1010 };

/** Per-token card rotation range in degrees (seeded, uniform, 0.1 deg steps). */
export const CARD_ROTATION = { min: -2.4, max: 2.4 };

/** Left margin strip with the three-hole punch. */
export const MARGIN: Rect = { x: 170, y: 120, w: 125, h: 1780 };
export const HOLES = [
  { cx: 232, cy: 380, r: 30 },
  { cx: 232, cy: 1010, r: 30 },
  { cx: 232, cy: 1640, r: 30 },
] as const;

/** Printable area right of the margin. */
export const CONTENT: Rect = { x: 310, y: 145, w: 1480, h: 1745 };

export const ZONES = {
  /** STUDENT ID #0417 | FALL 1994 | GPA 2.56 (dynamic text; paper group styles it). */
  idRow: { x: 310, y: 145, w: 1480, h: 85 },
  /** School name + motto (School layer) and the printed form title (Paper). */
  header: { x: 310, y: 240, w: 1480, h: 255 },
  /** The six subject boxes (see GRADE_BOXES). */
  grades: { x: 310, y: 515, w: 1250, h: 650 },
  /** Pen-mark corner: top of the right-hand column (SEE ME, smiley, gold star). */
  penCorner: { x: 1575, y: 505, w: 235, h: 230 },
  /** Doodle zone A: the rest of the right-hand column beside the grades. */
  doodleA: { x: 1580, y: 745, w: 220, h: 420 },
  /** ATTENDANCE label (Paper) + value from ATTENDANCE_VALUE_X (Attendance layer). */
  attendance: { x: 310, y: 1175, w: 1480, h: 85 },
  /** TEACHER COMMENT label (Paper) + Harrow's handwriting (Teacher Comment layer). */
  comment: { x: 310, y: 1268, w: 1480, h: 280 },
  /** Parent signature area; the printed line is at SIGNATURE_LINE_Y. */
  signature: { x: 310, y: 1560, w: 940, h: 200 },
  /** "RETURN SIGNED BY MONDAY" printed box (Paper) + the student ID stub (dynamic text). */
  returnBox: { x: 1270, y: 1575, w: 520, h: 170 },
  /** Doodle zone B: the footer strip. */
  doodleB: { x: 310, y: 1770, w: 1480, h: 110 },
} as const satisfies Record<string, Rect>;

/**
 * Where Harrow's comment handwriting goes (two lines max). Ends at x=1570 so
 * the right end of the comment box is free for attachments and pen marks.
 */
export const COMMENT_TEXT: Rect = { x: 330, y: 1320, w: 1240, h: 215 };

export const ATTENDANCE_VALUE_X = 700;
export const SIGNATURE_LINE_Y = 1715;

/**
 * The status stamp: the top layer, centred over the header so it dominates
 * the top third without hiding grades. Fits in maxW x maxH before its own
 * rotation (art picks -9..+4 deg). EXPELLED may instead slam diagonally
 * across the whole card (its art brief says so).
 */
export const STAMP = { center: { x: 1010, y: 345 }, maxW: 1640, maxH: 400 } as const;

/** Subject order on the card, row-major in a 2x3 grid. Matches SUBJECT_COPY order. */
export const SUBJECT_ORDER = [
  "buyingTheTop",
  "takingProfit",
  "riskManagement",
  "holdingBags",
  "chasingMemes",
  "sellingTooEarly",
] as const;

/** Subject box i (0..5): printed by the Paper layer (label top-left, remark bottom-left). */
export const GRADE_BOXES: readonly Rect[] = SUBJECT_ORDER.map((_, i) => ({
  x: 310 + (i % 2) * 635,
  y: 515 + Math.floor(i / 2) * 220,
  w: 615,
  h: 210,
}));

/** Grade glyph slot inside box i. Grade files are drawn in a GLYPH.w x GLYPH.h viewBox. */
export const GLYPH = { w: 330, h: 205, dx: 275, dy: 5 } as const;
export const GRADE_GLYPHS: readonly Rect[] = GRADE_BOXES.map((b) => ({
  x: b.x + GLYPH.dx,
  y: b.y + GLYPH.dy,
  w: GLYPH.w,
  h: GLYPH.h,
}));

/**
 * The REMARKS block inside box i (dynamic text): up to 2 lines, first
 * baseline at y, left of the glyph slot (max width REMARK_W).
 */
export const REMARK_POS = GRADE_BOXES.map((b) => ({ x: b.x + 20, y: b.y + 158 }));
export const REMARK_W = 250;

/**
 * Incident attachment zones. An attachment may overhang the card edge onto
 * the background, but must not cover any GRADE_GLYPHS slot or the comment text.
 */
export const INCIDENT_ZONES = {
  topRightCorner: { x: 1480, y: 40, w: 480, h: 440 },
  topEdge: { x: 420, y: 20, w: 1200, h: 230 },
  topLeftCorner: { x: 90, y: 40, w: 600, h: 440 },
  rightEdge: { x: 1600, y: 1150, w: 390, h: 560 },
  lowerRight: { x: 1180, y: 1540, w: 780, h: 440 },
  bottomEdge: { x: 250, y: 1720, w: 1100, h: 270 },
  lowerHalf: { x: 520, y: 1540, w: 1400, h: 440 },
} as const satisfies Record<string, Rect>;

/**
 * Pen-mark areas. Anchored marks (circle/underline a grade) are drawn around
 * GRADE_GLYPHS[0] (Buying the Top) and the compositor translates them to the
 * anchor slot; see PEN_MARK_ANCHORS in catalog.ts.
 */
export const PEN_ZONES = {
  /** Left margin between the top two holes. */
  leftMargin: { x: 175, y: 430, w: 115, h: 540 },
  /** Right end of the comment box. */
  commentRight: { x: 1420, y: 1268, w: 370, h: 280 },
  /** Top of the right column (same as ZONES.penCorner). */
  corner: { x: 1575, y: 505, w: 235, h: 230 },
} as const satisfies Record<string, Rect>;

export function slotOffset(slot: number): { dx: number; dy: number } {
  return { dx: GRADE_GLYPHS[slot].x - GRADE_GLYPHS[0].x, dy: GRADE_GLYPHS[slot].y - GRADE_GLYPHS[0].y };
}
