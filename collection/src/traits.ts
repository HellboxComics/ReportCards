/**
 * Display values: turns a token's trait ids into the marketplace attribute
 * values (the same strings the metadata uses and rarity counts).
 */
import { PAPERS, SEASONS, semesterName, STATUS_BY_KEY } from "../copy/traits";
import { LAYERS, SUBJECT_KEYS, SUBJECT_NAMES, valueById } from "./catalog";
import type { GenerativeToken, OneOfOneToken } from "./select";

/** "Fall 1994". */
export function semesterOf(t: GenerativeToken): string {
  const season = SEASONS.find((s) => s.id === t.traits.season)!;
  const paper = PAPERS.find((p) => p.id === t.traits.paper)!;
  return semesterName(season, paper.year);
}

/** Printed on the card: "FALL 1994". */
export function semesterPrintedOf(t: GenerativeToken): string {
  return semesterOf(t).toUpperCase();
}

export function paperYear(paperId: string): number {
  return PAPERS.find((p) => p.id === paperId)!.year;
}

/**
 * Every visible trait as [trait_type, value], in metadata order. These are
 * also the traits statistical rarity is computed over.
 */
export function visibleTraits(t: GenerativeToken): [string, string][] {
  const v = (layer: Parameters<typeof valueById>[0], id: string) => valueById(layer, id).name;
  return [
    ["Status", STATUS_BY_KEY[t.status].name],
    ["Background", v("background", t.traits.background)],
    ["Paper", v("paper", t.traits.paper)],
    ["School", v("school", t.traits.school)],
    ["Semester", semesterOf(t)],
    ...SUBJECT_KEYS.map((k): [string, string] => [SUBJECT_NAMES[k], t.grades[k]]),
    ["Attendance", v("attendance", t.traits.attendance)],
    ["Teacher Comment", v("comment", t.traits.comment)],
    ["Pen Marks", v("penMarks", t.traits.penMarks)],
    ["Doodle", v("doodle", t.traits.doodle)],
    ["Stain", v("stain", t.traits.stain)],
    ["Parent Signature", v("signature", t.traits.signature)],
    ["Incident", v("incident", t.traits.incident)],
  ];
}

/** The same trait types for a one-of-one, with its bespoke values. */
export function oneOfOneTraits(t: OneOfOneToken): [string, string][] {
  const p = t.piece;
  const tr = p.traits;
  return [
    ["Status", tr.Status],
    ["Background", tr.Background],
    ["Paper", tr.Paper],
    ["School", tr.School],
    ["Semester", tr.Semester],
    ...SUBJECT_KEYS.map((k): [string, string] => [SUBJECT_NAMES[k], p.grades[k]]),
    ["Attendance", tr.Attendance],
    ["Teacher Comment", tr["Teacher Comment"]],
    ["Pen Marks", tr["Pen Marks"]],
    ["Doodle", tr.Doodle],
    ["Stain", tr.Stain],
    ["Parent Signature", tr["Parent Signature"]],
    ["Incident", tr.Incident],
  ];
}

/** trait_type list in metadata order (for docs and schema tests). */
export const TRAIT_TYPES: readonly string[] = [
  "Status",
  LAYERS.background.traitType,
  LAYERS.paper.traitType,
  LAYERS.school.traitType,
  "Semester",
  ...SUBJECT_KEYS.map((k) => SUBJECT_NAMES[k]),
  LAYERS.attendance.traitType,
  LAYERS.comment.traitType,
  LAYERS.penMarks.traitType,
  LAYERS.doodle.traitType,
  LAYERS.stain.traitType,
  LAYERS.signature.traitType,
  LAYERS.incident.traitType,
];
