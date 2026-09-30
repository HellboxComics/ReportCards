/**
 * Shared shapes for the comedy bible. Pure types: no logic lives here.
 *
 * Grade semantics are the app's (src/lib/grading.ts): a subject's letter grade
 * measures how much the student DOES the named thing. An A+ in Buying the Top
 * means an elite top-buyer, which is bad. "Vice" subjects (Buying the Top,
 * Holding Bags, Chasing Memes, Selling Too Early) hurt academic standing when
 * high; "virtue" subjects (Taking Profit, Risk Management) help it.
 */
import type { Incident, LetterGrade, Status, SubjectKey } from "../../src/lib/types";

export type { LetterGrade, SubjectKey };

/** Rarity tier of a single trait value (and of a token, plus "1 of 1"). */
export type Tier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type TokenTier = Tier | "1 of 1";

/** The app's seven statuses plus the collection-only legendary one. */
export type StatusKey = Status | "VALEDICTORIAN";

/** The app's four incidents, plus collection-only paperwork and "no incident". */
export type IncidentKey =
  | "NONE"
  | Incident
  | "HALL_PASS"
  | "CONFISCATED_NOTE"
  | "LUNCH_IOU"
  | "PERMISSION_SLIP";

/** Same labels the app's attendance() prints. */
export type AttendanceKey =
  | "PERFECT"
  | "EXCELLENT"
  | "SATISFACTORY"
  | "SPOTTY"
  | "CHRONICALLY ABSENT"
  | "NEVER SHOWED UP";

export type EraKey =
  | "mimeograph"
  | "1987-carbon"
  | "1994-dot-matrix"
  | "1999-office-laser"
  | "2004-inkjet"
  | "gold-foil";

export type SeasonKey = "FALL" | "WINTER" | "SPRING" | "SUMMER";

/** Letter-grade bands used by `When.high` / `When.low` and subject remarks. */
export type GradeBand = "A" | "B" | "C" | "D" | "F" | "I";

/**
 * Conditions under which a trait value or comment fits a card.
 * All present fields must match (AND). Inside one field, any entry matches (OR).
 * An omitted `when` means "fits any card".
 *
 * - high: at least one listed subject is in the A or B band (A+ .. B-).
 * - low:  at least one listed subject is in the D band or F (D+ .. F).
 *   Incomplete ("I") is neither high nor low.
 * - anyGrade: at least one of the six subjects has one of these exact letters.
 */
export interface When {
  readonly status?: readonly StatusKey[];
  readonly notStatus?: readonly StatusKey[];
  readonly high?: readonly SubjectKey[];
  readonly low?: readonly SubjectKey[];
  readonly anyGrade?: readonly LetterGrade[];
  readonly incident?: readonly IncidentKey[];
  readonly attendance?: readonly AttendanceKey[];
  readonly era?: readonly EraKey[];
  readonly season?: readonly SeasonKey[];
  readonly school?: readonly string[];
}

/** One value of one layer. `id` doubles as the layer file name (e.g. backgrounds/<id>.svg). */
export interface TraitValue {
  /** kebab-case slug; stable; used as the layer file name. */
  readonly id: string;
  /** Marketplace attribute value. Title Case, ASCII, kept short (≤ 34 chars). */
  readonly name: string;
  /** One-line joke for docs (RARITY.md, README). */
  readonly joke: string;
  /** Suggested tier. The foundation agent finalizes quotas in SPEC.md. */
  readonly tier: Tier;
  /** When this value is allowed. Omitted = any card. */
  readonly when?: When;
  /** Lowercase noun phrase for description templates, e.g. "a smear of mystery cafeteria gravy". */
  readonly phrase?: string;
  /** Brief for the layer artist: what to draw, where, what colors. */
  readonly art?: string;
}

export interface PaperValue extends TraitValue {
  readonly key: EraKey;
  /** The year printed on the card; the semester label uses it. */
  readonly year: number;
}

export interface SchoolValue extends TraitValue {
  /** Header text exactly as printed on the card. */
  readonly printed: string;
  /** Motto printed under the header. */
  readonly motto: string;
}

export interface SeasonValue {
  readonly key: SeasonKey;
  readonly id: string;
  readonly name: string;
  readonly printed: string;
  readonly joke: string;
  readonly tier: Tier;
  readonly when?: When;
}

export interface AttendanceValue extends TraitValue {
  readonly key: AttendanceKey;
  /** Exactly what prints in the ATTENDANCE row. */
  readonly printed: string;
}

export interface StatusValue extends TraitValue {
  readonly key: StatusKey;
  /** Stamp text (the big one). */
  readonly printed: string;
  /** Small line inside or under the stamp ring. */
  readonly subtext: string;
  /** Suggested share of the 3300 generated (non 1/1) tokens. Shares sum to 1. */
  readonly share: number;
}

export interface IncidentValue extends TraitValue {
  readonly key: IncidentKey;
  /** The paperwork physically attached to the card. Absent for NONE. */
  readonly slip?: { readonly heading: string; readonly lines: readonly string[] };
}

export interface SubjectCopy {
  readonly name: string;
  readonly vice: boolean;
  readonly joke: string;
  /** Short REMARKS-column text per grade band (≤ 26 chars each). */
  readonly remarks: Readonly<Record<GradeBand, readonly string[]>>;
}

export interface TeacherComment {
  /** Stable slug. */
  readonly id: string;
  /** Handwritten on the card. ≤ 90 characters. Also the "Teacher Comment" attribute value. */
  readonly text: string;
  readonly tier: Tier;
  /** Omitted = generic, fits any card. */
  readonly when?: When;
}
