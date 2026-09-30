/**
 * PAPER GROUP — owns 02-Paper and 03-School (+ paper-print.ts for the
 * per-token Student ID / Semester / GPA / REMARKS text).
 *
 * Paper = the cardstock, its shadow, the three-hole punch and the printed
 * form (boxes, labels, rules, RETURN SIGNED BY MONDAY). School = the header
 * (name + motto + crest) in `currentColor`, so it prints in the era's ink.
 */
import { PAPERS, SCHOOLS } from "../copy/traits";
import type { EraKey } from "../copy/types";
import { CARD, GRADE_BOXES, HOLES, SIGNATURE_LINE_Y, ZONES } from "../src/layout";
import {
  art,
  fitText,
  FONTS,
  n,
  blobPath,
  penLine,
  scallopPath,
  starPath,
  svgDoc,
  text,
  type Rng,
} from "./lib";
import { ERA_PRINT, type EraPrint } from "./paper-print";
import type { ArtFile, ArtModule } from "./types";

const SUBJECT_LABELS: [string, string][] = [
  ["BUYING", "THE TOP"],
  ["TAKING", "PROFIT"],
  ["RISK", "MANAGEMENT"],
  ["HOLDING", "BAGS"],
  ["CHASING", "MEMES"],
  ["SELLING", "TOO EARLY"],
];

interface Stock {
  base: string;
  /** Extra art under the printing, clipped to the card. */
  under?: (r: Rng) => string;
  /** Extra art over the printing, clipped to the card. */
  over?: (r: Rng) => string;
  /** Replace the 3-hole punch with tractor-feed strips. */
  tractor?: boolean;
  grain: { color: string; alpha: number };
  footer: string;
  roughBoxes: boolean;
}

const C = CARD;

