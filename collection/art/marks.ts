/**
 * MARKS GROUP — owns 05-Grades, 06-Attendance, 07-Teacher-Comment,
 * 08-Pen-Marks, 11-Parent-Signature. Everything Harrow (or a parent) wrote
 * on the card by hand.
 *
 * - Grades: one glyph per letter in a GLYPH.w x GLYPH.h viewBox; the
 *   compositor drops it into each subject's slot. Red marker, huge.
 * - Attendance: the typed value inherits the era's ink + font (no
 *   font-family / fill="currentColor"), plus Harrow's red day count.
 * - Anchored pen marks (circled-f, grade-changed, underlined-3x) are drawn
 *   around GRADE_GLYPHS[0]; the compositor moves them to the right slot.
 */
import { COMMENTS } from "../copy/comments";
import { ATTENDANCE, PEN_MARKS, SIGNATURES } from "../copy/traits";
import { gradeSlug, LETTERS } from "../src/catalog";
import {
  ATTENDANCE_VALUE_X,
  COMMENT_TEXT,
  GLYPH,
  GRADE_GLYPHS,
  HOLES,
  PEN_ZONES,
  SIGNATURE_LINE_Y,
  ZONES,
} from "../src/layout";
import {
  art,
  fitText,
  FONTS,
  heartPath,
  measure,
  n,
  penLine,
  splat,
  starPath,
  svgDoc,
  text,
  wobblyPath,
  type Rng,
} from "./lib";
import type { ArtFile, ArtModule } from "./types";

export const RED = "#D3121C";
const RED_DARK = "#9E0B12";
const BLUE_PEN = "#1C3A9E";

// ---------------------------------------------------------------------------
// Grades
// ---------------------------------------------------------------------------

function gradeSvg(letter: string): string {
  const r = art("grade", letter);
  const isI = letter === "I";
  const maxW = GLYPH.w - 20;
  let size = 236;
  const w = measure(letter, FONTS.marker, size);
  if (w > maxW) size = Math.floor((size * maxW) / w);
  const rot = r.float(-7, 3);
  const cx = GLYPH.w / 2 + (isI ? -40 : 0);
  const base = isI ? 168 : 186;
  let s = "";
  // Ink bleed: a darker offset pass under the main stroke.
  s += text(letter, cx + 5, base + 4, { font: FONTS.marker, size, fill: RED_DARK, anchor: "middle", rotate: rot, opacity: 0.55 });
  s += text(letter, cx, base, { font: FONTS.marker, size, fill: RED, anchor: "middle", rotate: rot });
  if (isI) {
    s += text("incomplete", GLYPH.w / 2 + 70, 110, { font: FONTS.harrow, size: 44, fill: RED, anchor: "middle", rotate: -14 });
    s += text("(did not turn in work)", GLYPH.w / 2 + 60, 160, { font: FONTS.harrow, size: 30, fill: RED, anchor: "middle", rotate: -14 });
  }
  return svgDoc(s, { w: GLYPH.w, h: GLYPH.h });
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

const DAYS: Record<string, string> = {
  PERFECT: "44/44",
  EXCELLENT: "38/44",
  SATISFACTORY: "26/44",
  SPOTTY: "12/44",
  "CHRONICALLY ABSENT": "3/44",
  "NEVER SHOWED UP": "0/44",
};
const HARROW_NOTE: Record<string, string> = {
  PERFECT: "never logs off",
  EXCELLENT: "trades in homeroom",
  SATISFACTORY: "body present",
  SPOTTY: "green days only",
  "CHRONICALLY ABSENT": "chart as dr's note?!",
  "NEVER SHOWED UP": "STILL got rugged",
};

function attendanceSvg(key: string, printed: string): string {
  const r = art("attendance", key);
  const z = ZONES.attendance;
  const y = z.y + 62;
  let s = "";
  // Typed value: inherits era ink (currentColor) and era font (no font-family).
  s += text(printed, ATTENDANCE_VALUE_X, y, { font: "", size: 54, spacing: 2 });
  const vw = Math.min(measure(printed, FONTS.mono, 54) + 20, 640);
  const dx = ATTENDANCE_VALUE_X + vw + 40;
  s += text(DAYS[key], dx, y + 4, { font: FONTS.marker, size: 58, fill: RED, rotate: -4 });
  s += text(HARROW_NOTE[key], dx + 190, y - 4, { font: FONTS.harrow, size: 44, fill: RED, rotate: -3 });
  if (key === "PERFECT") s += `<path d="${starPath(dx - 32, y - 60, 30, 13)}" fill="${RED}"/>`;
  if (key === "NEVER SHOWED UP" || key === "CHRONICALLY ABSENT") {
    s += `<path d="${wobblyPath(ellipsePts(dx + 70, y - 18, 100, 50, 18), r, 4, true)}" fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>`;
  }
  return svgDoc(s);
}

function ellipsePts(cx: number, cy: number, rx: number, ry: number, k: number, turns = 1.08, start = -0.4): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= k; i++) {
    const a = start + (i / k) * Math.PI * 2 * turns;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
}

