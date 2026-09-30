/**
 * ATTACHMENTS GROUP — owns 09-Doodle, 12-Incident, 13-Status.
 *
 * - Status stamps are the top layer and the loudest thing on the card:
 *   centred on STAMP.center over the header, huge, translucent ink so the
 *   header shows through. EXPELLED alone slams diagonally across the card.
 * - Incident paperwork is taped / stapled / clipped in INCIDENT_ZONES and
 *   may hang off the card onto the background.
 * - Doodles are the student's ballpoint in doodle zones A (right column)
 *   and B (footer).
 */
import { DOODLES, INCIDENTS, STATUSES } from "../copy/traits";
import type { IncidentValue } from "../copy/types";
import { CARD, INCIDENT_ZONES, STAMP, ZONES } from "../src/layout";
import {
  art,
  FONTS,
  measure,
  n,
  penLine,
  scallopPath,
  starPath,
  svgDoc,
  text,
  wobblyPath,
  type Rng,
} from "./lib";
import type { ArtFile, ArtModule } from "./types";

const INK = "#2340B5";

// ---------------------------------------------------------------------------
// Status stamps
// ---------------------------------------------------------------------------

/** Rough, gappy stamp border (rubber stamps never print evenly). */
function stampBorder(x: number, y: number, w: number, h: number, color: string, width: number, r: Rng, rx = 18): string {
  const d = `M${x + rx} ${y} H${x + w - rx} Q${x + w} ${y} ${x + w} ${y + rx} V${y + h - rx} Q${x + w} ${y + h} ${x + w - rx} ${y + h} H${x + rx} Q${x} ${y + h} ${x} ${y + h - rx} V${y + rx} Q${x} ${y} ${x + rx} ${y} Z`;
  const gaps: number[] = [];
  let total = 0;
  const per = 2 * (w + h);
  while (total < per) {
    const on = r.int(80, 420);
    const off = r.int(4, 18);
    gaps.push(on, off);
    total += on + off;
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-dasharray="${gaps.join(" ")}"/>`;
}

/** Specks of ink around a stamp. */
function specks(cx: number, cy: number, w: number, h: number, color: string, r: Rng, count = 26): string {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = cx + r.float(-w / 2, w / 2);
    const y = cy + r.float(-h / 2, h / 2);
    s += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r.float(2, 7))}" fill="${color}" fill-opacity="0.7"/>`;
  }
  return s;
}

function stampText(str: string, x: number, y: number, size: number, color: string, o: { anchor?: "start" | "middle" | "end"; font?: string; opacity?: number; heavy?: boolean } = {}) {
  // Heavy stamp letters: same-colour stroke fattens Rubik Dirt so it reads at 300px.
  const heavy = o.heavy ?? (o.font === undefined || o.font === FONTS.stamp);
  return text(str, x, y, {
    font: o.font ?? FONTS.stamp,
    size,
    fill: color,
    anchor: o.anchor ?? "middle",
    opacity: o.opacity ?? 0.93,
    stroke: heavy ? color : undefined,
    strokeWidth: heavy ? Math.max(3, Math.round(size / 26)) : undefined,
  });
}

/** Largest font size <= max at which `str` fits `w`. */
function fitSize(str: string, font: string, max: number, w: number): number {
  const m = measure(str, font, max);
  return m <= w ? max : Math.floor((max * w) / m);
}

/** Translucent ink wash inside a stamp so it reads as one block over the header. */
/**
 * Stamp backing: a paper-white knockout (hides the busy header underneath so
 * the stamp reads at 300px) plus a translucent ink wash in the stamp colour.
 */