const STOCKS: Record<EraKey, Stock> = {
  "1994-dot-matrix": {
    base: "#FBFCF4",
    tractor: true,
    grain: { color: "#5A6B4A", alpha: 0.05 },
    roughBoxes: false,
    footer: "FORM RC-44 (REV. 1994) · CONTINUOUS FEED · DO NOT TEAR ALONG PERFORATION UNTIL SIGNED",
    under: () => {
      // Green-bar bands.
      let s = "";
      for (let y = C.y + 40; y < C.y + C.h; y += 128) s += `<rect x="${C.x}" y="${y}" width="${C.w}" height="64" fill="#D7EDCF"/>`;
      return s;
    },
    over: (r) => {
      // Ribbon streaks: faint horizontal smears.
      let s = "";
      for (let i = 0; i < 5; i++) {
        const y = r.int(C.y + 200, C.y + C.h - 200);
        s += `<rect x="${C.x + 140}" y="${y}" width="${C.w - 280}" height="${r.int(2, 5)}" fill="#1E1E24" opacity="0.06"/>`;
      }
      return s;
    },
  },
  "1999-office-laser": {
    base: "#FFFFFF",
    grain: { color: "#808080", alpha: 0.03 },
    roughBoxes: false,
    footer: "FORM RC-44 (REV. 1999) · Y2K COMPLIANT · PRINTED BY THE DISTRICT OFFICE, WHICH IS ALSO THE GYM",
    over: (r) => {
      const x = r.int(C.x + 900, C.x + 1400);
      return `<rect x="${x}" y="${C.y}" width="${r.int(26, 60)}" height="${C.h}" fill="#555" opacity="0.07"/><rect x="${x + 70}" y="${C.y}" width="6" height="${C.h}" fill="#333" opacity="0.08"/>`;
    },
  },
  "1987-carbon": {
    base: "#FFC9D9",
    grain: { color: "#8A2A55", alpha: 0.06 },
    roughBoxes: true,
    footer: "WHITE: PERMANENT RECORD · YELLOW: OFFICE · PINK: PARENT (THIS ONE) · PRESS HARD, YOU ARE MAKING 3 COPIES",
    over: (r) => {
      // Carbon smudges.
      let s = "";
      for (let i = 0; i < 4; i++) {
        const cx = r.int(C.x + 200, C.x + C.w - 200);
        const cy = r.int(C.y + 300, C.y + C.h - 200);
        s += `<ellipse cx="${cx}" cy="${cy}" rx="${r.int(60, 160)}" ry="${r.int(14, 40)}" fill="#1B2A6B" opacity="0.07" transform="rotate(${r.int(-20, 20)} ${cx} ${cy})"/>`;
      }
      return s;
    },
  },
  "2004-inkjet": {
    base: "#FCFBFA",
    grain: { color: "#7A3060", alpha: 0.03 },
    roughBoxes: false,
    footer: "PRINTED 2004 · PRINTER OUT OF CYAN · ALL GREENS ARE NOW BROWN · PLEASE DO NOT PRINT THIS EMAIL",
    under: () => {
      let s = "";
      for (let y = C.y; y < C.y + C.h; y += 36) s += `<rect x="${C.x}" y="${y}" width="${C.w}" height="9" fill="#C0287A" opacity="0.045"/>`;
      return s;
    },
    over: (r) => {
      const y = r.int(C.y + 900, C.y + 1300);
      return `<rect x="${C.x}" y="${y}" width="${C.w}" height="${r.int(30, 60)}" fill="#6A3B20" opacity="0.07"/>`;
    },
  },
  mimeograph: {
    base: "#F3EBD4",
    grain: { color: "#6B3FA0", alpha: 0.05 },
    roughBoxes: true,
    footer: "DUPLICATED ON THE DISTRICT SPIRIT DUPLICATOR · STILL DAMP · DO NOT SNIFF (WE KNOW YOU WILL)",
    over: (r) => {
      // Purple thumbprints.
      let s = "";
      for (let i = 0; i < 3; i++) {
        const cx = r.int(C.x + 150, C.x + C.w - 150);
        const cy = r.pick([C.y + 60, C.y + C.h - 70, r.int(C.y + 400, C.y + 1500)]);
        for (let k = 0; k < 6; k++) {
          s += `<ellipse cx="${cx}" cy="${cy}" rx="${34 - k * 5}" ry="${46 - k * 6}" fill="none" stroke="#6B3FA0" stroke-width="3" opacity="0.18" transform="rotate(${r.int(-30, 30)} ${cx} ${cy})"/>`;
        }
      }
      return s;
    },
  },
  "gold-foil": {
    base: "#FFF3D2",
    grain: { color: "#9C7A1C", alpha: 0.05 },
    roughBoxes: false,
    footer: "CERTIFIED BY THE DISTRICT · GOLD FOIL STOCK · LAST OPENED 1996 · PLEASE FRAME, PLEASE VERIFY",
    over: () => {
      // Guilloche border + inner rule.
      let s = "";
      const inset = 26;
      const x0 = C.x + inset;
      const y0 = C.y + inset;
      const w = C.w - inset * 2;
      const h = C.h - inset * 2;
      s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="#C9A227" stroke-width="10"/>`;
      s += `<rect x="${x0 + 18}" y="${y0 + 18}" width="${w - 36}" height="${h - 36}" fill="none" stroke="#E7C65A" stroke-width="3"/>`;
      // Wavy guilloche band along the border.
      for (let k = 0; k < 3; k++) {
        let d = "";
        const amp = 6 + k * 2;
        const per = 26;
        const path = (xa: number, ya: number, xb: number, yb: number) => {
          const len = Math.hypot(xb - xa, yb - ya);
          const steps = Math.floor(len / 6);
          let p = "";
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const off = Math.sin((t * len) / per * Math.PI * 2 + k) * amp;
            const nx = -(yb - ya) / len;
            const ny = (xb - xa) / len;
            p += `${i === 0 ? "M" : "L"}${n(xa + (xb - xa) * t + nx * off)} ${n(ya + (yb - ya) * t + ny * off)} `;
          }
          return p;
        };
        const m = 9;
        d += path(x0 + m, y0 + m, x0 + w - m, y0 + m);
        d += path(x0 + w - m, y0 + m, x0 + w - m, y0 + h - m);
        d += path(x0 + w - m, y0 + h - m, x0 + m, y0 + h - m);
        d += path(x0 + m, y0 + h - m, x0 + m, y0 + m);
        s += `<path d="${d}" fill="none" stroke="${k === 1 ? "#B8901C" : "#E0B93A"}" stroke-width="2"/>`;
      }
      // Gold seal on the lower-left margin.
      const sx = C.x + 110;
      const sy = C.y + C.h - 250;
      s += `<path d="${scallopPath(sx, sy, 92, 28, 0.08)}" fill="#D4AF37" stroke="#8A6A10" stroke-width="3"/>`;
      s += `<circle cx="${sx}" cy="${sy}" r="66" fill="none" stroke="#FFF1B0" stroke-width="4"/>`;
      s += `<path d="${starPath(sx, sy, 40, 17)}" fill="#FFF1B0"/>`;
      s += `<path d="M${sx - 50} ${sy + 70} l-24 90 l40 -22 l22 36 l20 -96 Z" fill="#B3121B"/><path d="M${sx + 50} ${sy + 70} l24 90 l-40 -22 l-22 36 l-20 -96 Z" fill="#B3121B"/>`;
      return s;
    },
  },
};

