/**
 * Coherence rules: `When` matching (the comedy bible's condition language),
 * the generator's own token-side rules, and a full per-token rule check used
 * by validate and the tests.
 */
import { GRADE_BAND } from "../copy/traits";
import type {
  AttendanceKey,
  EraKey,
  IncidentKey,
  LetterGrade,
  SeasonKey,
  StatusKey,
  SubjectKey,
  When,
} from "../copy/types";
import { LAYERS, SUBJECT_KEYS, type LayerKey } from "./catalog";

/** What a `When` can look at. Fields may be undefined while a card is still being built. */
export interface CardView {
  status: StatusKey;
  grades: Readonly<Record<SubjectKey, LetterGrade>>;
  incident?: IncidentKey;
  attendance?: AttendanceKey;
  era?: EraKey;
  season?: SeasonKey;
  school?: string;
}

const isHigh = (g: LetterGrade) => GRADE_BAND[g] === "A" || GRADE_BAND[g] === "B";
const isLow = (g: LetterGrade) => GRADE_BAND[g] === "D" || GRADE_BAND[g] === "F";

/**
 * True when every present field of `w` matches the card (AND across fields,
 * OR inside a field). A field about a layer the card doesn't have yet
 * (undefined) is treated as matching; the final rule check re-runs with
 * every field set.
 */
export function matchesWhen(w: When | undefined, c: CardView): boolean {
  if (!w) return true;
  if (w.status && !w.status.includes(c.status)) return false;
  if (w.notStatus && w.notStatus.includes(c.status)) return false;
  if (w.high && !w.high.some((s) => isHigh(c.grades[s]))) return false;
  if (w.low && !w.low.some((s) => isLow(c.grades[s]))) return false;
  if (w.anyGrade && !SUBJECT_KEYS.some((s) => w.anyGrade!.includes(c.grades[s]))) return false;
  if (w.incident && c.incident !== undefined && !w.incident.includes(c.incident)) return false;
  if (w.attendance && c.attendance !== undefined && !w.attendance.includes(c.attendance)) return false;
  if (w.era && c.era !== undefined && !w.era.includes(c.era)) return false;
  if (w.season && c.season !== undefined && !w.season.includes(c.season)) return false;
  if (w.school && c.school !== undefined && !w.school.includes(c.school)) return false;
  return true;
}

/**
 * Rules the generator enforces on top of the copy's `when`s (token side).
 * Returns false when the value is not allowed on this card.
 */
export function tokenAllows(layer: LayerKey, valueId: string, c: CardView): boolean {
  switch (layer) {
    case "attendance":
      // Valedictorians show up. Honor roll students at least exist.
      if (c.status === "VALEDICTORIAN") return valueId === "perfect" || valueId === "excellent";
      if (c.status === "HONOR ROLL") return valueId !== "never-showed-up" && valueId !== "chronically-absent";
      return true;
    case "season":
      // SUMMER <=> summer school, both directions.
      if (c.school === "summer-school") return valueId === "summer";
      return valueId !== "summer";
    default:
      return true;
  }
}

/** Value allowed on this card: its own `when` plus token-side rules. */
export function allowed(layer: LayerKey, valueId: string, c: CardView): boolean {
  const v = LAYERS[layer].values.find((x) => x.id === valueId);
  if (!v) return false;
  return matchesWhen(v.when, c) && tokenAllows(layer, valueId, c);
}