const wash = (x: number, y: number, w: number, h: number, color: string, rx = 18, a = 0.16, knockout = 0.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#FFFDF5" fill-opacity="${knockout}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}" fill-opacity="${a}"/>`;

function statusSvg(id: string): string {
  const st = STATUSES.find((s) => s.id === id)!;
  const r = art("status", id);
  const { x: cx, y: cy } = STAMP.center;
  let s = "";
  const g = (rot: number, body: string, ox: number = cx, oy: number = cy) => `<g transform="rotate(${rot} ${ox} ${oy})">${body}</g>`;
  switch (id) {
    case "needs-improvement": {
      const c = "#FF5A00";
      const w = 1620;
      const h = 360;
      let b = wash(cx - w / 2, cy - h / 2, w, h, c);
      b += stampBorder(cx - w / 2, cy - h / 2, w, h, c, 28, r) + stampBorder(cx - w / 2 + 40, cy - h / 2 + 40, w - 80, h - 80, c, 10, r, 8);
      b += stampText("NEEDS", cx, cy - 14, fitSize("NEEDS", FONTS.stamp, 140, w - 160), c);
      b += stampText("IMPROVEMENT", cx, cy + 122, fitSize("IMPROVEMENT", FONTS.stamp, 140, w - 160), c);
      b += stampText(st.subtext, cx, cy - h / 2 - 22, 52, c, { font: FONTS.condensed });
      b += specks(cx, cy, w + 100, h + 80, c, r);
      s += g(-7, b);
      break;
    }
    case "academic-probation": {
      const c = "#E0102A";
      const w = 1520;
      const h = 390;
      let b = wash(cx - w / 2, cy - h / 2, w, h, c, 6);
      b += stampBorder(cx - w / 2, cy - h / 2, w, h, c, 32, r, 6) + stampBorder(cx - w / 2 + 46, cy - h / 2 + 46, w - 92, h - 92, c, 12, r, 4);
      b += stampText("ACADEMIC", cx, cy - 12, fitSize("ACADEMIC", FONTS.stamp, 160, w - 180), c);
      b += stampText("PROBATION", cx, cy + 138, fitSize("PROBATION", FONTS.stamp, 160, w - 180), c);
      b += stampText(st.subtext, cx, cy - h / 2 - 22, 46, c, { font: FONTS.condensed });
      b += specks(cx, cy, w + 80, h + 80, c, r);
      s += g(-5, b);
      break;
    }
    case "held-back": {
      const c = "#7B2CFF";
      const w = 1560;
      const h = 400;
      let b = wash(cx - w / 2, cy - h / 2, w, h, c, 200);
      b += stampBorder(cx - w / 2, cy - h / 2, w, h, c, 28, r, 200);
      b += stampText("HELD BACK", cx + 110, cy + 80, fitSize("HELD BACK", FONTS.stamp, 260, w - 470), c);
      // Loop-back arrow.
      const ax = cx - w / 2 + 210;
      b += `<path d="M${ax + 90} ${cy - 50} A 110 110 0 1 0 ${ax + 70} ${cy + 90}" fill="none" stroke="${c}" stroke-width="38" stroke-linecap="round" stroke-opacity="0.93"/>`;
      b += `<path d="M${ax + 30} ${cy + 30} l90 80 l-120 26 Z" fill="${c}" fill-opacity="0.93"/>`;
      b += stampText(st.subtext, cx + 110, cy + 158, 50, c, { font: FONTS.condensed });
      b += specks(cx, cy, w, h + 60, c, r);
      s += g(4, b);
      break;
    }
    case "exit-liquidity": {
      const c = "#FF1F8E";
      const w = 1640;
      const h = 410;
      const para = `M${cx - w / 2} ${cy - h / 2 + 30} L${cx + w / 2} ${cy - h / 2} L${cx + w / 2 - 40} ${cy + h / 2 - 20} L${cx - w / 2 + 30} ${cy + h / 2} Z`;
      let b = `<path d="${para}" fill="#FFFDF5" fill-opacity="0.62"/>`;
      b += `<path d="${para}" fill="${c}" fill-opacity="0.2" stroke="${c}" stroke-width="22" stroke-opacity="0.93"/>`;
      b += stampText("MOST LIKELY TO BECOME", cx, cy - 84, fitSize("MOST LIKELY TO BECOME", FONTS.stamp, 104, w - 280), c);
      b += stampText("EXIT LIQUIDITY", cx, cy + 96, fitSize("EXIT LIQUIDITY", FONTS.stamp, 205, w - 200), c);
      b += stampText(st.subtext, cx, cy + 162, 42, c, { font: FONTS.condensed });
      for (const sx of [cx - w / 2 + 10, cx + w / 2 - 10]) b += `<path d="${starPath(sx, cy - 150, 84, 32, 8)}" fill="${c}" fill-opacity="0.93"/>`;
      b += specks(cx, cy, w, h, c, r, 20);
      s += g(-4, b);
      break;
    }
    case "suspended": {
      const w = 1560;
      const h = 400;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2;
      // Hazard ring: black stroke with a dashed yellow stroke on top (no clip paths: they are slow).
      let b = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="#FFD400" fill-opacity="0.9"/>`;
      b += `<rect x="${x0 + 24}" y="${y0 + 24}" width="${w - 48}" height="${h - 48}" fill="none" stroke="#111" stroke-width="48"/>`;
      b += `<rect x="${x0 + 24}" y="${y0 + 24}" width="${w - 48}" height="${h - 48}" fill="none" stroke="#FFD400" stroke-width="48" stroke-dasharray="50 50"/>`;
      b += stampText("SUSPENDED", cx, cy + 66, fitSize("SUSPENDED", FONTS.stamp, 240, w - 170), "#111", { opacity: 0.96 });
      b += stampText(st.subtext, cx, cy + 140, 46, "#111", { font: FONTS.condensed, opacity: 0.96 });
      s += g(-9, b);
      break;
    }
    case "expelled": {
      // The one stamp that slams across the whole card.
      const c = "#E3122B";
      const ox = 1000;
      const oy = 980;
      const w = 1760;
      const h = 480;
      let b = wash(ox - w / 2, oy - h / 2, w, h, c, 12, 0.12, 0.22);
      b += stampBorder(ox - w / 2, oy - h / 2, w, h, c, 40, r, 12);
      b += stampText("EXPELLED", ox, oy + 118, fitSize("EXPELLED", FONTS.stamp, 360, w - 140), c, { opacity: 0.84 });
      b += stampText(st.subtext, ox, oy - 160, 58, c, { font: FONTS.condensed, opacity: 0.88 });
      for (let i = 0; i < 6; i++) {
        const x = ox + r.int(-w / 2 + 100, w / 2 - 100);
        b += `<path d="${penLine(x, oy - 130, x + r.int(-40, 40), oy + 140, r, 10, 5)}" stroke="#FFFFFF" stroke-width="6" stroke-opacity="0.55" fill="none"/>`;
      }
      b += specks(ox, oy, w + 200, h + 200, c, r, 40);
      s += g(-24, b, ox, oy);
      break;
    }
    case "honor-roll": {
      const green = "#0B9C4E";
      const gold = "#FFC400";
      const sx = cx - 560;
      const sy = cy - 10;
      let b = wash(cx - 800, cy - 200, 1600, 400, green, 30, 0.12);
      b += `<path d="${scallopPath(sx, sy, 200, 36, 0.07)}" fill="${gold}" fill-opacity="0.95" stroke="${green}" stroke-width="12"/>`;
      b += `<circle cx="${sx}" cy="${sy}" r="142" fill="none" stroke="${green}" stroke-width="12"/>`;
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (0.62 + i * 0.09);
        for (const side of [-1, 1]) {
          const x = sx + side * Math.cos(a) * -118;
          const y = sy - Math.sin(a) * -118 + 10;
          b += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="26" ry="11" fill="${green}" transform="rotate(${n(side * (i * 12 - 40))} ${n(x)} ${n(y)})"/>`;
        }
      }
      b += `<path d="${starPath(sx, sy - 10, 70, 30)}" fill="${green}"/>`;
      b += `<path d="M${sx - 150} ${sy + 110} l-70 90 l60 -8 l20 56 l60 -100 Z M${sx + 150} ${sy + 110} l70 90 l-60 -8 l-20 56 l-60 -100 Z" fill="${green}" fill-opacity="0.93"/>`;
      b += stampText("HONOR", cx + 235, cy - 22, 180, green);
      b += stampText("ROLL", cx + 235, cy + 146, 180, green);
      b += stampText(st.subtext, cx + 235, cy - 216, 44, green, { font: FONTS.condensed });
      s += g(-6, b);
      break;
    }
    case "valedictorian": {
      const defs = `<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3A0"/><stop offset="0.45" stop-color="#E0B021"/><stop offset="0.7" stop-color="#FFE680"/><stop offset="1" stop-color="#A67C00"/></linearGradient>`;
      let b = "";
      const sx = cx - 520;
      const sy = cy - 10;
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        b += `<path d="M${n(sx + Math.cos(a) * 200)} ${n(sy + Math.sin(a) * 200)} L${n(sx + Math.cos(a + 0.05) * 330)} ${n(sy + Math.sin(a + 0.05) * 330)} L${n(sx + Math.cos(a + 0.1) * 200)} ${n(sy + Math.sin(a + 0.1) * 200)} Z" fill="#FFD84A" fill-opacity="0.55"/>`;
      }
      b += `<path d="${scallopPath(sx, sy, 205, 40, 0.06)}" fill="url(#gold)" stroke="#8A6400" stroke-width="8"/>`;
      b += `<circle cx="${sx}" cy="${sy}" r="155" fill="none" stroke="#8A6400" stroke-width="6"/>`;
      b += `<path d="M${sx - 110} ${sy - 30} L${sx} ${sy - 85} L${sx + 110} ${sy - 30} L${sx} ${sy + 25} Z" fill="#1A1A1A"/><path d="M${sx - 64} ${sy} V${sy + 56} Q${sx} ${sy + 92} ${sx + 64} ${sy + 56} V${sy}" fill="#1A1A1A"/><path d="M${sx + 100} ${sy - 30} V${sy + 66}" stroke="#FFD84A" stroke-width="8"/><circle cx="${sx + 100}" cy="${sy + 74}" r="12" fill="#FFD84A"/>`;
      b += wash(cx - 320, cy - 170, 1140, 330, "#FFD84A", 30, 0.35, 0.7);
      b += text("VALEDICTORIAN", cx + 250, cy + 44, { font: FONTS.serif, size: fitSize("VALEDICTORIAN", FONTS.serif, 190, 1090), fill: "#7A5200", anchor: "middle", stroke: "#FFE680", strokeWidth: 3 });
      b += text(st.subtext, cx + 250, cy + 124, { font: FONTS.condensed, size: 60, fill: "#5A3D00", anchor: "middle" });
      return svgDoc(g(-3, b), { defs });
    }
    default:
      throw new Error(`no stamp for ${id}`);
  }
  return svgDoc(s);
}