/**
 * Cheap, compressible paper texture: big faint blotches (age), a few hundred
 * tiny fibres and a darkened edge. Flat vector shapes, no pixel noise.
 */
function paperTexture(color: string, alpha: number, r: Rng): string {
  let s = "";
  for (let i = 0; i < 14; i++) {
    const rad = r.int(110, 360);
    const cx = r.int(C.x + rad * 1.3, C.x + C.w - rad * 1.3);
    const cy = r.int(C.y + rad * 1.3, C.y + C.h - rad * 1.3);
    s += `<path d="${blobPath(cx, cy, rad, r, 7, 0.5)}" fill="${color}" opacity="${n(alpha * r.float(0.25, 0.55))}"/>`;
  }
  let fib = "";
  for (let i = 0; i < 220; i++) {
    const x = r.int(C.x + 10, C.x + C.w - 10);
    const y = r.int(C.y + 10, C.y + C.h - 10);
    const a = r.float(0, Math.PI);
    const l = r.int(8, 26);
    fib += `M${x} ${y} q${n(Math.cos(a) * l * 0.5 + r.int(-4, 4))} ${n(Math.sin(a) * l * 0.5 + r.int(-4, 4))} ${n(Math.cos(a) * l)} ${n(Math.sin(a) * l)} `;
  }
  s += `<path d="${fib}" fill="none" stroke="${color}" stroke-width="1.6" opacity="${n(Math.min(0.35, alpha * 4))}"/>`;
  s += `<rect x="${C.x + 6}" y="${C.y + 6}" width="${C.w - 12}" height="${C.h - 12}" fill="none" stroke="${color}" stroke-width="12" opacity="${n(alpha * 1.4)}"/>`;
  return s;
}

/** Soft drop shadow from stacked translucent rects (no blur filter). */
export function cardShadow(dx = 26, dy = 34, steps = 9, spread = 5, alpha = 0.055): string {
  let s = "";
  for (let i = 0; i < steps; i++) {
    const g = i * spread;
    s += `<rect x="${C.x + dx - g}" y="${C.y + dy - g}" width="${C.w + g * 2}" height="${C.h + g * 2}" rx="${10 + g}" fill="#000" fill-opacity="${alpha}"/>`;
  }
  return s;
}