// ---------------------------------------------------------------------------
// Teacher comment
// ---------------------------------------------------------------------------

function commentSvg(id: string, str: string): string {
  const r = art("comment", id);
  const box = COMMENT_TEXT;
  const fit = fitText(str, FONTS.harrow, 88, box.w - 40, 2, 50);
  const baselines = fit.lines.length === 1 ? [box.y + 95] : [box.y + 83, box.y + 178];
  const rot = r.float(-1.6, 0.4);
  let s = `<g transform="rotate(${n(rot)} ${box.x} ${box.y + 100})">`;
  fit.lines.forEach((line, i) => {
    s += text(line, box.x + 10 + i * r.int(0, 18), baselines[i], { font: FONTS.harrow, size: fit.size, fill: RED });
  });
  const last = fit.lines[fit.lines.length - 1];
  const lastW = measure(last, FONTS.harrow, fit.size);
  const sx = Math.min(box.x + 10 + lastW + 40, box.x + box.w - 90);
  s += text("— H.", sx, baselines[baselines.length - 1] + (sx > box.x + box.w - 100 ? 40 : 0), { font: FONTS.harrow, size: Math.round(fit.size * 0.8), fill: RED });
  s += `</g>`;
  return svgDoc(s);
}

// ---------------------------------------------------------------------------
// Pen marks
// ---------------------------------------------------------------------------

const G0 = GRADE_GLYPHS[0];
const G1 = GRADE_GLYPHS[1];