// ---------------------------------------------------------------------------
// Incidents
// ---------------------------------------------------------------------------

function slipLines(lines: readonly string[], x: number, y: number, w: number, size: number, color: string, font: string = FONTS.typewriter, lh = 1.35): string {
  let s = "";
  let yy = y;
  for (const l of lines) {
    const sz = fitSize(l, font, size, w);
    s += text(l, x, yy, { font, size: sz, fill: color });
    yy += size * lh;
  }
  return s;
}

function tape(x: number, y: number, w: number, h: number, rot: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F4E9C8" fill-opacity="0.75" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`;
}

function paperClip(x: number, y: number, rot: number, k = 1): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0 0 V120 A24 24 0 0 0 48 120 V20 A16 16 0 0 0 16 20 V110" fill="none" stroke="#9AA3AD" stroke-width="9" stroke-linecap="round"/></g>`;
}

function incidentSvg(id: string): string {
  const inc: IncidentValue = INCIDENTS.find((i) => i.id === id)!;
  const r = art("incident", id);
  const slip = inc.slip;
  let s = "";
  const shadow = (x: number, y: number, w: number, h: number, rot: number) =>
    `<rect x="${x + 14}" y="${y + 18}" width="${w}" height="${h}" fill="#000" fill-opacity="0.22" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`;
  switch (id) {
    case "none":
      return svgDoc("");
    case "nurse-pass": {
      const z = INCIDENT_ZONES.lowerRight;
      const w = 580;
      const h = 330;
      const x = z.x + 150;
      const y = z.y + 30;
      const rot = 7;
      s += shadow(x, y, w, h, rot);
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#CFF5E4" stroke="#7CC9A8" stroke-width="4"/>`;
      b += `<rect x="${x + 24}" y="${y + 26}" width="70" height="70" fill="#E3122B"/><rect x="${x + 46}" y="${y + 36}" width="26" height="50" fill="#fff"/><rect x="${x + 34}" y="${y + 48}" width="50" height="26" fill="#fff"/>`;
      b += text(slip!.heading, x + 112, y + 76, { font: FONTS.condensed, size: 50, fill: "#1B4D3A" });
      b += slipLines(slip!.lines, x + 26, y + 150, w - 50, 28, "#1B3A5C");
      b += text("RUGGED", x + w - 150, y + h - 40, { font: FONTS.stamp, size: 56, fill: "#E3122B", anchor: "middle", rotate: -12, opacity: 0.85 });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      s += tape(x - 30, y - 20, 170, 56, -30) + tape(x + w - 110, y + h - 30, 170, 56, -24);
      break;
    }
    case "disciplinary-referral": {
      const z = INCIDENT_ZONES.topLeftCorner;
      const w = 560;
      const h = 380;
      const x = z.x + 10;
      const y = z.y + 30;
      const rot = -8;
      s += shadow(x, y, w, h, rot);
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFE45C"/>`;
      for (let i = 0; i < 4; i++) b += `<path d="${penLine(x + r.int(0, w), y, x + r.int(0, w), y + h, r, 12, 3)}" stroke="#C9A800" stroke-width="3" fill="none"/>`;
      b += text(slip!.heading, x + w / 2, y + 70, { font: FONTS.condensed, size: 52, fill: "#3A2A00", anchor: "middle" });
      b += `<rect x="${x + 30}" y="${y + 90}" width="${w - 60}" height="4" fill="#3A2A00"/>`;
      b += slipLines(slip!.lines, x + 30, y + 150, w - 60, 30, "#2B2200");
      b += text("FIGHT IN CAFETERIA", x + w / 2, y + h - 20, { font: FONTS.stamp, size: 46, fill: "#D3121C", anchor: "middle", rotate: -4, opacity: 0.85 });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      // Fat staple.
      s += `<g transform="rotate(-35 ${x + 440} ${y + 330})"><rect x="${x + 390}" y="${y + 320}" width="120" height="16" rx="6" fill="#B8C0C8" stroke="#6E7780" stroke-width="3"/></g>`;
      break;
    }
    case "hall-pass": {
      const z = INCIDENT_ZONES.topEdge;
      const x = z.x + 160;
      const y = z.y + 40;
      const w = 820;
      const h = 170;
      const rot = -4;
      s += shadow(x, y, w, h, rot);
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="60" fill="#C68B4E" stroke="#8A5A2B" stroke-width="6"/>`;
      for (let i = 0; i < 6; i++) b += `<path d="${penLine(x + 40, y + 30 + i * 22, x + w - 40, y + 26 + i * 24, r, 4)}" stroke="#A8703A" stroke-width="4" fill="none"/>`;
      b += `<circle cx="${x + 70}" cy="${y + h / 2}" r="22" fill="#3A2410"/>`;
      b += text("HALL PASS", x + w / 2 + 40, y + 118, { font: FONTS.stencil, size: 100, fill: "#4A2A10", anchor: "middle" });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      s += `<path d="M${x + 60} ${y + 90} C ${x - 80} ${y + 200}, ${x - 40} ${y + 360}, ${x - 120} ${y + 420}" stroke="#E8E0CC" stroke-width="7" fill="none"/>`;
      // Tag with the slip text.
      const tx = x + w - 40;
      const ty = y + 150;
      s += `<g transform="rotate(8 ${tx} ${ty})"><rect x="${tx}" y="${ty}" width="330" height="190" fill="#FFFDF2" stroke="#999" stroke-width="3"/>${slipLines(slip!.lines, tx + 16, ty + 40, 300, 26, "#222", FONTS.kid, 1.3)}</g>`;
      break;
    }
    case "confiscated-note": {
      const z = INCIDENT_ZONES.rightEdge;
      const x = z.x + 30;
      const y = z.y + 70;
      const w = 330;
      const h = 400;
      const rot = 10;
      s += shadow(x, y, w, h, rot);
      let b = `<path d="M${x} ${y} H${x + w} V${y + h} H${x} Z" fill="#FFFFFF"/><path d="M${x + w} ${y} L${x + w - 110} ${y + 110} L${x + w} ${y + 110} Z" fill="#E6E6E6"/>`;
      for (let yy = y + 50; yy < y + h; yy += 40) b += `<path d="M${x} ${yy} H${x + w}" stroke="#9EC5FF" stroke-width="3"/>`;
      b += `<path d="M${x + 44} ${y} V${y + h}" stroke="#FF8FA3" stroke-width="3"/>`;
      b += slipLines(slip!.lines, x + 56, y + 84, w - 70, 36, INK, FONTS.kid, 1.12);
      b += text("CONFISCATED", x + w / 2 + 6, y + h - 60, { font: FONTS.stamp, size: 50, fill: "#D3121C", anchor: "middle", rotate: -16, opacity: 0.85 });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      s += paperClip(x + 40, y - 40, 8, 1.1);
      break;
    }
    case "gifted-sticker": {
      const z = INCIDENT_ZONES.topRightCorner;
      const cx = z.x + z.w / 2 + 20;
      const cy = z.y + z.h / 2 - 10;
      const defs = `<radialGradient id="shine" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#FFF6B0"/><stop offset="0.5" stop-color="#F2C12E"/><stop offset="1" stop-color="#B8860B"/></radialGradient>`;
      s += `<path d="${scallopPath(cx + 12, cy + 16, 215, 30, 0.06)}" fill="#000" fill-opacity="0.25"/>`;
      s += `<path d="${scallopPath(cx, cy, 215, 30, 0.06)}" fill="url(#shine)" stroke="#8A6400" stroke-width="6"/>`;
      s += `<circle cx="${cx}" cy="${cy}" r="160" fill="none" stroke="#8A6400" stroke-width="5"/>`;
      // Tiny whale.
      s += `<path d="M${cx - 90} ${cy + 20} C ${cx - 90} ${cy - 50}, ${cx + 60} ${cy - 60}, ${cx + 80} ${cy + 10} C ${cx + 110} ${cy - 10}, ${cx + 130} ${cy - 30}, ${cx + 120} ${cy + 20} C ${cx + 110} ${cy + 40}, ${cx + 60} ${cy + 60}, ${cx - 40} ${cy + 60} C ${cx - 80} ${cy + 60}, ${cx - 90} ${cy + 40}, ${cx - 90} ${cy + 20} Z" fill="#1E5AA8"/><circle cx="${cx - 40}" cy="${cy + 6}" r="7" fill="#fff"/><path d="M${cx - 20} ${cy - 50} q -10 -40 -30 -50 M${cx - 20} ${cy - 50} q 10 -40 30 -50" stroke="#1E5AA8" stroke-width="7" fill="none"/>`;
      s += text("GIFTED & TALENTED", cx, cy - 92, { font: FONTS.condensed, size: 44, fill: "#5A3D00", anchor: "middle" });
      s += text("WHALE DIVISION", cx, cy + 112, { font: FONTS.condensed, size: 40, fill: "#5A3D00", anchor: "middle" });
      s += text("PARENTS: HIDE YOUR WALLETS", cx, cy + 148, { font: FONTS.condensed, size: 22, fill: "#5A3D00", anchor: "middle" });
      return svgDoc(s, { defs });
    }
    case "lunch-iou": {
      const z = INCIDENT_ZONES.bottomEdge;
      const x = z.x + 60;
      const y = z.y + 30;
      const w = 700;
      const h = 250;
      const rot = 3;
      s += shadow(x, y, w, h, rot);
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFB8CB"/>`;
      b += text(slip!.heading, x + 24, y + 52, { font: FONTS.condensed, size: 40, fill: "#5A0F2A" });
      b += slipLines(slip!.lines, x + 24, y + 110, w - 60, 30, "#3A0A1C");
      b += `<rect x="${x + w - 280}" y="${y + 120}" width="240" height="90" rx="8" fill="none" stroke="#D3121C" stroke-width="7" stroke-opacity="0.85" transform="rotate(-10 ${x + w - 160} ${y + 165})"/>`;
      b += text("PAST DUE", x + w - 160, y + 185, { font: FONTS.stamp, size: 52, fill: "#D3121C", anchor: "middle", rotate: -10, opacity: 0.85 });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      s += paperClip(x + w - 90, y - 50, -6);
      break;
    }
    case "withdrawal-notice": {
      const z = INCIDENT_ZONES.lowerHalf;
      const x = z.x + 90;
      const y = z.y + 20;
      const w = 1180;
      const h = 440;
      const rot = -3;
      s += shadow(x, y, w, h, rot);
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#FFFFFF" stroke="#111" stroke-width="16"/>`;
      b += `<rect x="${x + 24}" y="${y + 24}" width="${w - 48}" height="${h - 48}" fill="none" stroke="#111" stroke-width="3"/>`;
      b += text(slip!.heading, x + w / 2, y + 100, { font: FONTS.serif, size: 70, fill: "#111", anchor: "middle" });
      b += slipLines(slip!.lines, x + 60, y + 180, w - 120, 38, "#111", FONTS.typewriter, 1.4);
      b += text("LIQUIDATED", x + w - 260, y + h - 60, { font: FONTS.stamp, size: 84, fill: "#D3121C", anchor: "middle", rotate: -8, opacity: 0.85 });
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      // Binder clip.
      const bx = x + w / 2 - 90;
      s += `<path d="M${bx} ${y - 30} h180 l-20 90 h-140 Z" fill="#111"/><path d="M${bx + 40} ${y - 30} q 50 -90 100 0" fill="none" stroke="#9AA3AD" stroke-width="10"/>`;
      break;
    }
    case "permission-slip": {
      const x = CARD.x + 60;
      const y = CARD.y + CARD.h - 40;
      const w = 760;
      const h = 230;
      const rot = -7;
      let b = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#F2B705"/>`;
      b += `<path d="M${x} ${y + 60} H${x + w}" stroke="#7A5A00" stroke-width="4" stroke-dasharray="14 10"/>`;
      b += text(slip!.heading, x + 24, y + 42, { font: FONTS.condensed, size: 34, fill: "#3A2A00" });
      b += slipLines(slip!.lines, x + 24, y + 100, w - 60, 28, "#2B2000", FONTS.typewriter, 1.25);
      s += `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${b}</g>`;
      break;
    }
    default:
      throw new Error(`no incident art for ${id}`);
  }
  return svgDoc(s);
}