function cardPath(tractor: boolean): string {
  const r = 8;
  const { x, y, w, h } = C;
  let d = `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  const hole = (cx: number, cy: number, rr: number) => ` M${cx - rr} ${cy} a${rr} ${rr} 0 1 0 ${rr * 2} 0 a${rr} ${rr} 0 1 0 ${-rr * 2} 0 Z`;
  if (tractor) {
    for (let cy = y + 30; cy < y + h - 10; cy += 50) {
      d += hole(x + 30, cy, 11);
      d += hole(x + w - 30, cy, 11);
    }
  } else {
    for (const hh of HOLES) d += hole(hh.cx, hh.cy, hh.r);
  }
  return d;
}

function paperSvg(era: EraKey): string {
  const st = STOCKS[era];
  const p = ERA_PRINT[era];
  const r = art("paper", era);
  const card = cardPath(!!st.tractor);

  let s = "";
  // Drop shadow (pre-blurred).
  s += cardShadow();
  // Stock.
  s += `<path d="${card}" fill-rule="evenodd" fill="${st.base}"/>`;
  if (st.under) s += st.under(r);
  s += paperTexture(st.grain.color, st.grain.alpha, r);
  if (st.tractor) {
    // Perforation lines beside the tractor strips.
    s += `<path d="M${C.x + 62} ${C.y} V${C.y + C.h} M${C.x + C.w - 62} ${C.y} V${C.y + C.h}" stroke="#8FA88A" stroke-width="3" stroke-dasharray="4 8"/>`;
  } else {
    // Hole reinforcement rings.
    for (const hh of HOLES) s += `<circle cx="${hh.cx}" cy="${hh.cy}" r="${hh.r + 9}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="7"/>`;
  }
  s += printedForm(p, st, r);
  if (st.over) s += st.over(r);
  return svgDoc(s);
}

function label(str: string, x: number, y: number, size: number, p: EraPrint, o: { anchor?: "start" | "middle" | "end"; fill?: string; bold?: boolean } = {}): string {
  const font = o.bold === false ? p.font : p.labelFont;
  const weight = o.bold === false ? undefined : p.labelWeight;
  const fill = o.fill ?? p.ink;
  const ghost = p.ghost ? text(str, x + p.ghost.dx, y + p.ghost.dy, { font, size, weight, fill, anchor: o.anchor, spacing: p.spacing, opacity: p.ghost.opacity }) : "";
  return ghost + text(str, x, y, { font, size, weight, fill, anchor: o.anchor, spacing: p.spacing });
}

