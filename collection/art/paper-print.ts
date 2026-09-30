/**
 * PAPER GROUP — era print styles + the dynamic text printed per token
 * (Student ID, Semester, GPA, REMARKS lines). Pure (no fs): the compositor
 * calls dynamicText() at render time and wraps era-printed layers (School,
 * Attendance) in <g color=ink font-family=font> so `currentColor` and an
 * inherited font pick up the era.
 */
import type { EraKey } from "../copy/types";
import { FONTS } from "../src/fonts";
import { REMARK_POS, ZONES } from "../src/layout";

export interface EraPrint {
  /** Printed ink colour (currentColor for era-printed layers). */
  ink: string;
  /** Pre-printed accent (RETURN SIGNED BY MONDAY box, rules). */
  accent: string;
  /** Faint rule lines. */
  rule: string;
  /** Body font family for printed text. */
  font: string;
  /** Bold/label font family (may equal font). */
  labelFont: string;
  labelWeight?: string;
  /** Uppercase letter-spacing for labels. */
  spacing: number;
  /** Mis-registration ghost for mimeograph/carbon: offset + opacity. */
  ghost?: { dx: number; dy: number; opacity: number };
}

export const ERA_PRINT: Readonly<Record<EraKey, EraPrint>> = {
  "1994-dot-matrix": { ink: "#1E1E24", accent: "#C4161C", rule: "#6B8F6B", font: FONTS.dotMatrix, labelFont: FONTS.dotMatrix, spacing: 1 },
  "1999-office-laser": { ink: "#141414", accent: "#D0102B", rule: "#9A9A9A", font: FONTS.mono, labelFont: FONTS.mono, labelWeight: "bold", spacing: 1 },
  "1987-carbon": { ink: "#1B2A6B", accent: "#1B2A6B", rule: "#7C6FA0", font: FONTS.typewriter, labelFont: FONTS.typewriter, spacing: 1, ghost: { dx: 2.5, dy: 1.5, opacity: 0.35 } },
  "2004-inkjet": { ink: "#3A1F3D", accent: "#B0105A", rule: "#B99AB5", font: FONTS.serif, labelFont: FONTS.serif, spacing: 1 },
  mimeograph: { ink: "#6B3FA0", accent: "#6B3FA0", rule: "#9C84C4", font: FONTS.typewriter, labelFont: FONTS.typewriter, spacing: 1, ghost: { dx: 4, dy: 3, opacity: 0.3 } },
  "gold-foil": { ink: "#3D2A00", accent: "#9C7A1C", rule: "#C9A227", font: FONTS.serif, labelFont: FONTS.serif, spacing: 2 },
};

export interface PrintContext {
  era: EraKey;
  /** "STUDENT ID #0417" */
  studentId: string;
  /** "FALL 1994" */
  semester: string;
  /** "2.56" */
  gpa: string;
  /** REMARKS text per subject, card order. */
  remarks: readonly string[];
}

const escXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function printed(str: string, x: number, y: number, size: number, p: EraPrint, o: { anchor?: string; bold?: boolean; font?: string } = {}): string {
  const font = o.font ?? (o.bold ? p.labelFont : p.font);
  const weight = o.bold && p.labelWeight ? ` font-weight="${p.labelWeight}"` : "";
  const anchor = o.anchor ? ` text-anchor="${o.anchor}"` : "";
  const base = `font-family="${font}" font-size="${size}"${weight}${anchor} letter-spacing="${p.spacing}"`;
  const ghost = p.ghost
    ? `<text x="${x + p.ghost.dx}" y="${y + p.ghost.dy}" ${base} fill="${p.ink}" fill-opacity="${p.ghost.opacity}">${escXml(str)}</text>`
    : "";
  return `${ghost}<text x="${x}" y="${y}" ${base} fill="${p.ink}">${escXml(str)}</text>`;
}

/** Per-token printed text, in card space. */
export function dynamicText(ctx: PrintContext): string {
  const p = ERA_PRINT[ctx.era];
  const z = ZONES.idRow;
  const base = z.y + 62;
  let s = "";
  s += printed(ctx.studentId, z.x + 12, base, 54, p, { bold: true });
  s += printed(ctx.semester, z.x + 930, base, 54, p, { bold: true, anchor: "middle" });
  s += printed(`GPA ${ctx.gpa}`, z.x + z.w - 12, base, 54, p, { bold: true, anchor: "end" });
  // Student ID stub inside the RETURN SIGNED BY MONDAY box (the stamp may cover the top row).
  const rb = ZONES.returnBox;
  s += printed(ctx.studentId, rb.x + rb.w / 2, rb.y + 158, 30, p, { bold: true, anchor: "middle" });
  ctx.remarks.forEach((r, i) => {
    const pos = REMARK_POS[i];
    wrapChars(r.toUpperCase(), 15).slice(0, 2).forEach((line, k) => {
      s += printed(line, pos.x, pos.y + k * 30, 24, p);
    });
  });
  return s;
}

/** Word wrap by character count (printed fonts here are near-monospace). */
function wrapChars(str: string, max: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const w of str.split(/\s+/)) {
    const next = line ? `${line} ${w}` : w;
    if (line && next.length > max) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  return out;
}
