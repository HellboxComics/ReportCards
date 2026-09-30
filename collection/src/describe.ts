/**
 * Each generated token's "permanent record" blurb, composed from its own
 * traits with the comedy bible's templates (collection/copy/descriptions.ts):
 * opener + subject line + incident/detail/GPA line + status closer.
 */
import {
  BEST_SUBJECT_LINES,
  cap,
  DETAIL_LINES,
  fill,
  GPA_LINES,
  INCIDENT_LINES,
  INCOMPLETE_LINES,
  OPENERS,
  STATUS_CLOSERS,
  WORST_SUBJECT_LINES,
  aGrade,
  type BlurbVars,
} from "../copy/descriptions";
import { GRADE_BAND, STATUS_BY_KEY, studentId, studentLabel } from "../copy/traits";
import type { LetterGrade, SubjectKey, TraitValue } from "../copy/types";
import { LAYERS, SUBJECT_KEYS, SUBJECT_NAMES, VICE, type LayerKey } from "./catalog";
import { bestSubject, worstSubject } from "./grades";
import { rng } from "./prng";
import { INCIDENT_KEY, type GenerativeToken } from "./select";
import { semesterOf } from "./traits";
import {
  BACKGROUNDS,
  DOODLES,
  PAPERS,
  PEN_MARKS,
  SCHOOLS,
  SIGNATURES,
  STAINS,
} from "../copy/traits";

const PHRASES: Partial<Record<LayerKey, readonly TraitValue[]>> = {
  background: BACKGROUNDS,
  paper: PAPERS,
  school: SCHOOLS,
  stain: STAINS,
  doodle: DOODLES,
  signature: SIGNATURES,
  penMarks: PEN_MARKS,
};

function phrase(layer: LayerKey, id: string): string {
  const v = PHRASES[layer]!.find((x) => x.id === id);
  if (!v?.phrase) throw new Error(`no phrase for ${layer}:${id}`);
  return v.phrase;
}

/** Does this grade hurt standing in the way the worst-subject lines assume? */
function hurts(k: SubjectKey, g: LetterGrade): boolean {
  const band = GRADE_BAND[g];
  return VICE[k] ? band === "A" || band === "B" || band === "C" : band === "D" || band === "F";
}

/** The token's description (deterministic per seed + id). */
export function describe(t: GenerativeToken, seed: string): string {
  const r = rng(seed, "blurb", t.id);
  const comment = LAYERS.comment.values.find((v) => v.id === t.traits.comment)!.name;
  const vars: BlurbVars = {
    student: studentLabel(t.id),
    studentId: studentId(t.id),
    school: phrase("school", t.traits.school),
    semester: semesterOf(t),
    paper: phrase("paper", t.traits.paper),
    background: phrase("background", t.traits.background),
    status: STATUS_BY_KEY[t.status].printed,
    stain: phrase("stain", t.traits.stain),
    doodle: phrase("doodle", t.traits.doodle),
    signature: phrase("signature", t.traits.signature),
    penMarks: phrase("penMarks", t.traits.penMarks),
    comment,
    gpa: t.gpa.toFixed(2),
  };
  const sentences: string[] = [];
  sentences.push(fill(r.pick(OPENERS), vars));

  // Subject line.
  const incompletes = SUBJECT_KEYS.filter((k) => t.grades[k] === "I");
  if (t.status === "HONOR ROLL" || t.status === "VALEDICTORIAN") {
    const k = bestSubject(t.scores)!;
    sentences.push(fill(r.pick(BEST_SUBJECT_LINES[k]), { ...vars, grade: t.grades[k], aGrade: aGrade(t.grades[k]) }));
  } else if (incompletes.length > 0 && r.chance(0.5)) {
    sentences.push(fill(r.pick(INCOMPLETE_LINES), { ...vars, subject: SUBJECT_NAMES[r.pick(incompletes)] }));
  } else {
    // The worst-subject lines roast a HIGH vice grade or a LOW virtue grade;
    // if nothing on the card hurts that way, praise the best subject instead.
    const k = worstSubject(t.scores)!;
    const lines = hurts(k, t.grades[k]) ? WORST_SUBJECT_LINES : BEST_SUBJECT_LINES;
    const kk = hurts(k, t.grades[k]) ? k : bestSubject(t.scores)!;
    sentences.push(fill(r.pick(lines[kk]), { ...vars, grade: t.grades[kk], aGrade: aGrade(t.grades[kk]) }));
  }

  // Incident, else a detail or GPA line.
  const incident = INCIDENT_KEY[t.traits.incident];
  if (incident !== "NONE") {
    sentences.push(fill(r.pick(INCIDENT_LINES[incident]), vars));
  } else if (r.chance(0.25)) {
    const band = GPA_LINES.find((b) => b.max >= t.gpa) ?? GPA_LINES[GPA_LINES.length - 1];
    sentences.push(fill(r.pick(band.lines), vars));
  } else {
    sentences.push(fill(r.pick(DETAIL_LINES), vars));
  }

  sentences.push(fill(r.pick(STATUS_CLOSERS[t.status]), vars));
  return sentences.map(cap).join(" ");
}