function box(x: number, y: number, w: number, h: number, p: EraPrint, st: Stock, r: Rng, width = 3): string {
  if (st.roughBoxes) {
    return `<path d="${penLine(x, y, x + w, y, r, 1.5)} ${penLine(x + w, y, x + w, y + h, r, 1.5).replace("M", "L")} ${penLine(x + w, y + h, x, y + h, r, 1.5).replace("M", "L")} ${penLine(x, y + h, x, y, r, 1.5).replace("M", "L")}" fill="none" stroke="${p.ink}" stroke-width="${width}" stroke-linejoin="round"/>`;
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${p.ink}" stroke-width="${width}"/>`;
}

function printedForm(p: EraPrint, st: Stock, r: Rng): string {
  let s = "";
  const id = ZONES.idRow;
  // ID row rules.
  s += `<rect x="${id.x}" y="${id.y + id.h - 2}" width="${id.w}" height="5" fill="${p.ink}"/>`;
  s += `<rect x="${id.x}" y="${id.y + id.h + 6}" width="${id.w}" height="2" fill="${p.ink}"/>`;
  s += `<rect x="${id.x + 690}" y="${id.y + 6}" width="3" height="${id.h - 14}" fill="${p.ink}" opacity="0.6"/>`;
  s += `<rect x="${id.x + 1170}" y="${id.y + 6}" width="3" height="${id.h - 14}" fill="${p.ink}" opacity="0.6"/>`;
  // Form title under the school header.
  const hz = ZONES.header;
  s += label("OFFICIAL REPORT CARD  ·  REPORT TO PARENTS  ·  NOT A RECEIPT", hz.x, hz.y + hz.h - 6, 26, p, { bold: false });
  s += `<rect x="${hz.x}" y="${hz.y + hz.h + 2}" width="${hz.w}" height="3" fill="${p.ink}"/>`;

  // Grade boxes.
  GRADE_BOXES.forEach((b, i) => {
    s += box(b.x, b.y, b.w, b.h, p, st, r, 4);
    const [l1, l2] = SUBJECT_LABELS[i];
    s += label(l1, b.x + 20, b.y + 50, 40, p);
    s += label(l2, b.x + 20, b.y + 94, 40, p);
    s += label("GRADE", b.x + b.w - 14, b.y + 30, 18, p, { anchor: "end", bold: false });
  });

  // Attendance.
  const a = ZONES.attendance;
  s += label("ATTENDANCE:", a.x + 10, a.y + 60, 44, p);
  s += `<path d="M${a.x + 380} ${a.y + 68} H${a.x + a.w - 10}" stroke="${p.rule}" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>`;

  // Teacher comment.
  const c = ZONES.comment;
  s += box(c.x, c.y, c.w, c.h, p, st, r, 3);
  s += label("TEACHER COMMENT:", c.x + 14, c.y + 40, 32, p);
  for (const y of [c.y + 150, c.y + 245]) s += `<path d="M${c.x + 20} ${y} H${c.x + c.w - 20}" stroke="${p.rule}" stroke-width="2.5" opacity="0.8"/>`;

  // Signature line.
  const sg = ZONES.signature;
  s += `<path d="M${sg.x + 10} ${SIGNATURE_LINE_Y} H${sg.x + sg.w - 10}" stroke="${p.ink}" stroke-width="4"/>`;
  s += label("PARENT / GUARDIAN SIGNATURE", sg.x + 12, SIGNATURE_LINE_Y + 38, 28, p, { bold: false });
  s += label("X", sg.x + 16, SIGNATURE_LINE_Y - 14, 44, p);

  // RETURN SIGNED BY MONDAY.
  const rb = ZONES.returnBox;
  s += `<rect x="${rb.x}" y="${rb.y}" width="${rb.w}" height="${rb.h}" fill="none" stroke="${p.accent}" stroke-width="8"/>`;
  s += `<rect x="${rb.x + 14}" y="${rb.y + 14}" width="${rb.w - 28}" height="${rb.h - 28}" fill="none" stroke="${p.accent}" stroke-width="3"/>`;
  s += label("RETURN SIGNED", rb.x + rb.w / 2, rb.y + 64, 48, p, { anchor: "middle", fill: p.accent });
  s += label("BY MONDAY", rb.x + rb.w / 2, rb.y + 114, 48, p, { anchor: "middle", fill: p.accent });
  s += `<path d="M${rb.x + 30} ${rb.y + 128} H${rb.x + rb.w - 30}" stroke="${p.accent}" stroke-width="2" stroke-dasharray="8 6"/>`;

  // Footer.
  s += label(st.footer, C.x + C.w / 2, C.y + C.h - 14, 17, p, { anchor: "middle", bold: false });
  return s;
}

// ---------------------------------------------------------------------------
// Schools
// ---------------------------------------------------------------------------

type Crest = (cx: number, cy: number) => string;

const CRESTS: Record<string, { font: string; crest: Crest; italicMotto?: boolean }> = {
  "public-46": {
    font: FONTS.slab,
    crest: (cx, cy) =>
      `<rect x="${cx - 62}" y="${cy - 50}" width="124" height="100" fill="none" stroke="currentColor" stroke-width="8"/><text x="${cx}" y="${cy + 30}" font-family="${FONTS.slab}" font-size="78" text-anchor="middle" fill="currentColor">46</text>`,
  },
  "st-satoshi": {
    font: FONTS.serif,
    italicMotto: true,
    crest: (cx, cy) =>
      `<path d="M${cx - 60} ${cy - 62} H${cx + 60} V${cy} Q${cx + 60} ${cy + 55} ${cx} ${cy + 72} Q${cx - 60} ${cy + 55} ${cx - 60} ${cy} Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M${cx - 34} ${cy - 18} L${cx} ${cy + 26} L${cx + 34} ${cy - 18}" fill="none" stroke="currentColor" stroke-width="10"/>`,
  },
  "mt-rugmore": {
    font: FONTS.condensed,
    crest: (cx, cy) =>
      `<path d="M${cx - 80} ${cy + 50} L${cx - 30} ${cy - 40} L${cx} ${cy + 5} L${cx + 30} ${cy - 55} L${cx + 80} ${cy + 50} Z" fill="currentColor"/><path d="M${cx - 90} ${cy + 62} H${cx + 90}" stroke="currentColor" stroke-width="6" stroke-dasharray="14 8"/>`,
  },
  "bagholder-valley": {
    font: FONTS.slab,
    crest: (cx, cy) =>
      `<rect x="${cx - 70}" y="${cy - 25}" width="140" height="80" rx="30" fill="currentColor"/><path d="M${cx - 35} ${cy - 25} Q${cx} ${cy - 80} ${cx + 35} ${cy - 25}" fill="none" stroke="currentColor" stroke-width="10"/><text x="${cx}" y="${cy + 32}" font-family="${FONTS.condensed}" font-size="40" text-anchor="middle" fill="#fff">-80%</text>`,
  },
  "fomo-falls": {
    font: FONTS.condensed,
    crest: (cx, cy) =>
      `<path d="M${cx - 60} ${cy - 60} H${cx + 60} M${cx - 45} ${cy - 55} V${cy + 60} M${cx - 15} ${cy - 55} V${cy + 60} M${cx + 15} ${cy - 55} V${cy + 60} M${cx + 45} ${cy - 55} V${cy + 60}" stroke="currentColor" stroke-width="9" stroke-linecap="round"/><path d="M${cx - 70} ${cy + 64} Q${cx} ${cy + 40} ${cx + 70} ${cy + 64}" fill="none" stroke="currentColor" stroke-width="7"/>`,
  },
  "leverage-heights": {
    font: FONTS.stencil,
    crest: (cx, cy) =>
      `<path d="M${cx - 30} ${cy + 64} V${cy - 64} M${cx + 30} ${cy + 64} V${cy - 64}" stroke="currentColor" stroke-width="9"/>` +
      [-40, -10, 20, 50].map((d) => `<path d="M${cx - 30} ${cy + d} H${cx + 30}" stroke="currentColor" stroke-width="8"/>`).join("") +
      `<text x="${cx + 44}" y="${cy - 36}" font-family="${FONTS.stencil}" font-size="34" fill="currentColor">20x</text>`,
  },
  "paper-hands-prep": {
    font: FONTS.serif,
    italicMotto: true,
    crest: (cx, cy) =>
      `<path d="M${cx - 40} ${cy + 60} V${cy - 10} M${cx - 20} ${cy - 10} V${cy - 60} M${cx} ${cy - 10} V${cy - 70} M${cx + 20} ${cy - 10} V${cy - 60} M${cx + 40} ${cy - 5} V${cy - 40}" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><path d="M${cx - 45} ${cy - 5} H${cx + 45} V${cy + 60} H${cx - 45} Z" fill="currentColor"/>`,
  },
  "summer-school": {
    font: FONTS.slab,
    crest: (cx, cy) =>
      `<circle cx="${cx}" cy="${cy}" r="36" fill="currentColor"/>` +
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return `<path d="M${n(cx + Math.cos(a) * 48)} ${n(cy + Math.sin(a) * 48)} L${n(cx + Math.cos(a) * 70)} ${n(cy + Math.sin(a) * 70)}" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>`;
      }).join(""),
  },
  "exit-liquidity-charter": {
    font: FONTS.condensed,
    crest: (cx, cy) =>
      `<rect x="${cx - 80}" y="${cy - 42}" width="160" height="84" rx="6" fill="currentColor"/><text x="${cx}" y="${cy + 26}" font-family="${FONTS.condensed}" font-size="64" text-anchor="middle" fill="#fff">EXIT</text>`,
  },
  "wen-moon-votech": {
    font: FONTS.stencil,
    crest: (cx, cy) =>
      `<path d="M${cx + 10} ${cy - 62} A62 62 0 1 0 ${cx + 10} ${cy + 62} A48 48 0 1 1 ${cx + 10} ${cy - 62} Z" fill="currentColor"/><path d="M${cx + 20} ${cy + 40} L${cx + 70} ${cy - 10}" stroke="currentColor" stroke-width="12" stroke-linecap="round"/><circle cx="${cx + 74}" cy="${cy - 14}" r="16" fill="none" stroke="currentColor" stroke-width="8"/>`,
  },
  "detention-office": {
    font: FONTS.mono,
    crest: (cx, cy) =>
      `<circle cx="${cx}" cy="${cy}" r="66" fill="none" stroke="currentColor" stroke-width="8"/><path d="M${cx} ${cy} V${cy - 46} M${cx} ${cy} L${cx + 34} ${cy + 14}" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>`,
  },
  "diamond-hands-magnet": {
    font: FONTS.serif,
    italicMotto: true,
    crest: (cx, cy) =>
      `<path d="M${cx - 70} ${cy - 20} L${cx - 40} ${cy - 60} H${cx + 40} L${cx + 70} ${cy - 20} L${cx} ${cy + 66} Z" fill="none" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/><path d="M${cx - 70} ${cy - 20} H${cx + 70} M${cx - 20} ${cy - 60} L${cx - 30} ${cy - 20} L${cx} ${cy + 66} L${cx + 30} ${cy - 20} L${cx + 20} ${cy - 60}" fill="none" stroke="currentColor" stroke-width="5"/>`,
  },
};

