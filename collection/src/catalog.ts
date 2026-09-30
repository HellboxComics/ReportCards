/**
 * The engine's view of every layer: which copy array feeds it, its metadata
 * trait_type, its folder under collection/layers, its final tiers and its
 * rarity curve (tier shares). SPEC.md documents the same numbers.
 */
import { COMMENTS } from "../copy/comments";
import {
  ATTENDANCE,
  BACKGROUNDS,
  DOODLES,
  INCIDENTS,
  PAPERS,
  PEN_MARKS,
  SCHOOLS,
  SEASONS,
  SIGNATURES,
  STAINS,
  STATUSES,
} from "../copy/traits";
import type { LetterGrade, SeasonValue, SubjectKey, Tier, When } from "../copy/types";

export type LayerKey =
  | "background"
  | "paper"
  | "school"
  | "season"
  | "attendance"
  | "comment"
  | "penMarks"
  | "doodle"
  | "stain"
  | "signature"
  | "incident"
  | "status";

export interface CatalogValue {
  /** Slug; also the layer file basename. */
  readonly id: string;
  /** Marketplace attribute value. */
  readonly name: string;
  /** Final tier (writers' tier unless overridden below). */
  readonly tier: Tier;
  readonly when?: When;
}

export interface LayerDef {
  readonly key: LayerKey;
  /** Metadata trait_type. */
  readonly traitType: string;
  /** Folder under collection/layers, or null for dynamic text (no files). */
  readonly dir: string | null;
  /** Stack position, bottom (1) to top (13). */
  readonly order: number;
  readonly group: ArtGroup;
  readonly values: readonly CatalogValue[];
  /**
   * The designed rarity curve: share of the 3,300 generated tokens per tier.
   * Missing tiers get 0. Shares are split evenly between the tier's values.
   * Absent for layers whose counts are derived (status: fixed; season: school).
   */
  readonly tierShares?: Readonly<Partial<Record<Tier, number>>>;
  /** Exact counts for specific values (taken off the top before shares apply). */
  readonly fixedCounts?: Readonly<Record<string, number>>;
  /** A conditional value never takes more than this share of the tokens it is allowed on. */
  readonly maxFill?: number;
}

export type ArtGroup = "surfaces" | "paper" | "marks" | "attachments";

export const TIERS: readonly Tier[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];

/** Foundation tier overrides (value id -> tier). Documented in SPEC.md. */
const TIER_OVERRIDES: Partial<Record<LayerKey, Record<string, Tier>>> = {
  doodle: { "harrow-horns": "Epic" },
};

function values(
  layer: LayerKey,
  items: readonly { id: string; name: string; tier: Tier; when?: When }[],
): CatalogValue[] {
  const o = TIER_OVERRIDES[layer] ?? {};
  return items.map((v) => ({ id: v.id, name: v.name, tier: o[v.id] ?? v.tier, when: v.when }));
}

export const LAYERS: Readonly<Record<LayerKey, LayerDef>> = {
  background: {
    key: "background",
    traitType: "Background",
    dir: "01-Background",
    order: 1,
    group: "surfaces",
    values: values("background", BACKGROUNDS),
    tierShares: { Common: 0.58, Uncommon: 0.26, Rare: 0.12, Epic: 0.03, Legendary: 0.01 },
  },
  paper: {
    key: "paper",
    traitType: "Paper",
    dir: "02-Paper",
    order: 2,
    group: "paper",
    values: values("paper", PAPERS),
    tierShares: { Common: 0.6, Uncommon: 0.27, Rare: 0.12, Legendary: 0.01 },
  },
  school: {
    key: "school",
    traitType: "School",
    dir: "03-School",
    order: 3,
    group: "paper",
    values: values("school", SCHOOLS),
    tierShares: { Common: 0.59, Uncommon: 0.25, Rare: 0.13, Epic: 0.03 },
  },
  season: {
    key: "season",
    traitType: "Semester",
    dir: null,
    order: 4,
    group: "paper",
    values: (SEASONS as readonly SeasonValue[]).map((s) => ({ id: s.id, name: s.name, tier: s.tier, when: s.when })),
  },
  attendance: {
    key: "attendance",
    traitType: "Attendance",
    dir: "06-Attendance",
    order: 6,
    group: "marks",
    values: values("attendance", ATTENDANCE),
    tierShares: { Common: 0.6, Uncommon: 0.28, Rare: 0.12 },
  },
  comment: {
    key: "comment",
    traitType: "Teacher Comment",
    dir: "07-Teacher-Comment",
    order: 7,
    group: "marks",
    values: COMMENTS.map((c) => ({ id: c.id, name: c.text, tier: c.tier, when: c.when })),
    tierShares: { Common: 0.56, Uncommon: 0.24, Rare: 0.13, Epic: 0.06, Legendary: 0.01 },
    maxFill: 0.6,
  },
  penMarks: {
    key: "penMarks",
    traitType: "Pen Marks",
    dir: "08-Pen-Marks",
    order: 8,
    group: "marks",
    values: values("penMarks", PEN_MARKS),
    tierShares: { Common: 0.585, Uncommon: 0.26, Rare: 0.12, Epic: 0.035 },
    fixedCounts: { hearts: 2 },
  },
  doodle: {
    key: "doodle",
    traitType: "Doodle",
    dir: "09-Doodle",
    order: 9,
    group: "attachments",
    values: values("doodle", DOODLES),
    tierShares: { Common: 0.58, Uncommon: 0.27, Rare: 0.12, Epic: 0.03 },
  },
  stain: {
    key: "stain",
    traitType: "Stain",
    dir: "10-Stain",
    order: 10,
    group: "surfaces",
    values: values("stain", STAINS),
    tierShares: { Common: 0.57, Uncommon: 0.26, Rare: 0.14, Epic: 0.03 },
  },
  signature: {
    key: "signature",
    traitType: "Parent Signature",
    dir: "11-Parent-Signature",
    order: 11,
    group: "marks",
    values: values("signature", SIGNATURES),
    tierShares: { Common: 0.57, Uncommon: 0.25, Rare: 0.13, Epic: 0.05 },
  },
  incident: {
    key: "incident",
    traitType: "Incident",
    dir: "12-Incident",
    order: 12,
    group: "attachments",
    values: values("incident", INCIDENTS),
    tierShares: { Common: 0.58, Uncommon: 0.25, Rare: 0.135, Epic: 0.035 },
  },
  status: {
    key: "status",
    traitType: "Status",
    dir: "13-Status",
    order: 13,
    group: "attachments",
    values: values("status", STATUSES),
  },
};

