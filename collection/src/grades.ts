/**
 * Rule-driven grades. Status is allocated first (exact quotas); then each
 * card gets six 0-100 subject scores that the APP's own grading code
 * (src/lib/grading.ts: letter / academicStanding / determineStatus) turns
 * back into exactly that status. Grades are never rolled independently.
 */
import { academicStanding, determineStatus, letter } from "../../src/lib/grading";
import type { Incident, LetterGrade, Status, SubjectGrade, SubjectKey } from "../../src/lib/types";
import type { StatusKey } from "../copy/types";
import { SUBJECT_COPY, GRADE_BAND } from "../copy/traits";
import { SUBJECT_KEYS, SUBJECT_NAMES, VICE } from "./catalog";
import type { Rng } from "./prng";

export type Scores = Record<SubjectKey, number | null>;
export type Grades = Record<SubjectKey, LetterGrade>;

/** Academic-standing band per app status (determineStatus thresholds). */
const STANDING: Partial<Record<StatusKey, [number, number]>> = {
  "HONOR ROLL": [80, 100],
  "NEEDS IMPROVEMENT": [62, 79],
  "ACADEMIC PROBATION": [45, 61],
  "HELD BACK": [30, 44],
  SUSPENDED: [18, 29],
  EXPELLED: [0, 17],
};