function penMarkSvg(id: string): string {
  const r = art("pen", id);
  const stroke = (d: string, w = 7, color = RED) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const c = ZONES.penCorner;
  let s = "";
  switch (id) {
    case "see-me": {
      const x = c.x + c.w / 2;
      s += text("SEE", x, c.y + 100, { font: FONTS.marker, size: 104, fill: RED, anchor: "middle", rotate: -10 });
      s += text("ME!", x + 10, c.y + 200, { font: FONTS.marker, size: 104, fill: RED, anchor: "middle", rotate: -10 });
      s += stroke(penLine(c.x + 10, c.y + 222, c.x + c.w, c.y + 190, r, 3), 8);
      s += stroke(penLine(c.x + 20, c.y + 240, c.x + c.w + 20, c.y + 206, r, 3), 6);
      break;
    }
    case "underlined-3x": {
      // Anchored under the worst grade (drawn under slot 0).
      const y0 = G0.y + G0.h - 6;
      s += stroke(penLine(G0.x + 20, y0, G0.x + G0.w - 10, y0 - 6, r, 3), 12);
      s += stroke(penLine(G0.x + 10, y0 + 14, G0.x + G0.w, y0 + 8, r, 3), 10);
      s += stroke(penLine(G0.x + 30, y0 + 28, G0.x + G0.w - 30, y0 + 24, r, 4), 6, "#E8606A").replace("stroke-linecap", 'stroke-dasharray="60 9 120 14 400" stroke-linecap');
      break;
    }
    case "question-marks": {
      // Beside Chasing Memes, in the left margin below the middle hole.
      const x = 236;
      const y = HOLES[1].cy + 190;
      s += text("?!?", x, y, { font: FONTS.marker, size: 92, fill: RED, anchor: "middle", rotate: -90 });
      s += `<circle cx="${x + 14}" cy="${y - 150}" r="9" fill="${RED_DARK}"/>`;
      break;
    }
    case "flat-smiley": {
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      s += stroke(wobblyPath(ellipsePts(cx, cy, 92, 88, 22, 1.02), r, 3, false), 8);
      s += `<circle cx="${cx - 32}" cy="${cy - 22}" r="11" fill="${RED}"/><circle cx="${cx + 32}" cy="${cy - 22}" r="11" fill="${RED}"/>`;
      s += stroke(penLine(cx - 45, cy + 38, cx + 45, cy + 38, r, 1), 9);
      break;
    }
    case "circled-f": {
      // Anchored around the first F (drawn around slot 0).
      const cx = G0.x + G0.w / 2;
      const cy = G0.y + G0.h / 2 - 6;
      for (let k = 0; k < 3; k++) {
        s += stroke(wobblyPath(ellipsePts(cx + r.int(-8, 8), cy + r.int(-6, 6), 128 + k * 9, 96 + k * 6, 20, 1.1, r.float(-1, 0)), r, 5), 11 - k * 2);
      }
      // Pen went through: a torn slit.
      s += `<path d="M${cx + 110} ${cy + 62} l40 22 l-8 4 l-38 -20 Z" fill="#2A1A10" fill-opacity="0.75"/>`;
      break;
    }
    case "arrow-why": {
      // From Buying the Top to WHY in the left margin.
      const x0 = G0.x + 20;
      const y0 = G0.y + 110;
      const mx = HOLES[0].cx + 10;
      const my = 760;
      s += stroke(`M${x0} ${y0} C ${x0 - 120} ${y0 + 160}, ${mx + 140} ${my - 160}, ${mx + 30} ${my - 70}`, 10);
      s += stroke(`M${mx + 30} ${my - 70} l6 -50 M${mx + 30} ${my - 70} l46 -20`, 10);
      s += text("WHY", mx + 4, my + 150, { font: FONTS.scratch, size: 62, fill: RED, anchor: "middle", rotate: -90 });
      s += stroke(penLine(mx + 44, my + 10, mx + 44, my + 170, r, 2), 5);
      s += stroke(penLine(mx + 58, my + 14, mx + 58, my + 166, r, 2), 4);
      break;
    }
    case "ngmi": {
      const x = 236;
      const y = HOLES[2].cy - 60;
      s += `<g transform="rotate(-90 ${x} ${y})">`;
      s += text("NGMI", x + 40, y + 26, { font: FONTS.scratch, size: 64, fill: RED, anchor: "middle" });
      s += stroke(wobblyPath([[x - 150, y - 50], [x + 230, y - 50], [x + 230, y + 50], [x - 150, y + 50], [x - 150, y - 50]], r, 4), 5);
      s += `</g>`;
      break;
    }
    case "no-marks":
      break;
    case "grade-changed": {
      // Anchored on an F: the printed B, struck through, initialled.
      const x = G0.x + 40;
      const y = G0.y + G0.h - 16;
      s += text("B", x, y, { font: FONTS.slab, size: 64, fill: "#2B2B2B", anchor: "middle", opacity: 0.8 });
      s += stroke(penLine(x - 40, y - 10, x + 40, y - 40, r, 1), 8);
      s += text("H.", x + 40, y + 2, { font: FONTS.harrow, size: 40, fill: RED });
      break;
    }
    case "pen-exploded": {
      const pz = PEN_ZONES.commentRight;
      const cx = pz.x + pz.w / 2;
      const cy = pz.y + pz.h / 2;
      s += splat(cx, cy, 78, r, RED, 0.92, 18);
      for (let i = 0; i < 4; i++) {
        const dx = cx + r.int(-60, 60);
        s += `<path d="M${dx} ${cy + 40} q ${r.int(-6, 6)} ${r.int(80, 160)} ${r.int(-4, 4)} ${r.int(160, 240)}" stroke="${RED}" stroke-width="${r.int(6, 12)}" stroke-linecap="round" fill="none"/>`;
      }
      s += `<path d="M${cx - 20} ${cy - 20} l34 -10 l8 24 l-34 10 Z" fill="#1A1A1A"/><path d="M${cx + 20} ${cy - 30} l40 -14" stroke="#1A1A1A" stroke-width="6"/>`;
      break;
    }
    case "gold-star": {
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      s += `<path d="${starPath(cx + 6, cy + 8, 104, 44, 5, -80)}" fill="#000" fill-opacity="0.18"/>`;
      s += `<path d="${starPath(cx, cy, 104, 44, 5, -80)}" fill="#E8B923" stroke="#A6800F" stroke-width="5" stroke-linejoin="round"/>`;
      s += `<path d="${starPath(cx - 8, cy - 8, 60, 24, 5, -80)}" fill="#FFE36E"/>`;
      s += text("?", cx + 110, cy - 50, { font: FONTS.harrow, size: 70, fill: RED });
      break;
    }
    case "hearts": {
      // Around the Taking Profit A+ (slot 1).
      const pts: [number, number, number][] = [
        [G1.x + 20, G1.y + 30, 26],
        [G1.x + G1.w - 20, G1.y + 24, 30],
        [G1.x + 10, G1.y + G1.h - 20, 24],
        [G1.x + G1.w - 10, G1.y + G1.h - 26, 28],
      ];
      for (const [x, y, sz] of pts) s += `<path d="${heartPath(x, y, sz)}" fill="none" stroke="${RED}" stroke-width="6" stroke-linejoin="round"/>`;
      break;
    }
    default:
      throw new Error(`no pen mark art for ${id}`);
  }
  return svgDoc(s);
}