/** Grade glyphs (layer 5): one file per letter, placed into each subject's slot. */
export const GRADES_DIR = "05-Grades";
export const ONE_OF_ONE_DIR = "1of1";

export const LETTERS: readonly LetterGrade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "I"];

/** "A+" -> "a-plus", "B-" -> "b-minus", "F" -> "f". Grade glyph file basenames. */
export function gradeSlug(g: string): string {
  return g.toLowerCase().replace("+", "-plus").replace(/-$/, "-minus");
}

/** Every layer key in stack order (bottom -> top), excluding grades (dynamic slots). */
export const LAYER_ORDER: readonly LayerKey[] = (Object.values(LAYERS) as LayerDef[])
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((l) => l.key);

/**
 * Pen marks that must sit on a specific grade. Their files are drawn around
 * GRADE_GLYPHS[0]; the compositor translates them to the anchor slot.
 * - firstF: first subject (card order) graded F
 * - worst:  the subject hurting standing most (highest vice / lowest virtue)
 */
export const PEN_MARK_ANCHORS: Readonly<Record<string, "firstF" | "worst">> = {
  "circled-f": "firstF",
  "grade-changed": "firstF",
  "underlined-3x": "worst",
};

/** The subject keys, card order. */
export const SUBJECT_KEYS: readonly SubjectKey[] = [
  "buyingTheTop",
  "takingProfit",
  "riskManagement",
  "holdingBags",
  "chasingMemes",
  "sellingTooEarly",
];

export const SUBJECT_NAMES: Readonly<Record<SubjectKey, string>> = {
  buyingTheTop: "Buying the Top",
  takingProfit: "Taking Profit",
  riskManagement: "Risk Management",
  holdingBags: "Holding Bags",
  chasingMemes: "Chasing Memes",
  sellingTooEarly: "Selling Too Early",
};

export const VICE: Readonly<Record<SubjectKey, boolean>> = {
  buyingTheTop: true,
  takingProfit: false,
  riskManagement: false,
  holdingBags: true,
  chasingMemes: true,
  sellingTooEarly: true,
};

export function valueById(layer: LayerKey, id: string): CatalogValue {
  const v = LAYERS[layer].values.find((x) => x.id === id);
  if (!v) throw new Error(`unknown ${layer} value "${id}"`);
  return v;
}

/** Lookup by slug, marketplace name, or case-insensitive either (for --force). */
export function findValue(layer: LayerKey, query: string): CatalogValue | undefined {
  const q = query.trim().toLowerCase();
  return LAYERS[layer].values.find((v) => v.id === query || v.name === query || v.id === q || v.name.toLowerCase() === q);
}

/** Accepts a layer key, trait_type or folder name ("Pen Marks", "penMarks", "08-Pen-Marks"). */
export function findLayer(query: string): LayerKey | "grades" | undefined {
  const q = query.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (["grades", "grade", "05grades"].includes(q)) return "grades";
  for (const l of Object.values(LAYERS) as LayerDef[]) {
    const names = [l.key, l.traitType, l.dir ?? ""].map((s) => s.toLowerCase().replace(/[\s_-]+/g, ""));
    if (names.includes(q) || (l.dir && l.dir.toLowerCase().replace(/[\s_-]+/g, "").slice(2) === q)) return l.key;
  }
  if (q === "season") return "season";
  return undefined;
}