/** Grade points per letter (4.33 scale). */
export const GRADE_POINTS: Readonly<Record<Exclude<LetterGrade, "I">, number>> = {
  "A+": 4.33, A: 4, "A-": 3.67,
  "B+": 3.33, B: 3, "B-": 2.67,
  "C+": 2.33, C: 2, "C-": 1.67,
  "D+": 1.33, D: 1, "D-": 0.67,
  F: 0,
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export function toSubjectGrades(scores: Scores): SubjectGrade[] {
  return SUBJECT_KEYS.map((key) => ({
    key,
    name: SUBJECT_NAMES[key],
    score: scores[key],
    grade: letter(scores[key]),
    remark: "",
  }));
}

export function gradesOf(scores: Scores): Grades {
  const out = {} as Grades;
  for (const k of SUBJECT_KEYS) out[k] = letter(scores[k]);
  return out;
}

/** The status the app itself would print for these scores. */
export function appStatus(scores: Scores, liquidated: boolean): Status {
  const subjects = toSubjectGrades(scores);
  const incidents: Incident[] = liquidated ? ["LIQUIDATED"] : [];
  return determineStatus(subjects, academicStanding(subjects), incidents, 1);
}

/** Valedictorian: every vice subject F, every virtue subject A+ (collection-only status). */
export function isValedictorianPattern(g: Grades): boolean {
  return SUBJECT_KEYS.every((k) => (VICE[k] ? g[k] === "F" : g[k] === "A+"));
}

/** Does the card's grade sheet print the status we allocated? (VALEDICTORIAN => app HONOR ROLL + pattern) */
export function gradesMatchStatus(status: StatusKey, scores: Scores, liquidated: boolean): boolean {
  const g = gradesOf(scores);
  if (status === "VALEDICTORIAN") return appStatus(scores, liquidated) === "HONOR ROLL" && isValedictorianPattern(g);
  if (status === "HONOR ROLL" && isValedictorianPattern(g)) return false;
  if (liquidated && (status !== "EXPELLED" || g.riskManagement !== "F")) return false;
  return appStatus(scores, liquidated) === status;
}

/** Virtue score: how much a subject HELPS standing (vice subjects inverted). */
export function virtue(k: SubjectKey, score: number): number {
  return VICE[k] ? 100 - score : score;
}

/** GPA on a 4.33 scale that follows standing: grade points of each subject's virtue score. */
export function gpaOf(scores: Scores): number {
  const pts: number[] = [];
  for (const k of SUBJECT_KEYS) {
    const s = scores[k];
    if (s === null) continue;
    const l = letter(virtue(k, s)) as Exclude<LetterGrade, "I">;
    pts.push(GRADE_POINTS[l]);
  }
  if (pts.length === 0) return 0;
  return Math.round((pts.reduce((a, b) => a + b, 0) / pts.length) * 100) / 100;
}

/** Subject hurting standing most (lowest virtue), ties in card order. Null if none graded. */
export function worstSubject(scores: Scores): SubjectKey | null {
  let best: SubjectKey | null = null;
  let bestV = Infinity;
  for (const k of SUBJECT_KEYS) {
    const s = scores[k];
    if (s === null) continue;
    const v = virtue(k, s);
    if (v < bestV) {
      bestV = v;
      best = k;
    }
  }
  return best;
}

/** Subject helping standing most (highest virtue), ties in card order. */
export function bestSubject(scores: Scores): SubjectKey | null {
  let best: SubjectKey | null = null;
  let bestV = -Infinity;
  for (const k of SUBJECT_KEYS) {
    const s = scores[k];
    if (s === null) continue;
    const v = virtue(k, s);
    if (v > bestV) {
      bestV = v;
      best = k;
    }
  }
  return best;
}

/**
 * Six scores for a card with this status. Deterministic for a given rng.
 * `incomplete`: subjects to leave ungraded ("I").
 */
export function generateScores(
  status: StatusKey,
  liquidated: boolean,
  incomplete: readonly SubjectKey[],
  r: Rng,
): Scores {
  for (let attempt = 0; attempt < 4000; attempt++) {
    const s = rollScores(status, liquidated, r);
    for (const k of incomplete) s[k] = null;
    if (gradesMatchStatus(status, s, liquidated)) return s;
  }
  throw new Error(`could not generate grades for ${status}${liquidated ? " (liquidated)" : ""} with I in [${incomplete}]`);
}

function rollScores(status: StatusKey, liquidated: boolean, r: Rng): Scores {
  const s = {} as Record<SubjectKey, number | null>;
  if (status === "VALEDICTORIAN") {
    for (const k of SUBJECT_KEYS) s[k] = VICE[k] ? r.int(0, 3) : r.int(97, 100);
    return s;
  }
  if (status === "MOST LIKELY TO BECOME EXIT LIQUIDITY") {
    // Buys the top, chases memes, never sells. Everything else is chaos.
    s.buyingTheTop = r.int(90, 100);
    s.chasingMemes = r.int(80, 100);
    s.takingProfit = Math.floor(Math.pow(r.next(), 1.6) * 60);
    s.riskManagement = clamp(r.float(0, 1) ** 1.4 * 85);
    s.holdingBags = clamp(40 + r.next() * 60);
    s.sellingTooEarly = clamp(r.next() * 100);
    return s;
  }
  // Each subject is either something the student is "good" at (virtue 55-100)
  // or "bad" at (virtue 0-45); good vice subjects print F, bad ones print
  // A..D. A bimodal sheet reads better than a wall of 50s (which are all F).
  const [lo, hi] = liquidated ? [0, 34] : STANDING[status]!;
  const target = r.float(lo, hi + 0.99);
  const pGood = Math.max(0.04, Math.min(0.96, (target - 22) / 62));
  const v: Record<SubjectKey, number> = {} as Record<SubjectKey, number>;
  for (let tries = 0; tries < 200; tries++) {
    for (const k of SUBJECT_KEYS) {
      const good = r.chance(pGood);
      // Skew toward the extremes so A+ and deep F both show up.
      const u = Math.pow(r.next(), 0.8);
      v[k] = good ? 55 + u * 45 : 45 - u * 45;
    }
    const mean = SUBJECT_KEYS.reduce((a, k) => a + clamp(v[k]), 0) / SUBJECT_KEYS.length;
    if (mean >= lo && mean <= hi + 0.49) break;
  }
  for (const k of SUBJECT_KEYS) {
    const vv = clamp(v[k]);
    s[k] = VICE[k] ? 100 - vv : vv;
  }
  if (liquidated) s.riskManagement = 0; // the app zeroes Risk Management on liquidation
  return s;
}

/** REMARKS-column text for a subject's grade band. */
export function remarkFor(k: SubjectKey, g: LetterGrade, r: Rng): string {
  return r.pick(SUBJECT_COPY[k].remarks[GRADE_BAND[g]]);
}