function schoolSvg(id: string): string {
  const sc = SCHOOLS.find((s) => s.id === id)!;
  const cfg = CRESTS[id];
  const hz = ZONES.header;
  const nameW = hz.w - 190;
  // One big line if it fits at >= 74px, else two lines (the header is 235px tall).
  const one = fitText(sc.printed, cfg.font, 112, nameW, 1, 74);
  const fit = one.lines.length === 1 && one.size >= 74 ? one : fitText(sc.printed, cfg.font, 70, nameW, 2, 40);
  let s = "";
  const lineH = fit.size * 1.02;
  const top = hz.y + 20;
  const nameBottom = top + fit.lines.length * lineH;
  fit.lines.forEach((l, i) => {
    s += text(l, hz.x, top + (i + 0.82) * lineH, { font: cfg.font, size: fit.size, weight: cfg.font === FONTS.mono ? "bold" : undefined });
  });
  const mottoY = Math.min(nameBottom + 50, hz.y + hz.h - 50);
  s += text(`"${sc.motto}"`, hz.x + 4, mottoY, {
    font: FONTS.serif,
    size: 38,
    style: cfg.italicMotto ? "font-style:italic" : undefined,
  });
  s += `<g>${cfg.crest(hz.x + hz.w - 90, hz.y + 95)}</g>`;
  return svgDoc(s);
}

export const paperGroup: ArtModule = {
  group: "paper",
  owns: ["02-Paper", "03-School"],
  files(): ArtFile[] {
    const out: ArtFile[] = [];
    for (const p of PAPERS) out.push({ layer: "paper", slug: p.id, svg: paperSvg(p.key) });
    for (const s of SCHOOLS) out.push({ layer: "school", slug: s.id, svg: schoolSvg(s.id) });
    return out;
  },
};