// ---------------------------------------------------------------------------
// Parent signature
// ---------------------------------------------------------------------------

function signatureSvg(id: string): string {
  const r = art("signature", id);
  const z = ZONES.signature;
  const L = SIGNATURE_LINE_Y;
  const x0 = z.x + 90;
  let s = "";
  const cursive = (str: string, x: number, y: number, size: number, fill: string, rot = -4) =>
    text(str, x, y, { font: FONTS.cursive, size, fill, rotate: rot });
  switch (id) {
    case "mom-cursive":
      s += cursive("M. Parent", x0, L - 26, 78, BLUE_PEN, -5);
      s += `<path d="M${x0 + 560} ${L - 50} C ${x0 + 700} ${L - 20}, ${x0 + 760} ${L - 60}, ${x0 + 840} ${L - 40}" fill="none" stroke="${BLUE_PEN}" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case "dad-illegible": {
      const pts: [number, number][] = [];
      for (let i = 0; i < 26; i++) pts.push([x0 + i * 26, L - 30 + (i % 2 === 0 ? -r.int(40, 90) : r.int(0, 20))]);
      s += `<path d="${wobblyPath(pts, r, 8)}" fill="none" stroke="#111" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<path d="M${x0 - 10} ${L - 12} L${x0 + 720} ${L - 28}" stroke="#111" stroke-width="6" stroke-linecap="round"/>`;
      break;
    }
    case "forged-poorly":
      s += text("Mom Parent (signiture)", x0, L - 26, { font: FONTS.kidPrint, size: 64, fill: BLUE_PEN, rotate: -2 });
      s += rocketIcon(x0 + 684, L - 108, 0.5, BLUE_PEN);
      s += `<rect x="${x0 - 10}" y="${L - 100}" width="300" height="70" fill="#FFFFFF" fill-opacity="0.35"/>`;
      break;
    case "unsigned":
      s += text("pending", x0 + 520, L - 20, { font: FONTS.kid, size: 44, fill: "#666", rotate: -3 });
      s += text("(confirmation)", x0 + 520, L + 26, { font: FONTS.kid, size: 30, fill: "#777", rotate: -3 });
      break;
    case "forged-crayon": {
      s += `<g transform="translate(${x0 + 150} ${L - 20}) scale(-1 1)">${text("M", 0, 0, { font: FONTS.kidPrint, size: 150, fill: "#1FA83A", anchor: "middle", stroke: "#1FA83A", strokeWidth: 5, extra: { "stroke-dasharray": "3 5" } })}</g>`;
      s += text("OM", x0 + 220, L - 20, { font: FONTS.kidPrint, size: 150, fill: "#1FA83A", stroke: "#1FA83A", strokeWidth: 5, extra: { "stroke-dasharray": "3 5" } });
      break;
    }
    case "grandma":
      s += cursive("Grandma", x0, L - 30, 70, "#5A2A7A", -2);
      s += text("What is a meme coin and why", x0 + 480, L - 120, { font: FONTS.harrow, size: 34, fill: "#5A2A7A", rotate: -3 });
      s += text("is it on a report card? -G", x0 + 480, L - 84, { font: FONTS.harrow, size: 34, fill: "#5A2A7A", rotate: -3 });
      break;
    case "parent-also-down":
      s += cursive("D. Parent", x0, L - 26, 64, "#222", -3);
      s += text("we'll talk about this later...", x0 + 430, L - 70, { font: FONTS.harrow, size: 40, fill: "#222", rotate: -2 });
      s += `<rect x="${x0 + 800}" y="${L - 150}" width="22" height="90" fill="${RED}"/><path d="M${x0 + 811} ${L - 175} V${L - 40}" stroke="${RED}" stroke-width="4"/>`;
      break;
    case "signed-3am":
      s += cursive("P. Parent", x0, L - 26, 70, BLUE_PEN, -6);
      s += text("3:12 AM", x0 + 560, L - 40, { font: FONTS.marker, size: 52, fill: "#222", rotate: -4 });
      s += splat(x0 + 520, L - 110, 22, r, "#5B3A1E", 0.6, 4);
      break;
    case "paw-print": {
      const cx = x0 + 280;
      const cy = L - 60;
      const mud = "#6B4423";
      s += `<ellipse cx="${cx}" cy="${cy + 20}" rx="58" ry="48" fill="${mud}"/>`;
      for (const [dx, dy] of [[-62, -48], [-22, -78], [24, -78], [64, -48]]) s += `<ellipse cx="${cx + dx}" cy="${cy + dy}" rx="20" ry="26" fill="${mud}"/>`;
      s += splat(cx + 140, cy + 30, 14, r, mud, 0.8, 5);
      break;
    }
    case "just-gm":
      s += cursive("gm", x0 + 60, L - 22, 110, "#222", -6);
      break;
    case "group-chat": {
      const inks = ["#1C3A9E", "#111", "#1FA83A", "#B0105A", "#6B3FA0", "#C4161C"];
      const words = ["ser", "hold", "wagmi", "fine", "gm", "this is fine", "hodl", "wen", "lfg", "not selling", "ser pls", "zoom out", "dyor", "few", "up only", "gn", "dip"];
      words.forEach((w, i) => {
        const x = z.x + 30 + (i % 6) * 150 + r.int(-20, 20);
        const y = z.y + 40 + Math.floor(i / 6) * 58 + r.int(-8, 8);
        s += text(w, x, y, { font: r.pick([FONTS.cursive, FONTS.kid, FONTS.harrow, FONTS.kidPrint]), size: r.int(30, 42), fill: r.pick(inks), rotate: r.int(-12, 8) });
      });
      break;
    }
    case "both-parents":
      s += cursive("M. Parent", x0 - 40, L - 26, 58, BLUE_PEN, -4);
      s += cursive("D. Parent", x0 + 520, L - 20, 58, "#111", -2);
      break;
    default:
      throw new Error(`no signature art for ${id}`);
  }
  return svgDoc(s);
}

function rocketIcon(x: number, y: number, k: number, color: string): string {
  return `<g transform="translate(${x} ${y}) scale(${k}) rotate(35)"><path d="M0 -60 C 24 -30, 24 20, 14 40 H -14 C -24 20, -24 -30, 0 -60 Z" fill="none" stroke="${color}" stroke-width="7"/><path d="M-14 30 L-30 52 L-12 44 M14 30 L30 52 L12 44" fill="none" stroke="${color}" stroke-width="6"/><path d="M-8 48 L0 76 L8 48" fill="none" stroke="${color}" stroke-width="6"/></g>`;
}

export const marksGroup: ArtModule = {
  group: "marks",
  owns: ["05-Grades", "06-Attendance", "07-Teacher-Comment", "08-Pen-Marks", "11-Parent-Signature"],
  files(): ArtFile[] {
    const out: ArtFile[] = [];
    for (const g of LETTERS) out.push({ layer: "grades", slug: gradeSlug(g), svg: gradeSvg(g) });
    for (const a of ATTENDANCE) out.push({ layer: "attendance", slug: a.id, svg: attendanceSvg(a.key, a.printed) });
    for (const c of COMMENTS) out.push({ layer: "comment", slug: c.id, svg: commentSvg(c.id, c.text) });
    for (const p of PEN_MARKS) out.push({ layer: "penMarks", slug: p.id, svg: penMarkSvg(p.id) });
    for (const sg of SIGNATURES) out.push({ layer: "signature", slug: sg.id, svg: signatureSvg(sg.id) });
    return out;
  },
};

export type { Rng };