// ---------------------------------------------------------------------------
// Doodles
// ---------------------------------------------------------------------------

const A = ZONES.doodleA;
const B = ZONES.doodleB;

function doodleSvg(id: string): string {
  const r = art("doodle", id);
  const pen = (d: string, w = 6, color = INK) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const scrawl = (str: string, x: number, y: number, size: number, rot = 0, color = INK, anchor: "start" | "middle" | "end" = "middle") =>
    text(str, x, y, { font: FONTS.kid, size, fill: color, anchor, rotate: rot });
  let s = "";
  switch (id) {
    case "rocket": {
      const cx = A.x + A.w / 2;
      s += pen(`M${cx + 60} ${A.y + 40} a 50 50 0 1 0 20 90 a 38 38 0 1 1 -20 -90 Z`, 5);
      for (let i = 0; i < 5; i++) s += `<path d="${starPath(A.x + r.int(10, A.w - 10), A.y + r.int(150, 260), 14, 5)}" fill="none" stroke="${INK}" stroke-width="3"/>`;
      const ry = A.y + 300;
      s += `<g transform="rotate(20 ${cx} ${ry + 60})">`;
      s += pen(`M${cx} ${ry - 60} C ${cx + 50} ${ry}, ${cx + 50} ${ry + 90}, ${cx + 32} ${ry + 130} H${cx - 32} C ${cx - 50} ${ry + 90}, ${cx - 50} ${ry}, ${cx} ${ry - 60} Z`, 6);
      s += pen(`M${cx - 32} ${ry + 100} l-34 50 l40 -12 M${cx + 32} ${ry + 100} l34 50 l-40 -12`, 6);
      s += `<circle cx="${cx}" cy="${ry + 30}" r="16" fill="none" stroke="${INK}" stroke-width="5"/>`;
      s += pen(wobblyPath([[cx - 24, ry + 140], [cx - 30, ry + 200], [cx - 8, ry + 170], [cx, ry + 240], [cx + 10, ry + 170], [cx + 30, ry + 205], [cx + 22, ry + 140]], r, 6), 5, "#E3122B");
      s += `</g>`;
      break;
    }
    case "chart-up": {
      const pts: [number, number][] = [];
      for (let i = 0; i <= 8; i++) pts.push([A.x + 10 + i * 30, A.y + A.h - 20 - i * 45 - (i % 2) * 20]);
      pts.push([A.x + A.w + 90, A.y - 80]);
      s += pen(wobblyPath(pts, r, 5), 7, "#4A4A4A");
      s += pen(`M${A.x + 6} ${A.y + 30} V${A.y + A.h} H${A.x + A.w}`, 5, "#4A4A4A");
      s += scrawl("only up", A.x + 100, A.y + A.h - 20, 38, -40, "#4A4A4A");
      break;
    }
    case "hodl-letters": {
      const x = B.x + 120;
      const y = B.y + 96;
      s += text("HODL", x + 10, y + 10, { font: FONTS.slab, size: 110, fill: INK, opacity: 0.25 });
      s += text("HODL", x, y, { font: FONTS.slab, size: 110, fill: "none", stroke: INK, strokeWidth: 5 });
      for (let i = 0; i < 26; i++) s += pen(`M${x + 20 + i * 14} ${y - 70} l24 60`, 2);
      break;
    }
    case "cube": {
      const x = A.x + 30;
      const y = A.y + 60;
      const sz = 120;
      for (let k = 0; k < 3; k++) {
        const j = k * 3;
        s += pen(`M${x + j} ${y + 50} h${sz} v${sz} h-${sz} Z M${x + 50 - j} ${y} h${sz} v${sz} h-${sz} Z M${x} ${y + 50} L${x + 50} ${y} M${x + sz} ${y + 50} L${x + sz + 50} ${y} M${x + sz} ${y + 50 + sz} L${x + sz + 50} ${y + sz} M${x} ${y + 50 + sz} L${x + 50} ${y + sz}`, 4);
      }
      s += scrawl("value", A.x + 110, A.y + 290, 36, -6);
      break;
    }
    case "cool-s": {
      const x = A.x + 60;
      const y = A.y + 60;
      const u = 36;
      const d = `M${x} ${y + u} L${x + u} ${y} L${x + 2 * u} ${y + u} V${y + 2 * u} L${x + u} ${y + 3 * u} V${y + 4 * u} L${x + 2 * u} ${y + 5 * u} V${y + 6 * u} L${x + u} ${y + 7 * u} L${x} ${y + 6 * u} V${y + 5 * u} L${x + u} ${y + 4 * u} V${y + 3 * u} L${x} ${y + 2 * u} Z M${x} ${y + 2 * u} L${x + u} ${y + 3 * u} M${x + 2 * u} ${y + 2 * u} L${x + u} ${y + 3 * u} M${x} ${y + 5 * u} L${x + u} ${y + 4 * u} M${x + 2 * u} ${y + 5 * u} L${x + u} ${y + 4 * u}`;
      s += pen(d, 8) + pen(d, 3, "#0E1F6B");
      break;
    }
    case "diamond-hands": {
      for (const [ox, flip] of [[B.x + 260, 1], [B.x + 620, -1]] as [number, number][]) {
        const y = B.y + 60;
        s += pen(`M${ox - 70} ${y} L${ox} ${y - 50} L${ox + 70} ${y} L${ox} ${y + 60} Z M${ox - 70} ${y} H${ox + 70} M${ox - 20} ${y - 50} L${ox} ${y + 60} L${ox + 20} ${y - 50}`, 5);
        for (let f = 0; f < 6; f++) s += pen(`M${ox - 60 + f * 24} ${y - 30} l${flip * 4} -${40 + (f % 3) * 10}`, 5);
        s += `<path d="${starPath(ox + 100 * flip, y - 50, 22, 6, 4)}" fill="${INK}"/>`;
      }
      s += scrawl("x6 fingers", B.x + 450, B.y + 105, 32, -3);
      break;
    }
    case "laser-eyes": {
      const cx = A.x + 90;
      const cy = A.y + 120;
      s += pen(`M${cx} ${cy - 70} a 70 70 0 1 0 0.1 0`, 6);
      s += `<circle cx="${cx - 26}" cy="${cy - 10}" r="9" fill="#E3122B"/><circle cx="${cx + 26}" cy="${cy - 10}" r="9" fill="#E3122B"/>`;
      s += pen(`M${cx - 26} ${cy - 10} L${A.x + A.w + 80} ${cy - 110} M${cx + 26} ${cy - 10} L${A.x + A.w + 80} ${cy - 60}`, 9, "#E3122B");
      s += pen(`M${cx - 30} ${cy + 30} q 30 20 60 0`, 5);
      s += pen(`M${cx} ${cy + 70} v140 M${cx} ${cy + 110} l-50 40 M${cx} ${cy + 110} l50 40 M${cx} ${cy + 210} l-40 70 M${cx} ${cy + 210} l40 70`, 6);
      s += scrawl("11/10 (the top)", A.x + A.w / 2, A.y + 430, 30, -4);
      break;
    }
    case "crying-stick": {
      const cx = B.x + B.w - 220;
      const cy = B.y + 30;
      s += pen(`M${cx} ${cy - 22} a 22 22 0 1 0 0.1 0`, 5);
      s += pen(`M${cx} ${cy + 22} v50 M${cx} ${cy + 40} l-26 20 M${cx} ${cy + 40} l26 20 M${cx} ${cy + 72} l-20 34 M${cx} ${cy + 72} l20 34`, 5);
      s += pen(`M${cx - 10} ${cy} q -40 -10 -70 30 M${cx + 10} ${cy} q 40 -10 70 30`, 4, "#3AA0FF");
      s += pen(`M${cx - 200} ${cy + 60} q 70 -40 150 -20`, 5) + pen(`M${cx - 60} ${cy + 30} l10 18 l-22 4`, 5);
      s += scrawl("ME", cx - 240, cy + 80, 46, -8);
      break;
    }
    case "dream-car": {
      const x = B.x + 820;
      const y = B.y + 90;
      s += pen(`M${x} ${y} L${x + 60} ${y - 50} L${x + 300} ${y - 60} L${x + 360} ${y - 20} L${x + 360} ${y} Z`, 6);
      s += pen(`M${x + 300} ${y - 60} L${x + 330} ${y - 110} H${x + 400} M${x + 330} ${y - 110} L${x + 350} ${y - 60}`, 6);
      for (const wx of [x + 60, x + 200, x + 300]) s += pen(`M${wx} ${y - 2} a 26 26 0 1 0 0.1 0`, 6);
      for (let i = 0; i < 3; i++) s += pen(`M${x - 40 - i * 20} ${y - 40 + i * 16} h-80`, 4);
      break;
    }
    case "none":
      return svgDoc("");
    case "yacht": {
      const x = B.x + 700;
      const y = B.y + 70;
      s += pen(`M${x} ${y} H${x + 320} L${x + 270} ${y + 40} H${x + 40} Z`, 6);
      s += pen(`M${x + 150} ${y} V${y - 130} L${x + 250} ${y - 30} Z`, 5);
      s += pen(`M${x + 90} ${y - 36} a 14 14 0 1 0 0.1 0 M${x + 90} ${y - 22} v24`, 4);
      s += `<rect x="${x + 76}" y="${y - 44}" width="30" height="8" fill="${INK}"/>`;
      s += pen(wobblyPath([[x - 60, y + 50], [x + 40, y + 40], [x + 140, y + 55], [x + 260, y + 42], [x + 400, y + 52]], r, 4), 4);
      s += scrawl("ME IN 2 WEEKS", x + 360, y - 20, 40, -4, INK, "start");
      break;
    }
    case "wen-moon-lines": {
      for (let i = 0; i < 18; i++) {
        s += text("WEN MOON", A.x + 10 + r.int(-3, 3) * (i / 6), A.y + 26 + i * 23, { font: FONTS.kid, size: 22, fill: INK, rotate: r.float(-i / 5, i / 5) });
      }
      break;
    }
    case "liq-math": {
      const x = B.x + 700;
      const y = B.y + 40;
      s += pen(`M${x} ${y + 60} C ${x + 20} ${y + 30}, ${x + 20} ${y}, ${x} ${y - 20} H${x + 300}`, 5);
      s += text("4.20 ) 69,000", x - 110, y + 30, { font: FONTS.kid, size: 40, fill: INK });
      s += pen(`M${x + 40} ${y + 50} l140 -40 M${x + 60} ${y + 12} l100 30`, 4);
      s += text("LIQ = ??", x + 360, y + 50, { font: FONTS.kid, size: 50, fill: INK });
      s += pen(wobblyPath(Array.from({ length: 13 }, (_, i) => [x + 450 + Math.cos(i / 2) * 120, y + 30 + Math.sin(i / 2) * 50] as [number, number]), r, 4), 4);
      break;
    }
    case "harrow-horns": {
      const cx = A.x + A.w / 2;
      const cy = A.y + 130;
      s += pen(`M${cx} ${cy - 80} a 80 90 0 1 0 0.1 0`, 6);
      s += pen(`M${cx} ${cy - 112} a 34 30 0 1 0 0.1 0`, 6);
      s += pen(`M${cx - 70} ${cy - 60} q -30 -70 -10 -110 q 10 50 34 70 M${cx + 70} ${cy - 60} q 30 -70 10 -110 q -10 50 -34 70`, 6, "#E3122B");
      s += pen(`M${cx - 52} ${cy} a 22 18 0 1 0 44 0 a 22 18 0 1 0 -44 0 M${cx + 8} ${cy} a 22 18 0 1 0 44 0 a 22 18 0 1 0 -44 0 M${cx - 8} ${cy} h16`, 5);
      s += pen(`M${cx - 30} ${cy + 48} q 30 -16 60 0`, 5);
      // Pitchfork red pen.
      s += pen(`M${cx + 90} ${cy + 220} L${cx + 90} ${cy - 20} M${cx + 60} ${cy - 20} v-50 M${cx + 90} ${cy - 20} v-60 M${cx + 120} ${cy - 20} v-50 M${cx + 60} ${cy - 20} h60`, 7, "#E3122B");
      s += scrawl("HARROW", cx, cy + 270, 50, -5);
      break;
    }
    default:
      throw new Error(`no doodle art for ${id}`);
  }
  return svgDoc(s);
}

export const attachmentsGroup: ArtModule = {
  group: "attachments",
  owns: ["09-Doodle", "12-Incident", "13-Status"],
  files(): ArtFile[] {
    const out: ArtFile[] = [];
    for (const d of DOODLES) out.push({ layer: "doodle", slug: d.id, svg: doodleSvg(d.id) });
    for (const i of INCIDENTS) out.push({ layer: "incident", slug: i.id, svg: incidentSvg(i.id) });
    for (const st of STATUSES) out.push({ layer: "status", slug: st.id, svg: statusSvg(st.id) });
    return out;
  },
};
