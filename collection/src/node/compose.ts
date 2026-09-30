/**
 * Stacks a token's layer files into one 2000x2000 SVG (node-only).
 *
 *   01 Background                 (not rotated)
 *   -- card group, rotated by the token's rotation around CARD_PIVOT --
 *   02 Paper
 *   03 School                     (era ink via currentColor)
 *   04 Semester / Student ID / GPA / REMARKS (dynamic text, paper-print.ts)
 *   05 Grades                     (glyph per subject slot)
 *   06 Attendance                 (era ink via currentColor)
 *   07 Teacher Comment
 *   08 Pen Marks                  (anchored marks translated to their slot)
 *   09 Doodle
 *   10 Stain
 *   11 Parent Signature
 *   12 Incident
 *   13 Status
 *
 * One-of-ones are a single full-canvas file from layers/1of1.
 */
import { studentId } from "../../copy/traits";
import type { EraKey } from "../../copy/types";
import { dynamicText, ERA_PRINT } from "../../art/paper-print";
import { GRADES_DIR, gradeSlug, LAYERS, ONE_OF_ONE_DIR, SUBJECT_KEYS, type LayerKey } from "../catalog";
import { CARD_PIVOT, GRADE_GLYPHS, slotOffset } from "../layout";
import type { GenerativeToken, Token } from "../select";
import { STATUS_ID } from "../select";
import { semesterPrintedOf } from "../traits";
import { embed, layerFile, listLayer } from "./layers";

export interface ComposeOptions {
  /** Dev only: skip layers whose files don't exist yet instead of throwing. */
  lenient?: boolean;
}

const SVG_OPEN = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="2000" height="2000" viewBox="0 0 2000 2000">`;

export function composeTokenSvg(token: Token, opts: ComposeOptions = {}): string {
  if (token.kind === "oneOfOne") {
    return `${SVG_OPEN}${embed(layerFile(ONE_OF_ONE_DIR, token.piece.slug), "o-")}</svg>`;
  }
  return composeGenerative(token, opts);
}

function piece(layer: LayerKey, slug: string, prefix: string, opts: ComposeOptions): string {
  const dir = LAYERS[layer].dir!;
  if (opts.lenient && !listLayer(dir).has(slug)) return `<!-- missing ${dir}/${slug} -->`;
  return embed(layerFile(dir, slug), prefix);
}

export function composeGenerative(t: GenerativeToken, opts: ComposeOptions = {}): string {
  const era = t.traits.paper as EraKey;
  const ink = ERA_PRINT[era];
  const inked = (s: string) => `<g color="${ink.ink}" font-family="${ink.font}">${s}</g>`;
  const parts: string[] = [];

  parts.push(piece("background", t.traits.background, "bg-", opts));
  parts.push(`<g transform="rotate(${t.rotation} ${CARD_PIVOT.x} ${CARD_PIVOT.y})">`);
  parts.push(piece("paper", t.traits.paper, "pa-", opts));
  parts.push(inked(piece("school", t.traits.school, "sc-", opts)));
  parts.push(
    dynamicText({
      era,
      studentId: studentId(t.id),
      semester: semesterPrintedOf(t),
      gpa: t.gpa.toFixed(2),
      remarks: SUBJECT_KEYS.map((k) => t.remarks[k]),
    }),
  );
  SUBJECT_KEYS.forEach((k, i) => {
    const slug = gradeSlug(t.grades[k]);
    if (opts.lenient && !listLayer(GRADES_DIR).has(slug)) return;
    parts.push(embed(layerFile(GRADES_DIR, slug), `gr${i}-`, GRADE_GLYPHS[i]));
  });
  parts.push(inked(piece("attendance", t.traits.attendance, "at-", opts)));
  parts.push(piece("comment", t.traits.comment, "tc-", opts));
  const pen = piece("penMarks", t.traits.penMarks, "pm-", opts);
  if (t.penAnchor !== null) {
    const { dx, dy } = slotOffset(t.penAnchor);
    parts.push(`<g transform="translate(${dx} ${dy})">${pen}</g>`);
  } else parts.push(pen);
  parts.push(piece("doodle", t.traits.doodle, "dd-", opts));
  parts.push(piece("stain", t.traits.stain, "st-", opts));
  parts.push(piece("signature", t.traits.signature, "sg-", opts));
  parts.push(piece("incident", t.traits.incident, "in-", opts));
  parts.push(piece("status", STATUS_ID[t.status], "ss-", opts));
  parts.push(`</g>`);
  return `${SVG_OPEN}${parts.join("")}</svg>`;
}
