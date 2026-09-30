/**
 * SURFACES GROUP — owns 01-Background and 10-Stain.
 *
 * Backgrounds fill the whole 2000x2000 canvas but only the frame around the
 * card shows (~170px sides, ~120px top/bottom, plus the corners the card
 * rotation uncovers). Put each background's signature details in that
 * frame, and keep them LOUD: the background colour is what tells tokens
 * apart in a marketplace grid.
 *
 * Stains sit on the card (card space) above doodles and below the parent
 * signature. Keep them translucent where they cross printed text.
 */
import { BACKGROUNDS, STAINS } from "../copy/traits";
import { CARD, GRADE_GLYPHS, ZONES } from "../src/layout";
import {
  art,
  blobPath,
  FONTS,
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

const W = 2000;
const full = (fill: string) => `<rect width="${W}" height="${W}" fill="${fill}"/>`;

/** Points spread around the visible frame (outside the card rect), for scattering details. */
function framePoint(r: Rng, pad = 0): [number, number] {
  const side = r.int(0, 3);
  if (side === 0) return [r.int(0, W), r.int(0, CARD.y - pad)];
  if (side === 1) return [r.int(0, W), r.int(CARD.y + CARD.h + pad, W)];
  if (side === 2) return [r.int(0, CARD.x - pad), r.int(0, W)];
  return [r.int(CARD.x + CARD.w + pad, W), r.int(0, W)];
}

function rocket(x: number, y: number, k: number, body: string, flame: string, rot = 30): string {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${k})"><path d="M0 -70 C 28 -40, 28 20, 16 44 H -16 C -28 20, -28 -40, 0 -70 Z" fill="${body}"/><circle cx="0" cy="-18" r="10" fill="#222"/><path d="M-16 30 L-34 58 L-12 48 Z M16 30 L34 58 L12 48 Z" fill="${body}"/><path d="M-10 46 L0 86 L10 46 Z" fill="${flame}"/></g>`;
}

const BG: Record<string, (r: Rng) => { body: string; defs?: string }> = {
  "bus-7": (r) => {
    let s = full("#FFC400");
    // Black rub rails top and bottom.
    for (const y of [40, 1905, 1950]) s += `<rect x="0" y="${y}" width="${W}" height="${y === 40 ? 34 : 26}" fill="#111"/>`;
    for (let x = 30; x < W; x += 90) s += `<circle cx="${x}" cy="57" r="6" fill="#FFC400"/>`;
    s += text("SCHOOL BUS", 95, 1000, { font: FONTS.stencil, size: 150, fill: "#111", anchor: "middle", rotate: -90 });
    s += text("BUS 7", 1915, 1000, { font: FONTS.stencil, size: 170, fill: "#111", anchor: "middle", rotate: 90 });
    // Warning lights.
    for (const [x, c] of [[130, "#FF2A00"], [1870, "#FF2A00"], [330, "#FF8A00"], [1670, "#FF8A00"]] as [number, string][]) {
      s += `<circle cx="${x}" cy="${x < 1000 ? 18 : 18}" r="40" fill="${c}"/><circle cx="${x}" cy="18" r="20" fill="#FFF3B0"/>`;
    }
    // STOP arm peeking out on the right.
    const cx = 1960;
    const cy = 1500;
    let d = "";
    for (let i = 0; i < 8; i++) {
      const a = ((22.5 + i * 45) * Math.PI) / 180;
      d += `${i ? "L" : "M"}${n(cx + Math.cos(a) * 120)} ${n(cy + Math.sin(a) * 120)} `;
    }
    s += `<path d="${d}Z" fill="#E3122B" stroke="#fff" stroke-width="10"/>`;
    s += text("STOP", cx - 60, cy + 22, { font: FONTS.condensed, size: 70, fill: "#fff", anchor: "middle" });
    void r;
    return { body: s };
  },
  "locker-wall": (r) => {
    let s = full("#1646FF");
    const lw = 200;
    for (let x = -20, i = 0; x < W; x += lw, i++) {
      s += `<rect x="${x}" y="0" width="${lw - 10}" height="${W}" fill="#2A58FF"/>`;
      s += `<rect x="${x + lw - 10}" y="0" width="10" height="${W}" fill="#0B2AB0"/>`;
      for (const y0 of [22, 1920]) for (let k = 0; k < 4; k++) s += `<rect x="${x + 40}" y="${y0 + k * 16}" width="${lw - 90}" height="7" rx="3" fill="#0B2AB0"/>`;
      s += `<rect x="${x + lw - 60}" y="960" width="18" height="120" rx="6" fill="#C9D4FF"/>`;
      s += `<rect x="${x + 60}" y="${r.pick([1880, 1885])}" width="70" height="0" fill="none"/>`;
      s += text(String(1987 + i), x + lw / 2 - 5, 104, { font: FONTS.stencil, size: 30, fill: "#E7ECFF", anchor: "middle" });
    }
    // Dents.
    for (let i = 0; i < 10; i++) {
      const [x, y] = framePoint(r, 20);
      s += `<ellipse cx="${x}" cy="${y}" rx="${r.int(18, 40)}" ry="${r.int(8, 16)}" fill="#0B2AB0" fill-opacity="0.35"/>`;
    }
    // Sock hanging out.
    s += `<path d="M60 1240 h64 v220 q0 44 -44 44 h-60 q-34 0 -34 -30 q0 -30 34 -30 h40 Z" fill="#FFFFFF" stroke="#9AA3AD" stroke-width="5"/>`;
    s += `<rect x="60" y="1262" width="64" height="14" fill="#C8102E"/><rect x="60" y="1290" width="64" height="14" fill="#1646FF"/>`;
    return { body: s };
  },
  "carved-desk": (r) => {
    let s = full("#E8742A");
    for (let y = -40; y < W + 40; y += 34) {
      const pts: [number, number][] = [];
      for (let x = -50; x <= W + 50; x += 160) pts.push([x, y + Math.sin(x / 300 + y / 90) * 18]);
      s += `<path d="${wobblyPath(pts, r, 6)}" fill="none" stroke="#B8501A" stroke-width="${r.int(3, 9)}" stroke-opacity="${n(r.float(0.25, 0.6))}"/>`;
    }
    // Knots.
    for (let i = 0; i < 5; i++) {
      const [x, y] = framePoint(r, 30);
      for (let k = 0; k < 4; k++) s += `<ellipse cx="${x}" cy="${y}" rx="${50 - k * 11}" ry="${22 - k * 5}" fill="none" stroke="#8C3A10" stroke-width="4"/>`;
    }
    // Pencil groove top, WAGMI carved at the bottom.
    s += `<rect x="260" y="28" width="1480" height="46" rx="23" fill="#8C3A10"/><rect x="270" y="40" width="1460" height="10" rx="5" fill="#6B2A08"/>`;
    s += text("WAGMI", 1000 + 6, 1990, { font: FONTS.stencil, size: 118, fill: "#F7A060", anchor: "middle" });
    s += text("WAGMI", 1000, 1984, { font: FONTS.stencil, size: 118, fill: "#6B2A08", anchor: "middle" });
    s += `<path d="${blobPath(1880, 1860, 60, r, 7, 0.4)}" fill="#B9B9B9"/><path d="${blobPath(1870, 1850, 30, r, 5, 0.4)}" fill="#DADADA"/>`;
    return { body: s };
  },
  "cafeteria-tray": (r) => {
    let s = full("#12C6B5");
    const comp = (x: number, y: number, w: number, h: number) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="60" fill="#0FAE9F"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="50" fill="#16D6C4"/>`;
    s += comp(-60, -60, 900, 700) + comp(900, -60, 1200, 700) + comp(-60, 700, 700, 1400) + comp(700, 700, 1400, 1400);
    // Tots.
    for (let i = 0; i < 9; i++) {
      const x = r.int(20, 150);
      const y = r.int(40, 700);
      s += `<g transform="rotate(${r.int(-40, 40)} ${x} ${y})"><rect x="${x - 34}" y="${y - 22}" width="68" height="44" rx="18" fill="#D9A24A"/><rect x="${x - 26}" y="${y - 14}" width="52" height="10" rx="5" fill="#F0C77A"/></g>`;
    }
    // Gravy puddle.
    s += `<path d="${blobPath(1880, 1840, 190, r, 9, 0.4)}" fill="#C9A46A"/><path d="${blobPath(1850, 1800, 70, r, 6, 0.4)}" fill="#E7CD98"/>`;
    // A pea.
    s += `<circle cx="1920" cy="220" r="22" fill="#6DBE45"/><circle cx="1880" cy="280" r="20" fill="#6DBE45"/>`;
    return { body: s };
  },
  chalkboard: (r) => {
    let s = full("#1F8F4E");
    for (let i = 0; i < 40; i++) {
      const [x, y] = framePoint(r, -60);
      s += `<path d="${penLine(x, y, x + r.int(-220, 220), y + r.int(-60, 60), r, 10, 4)}" stroke="#FFFFFF" stroke-width="${r.int(20, 60)}" stroke-opacity="${n(r.float(0.04, 0.1))}" stroke-linecap="round" fill="none"/>`;
    }
    // Falling chart across the top.
    const pts: [number, number][] = [];
    for (let i = 0; i <= 14; i++) pts.push([60 + i * 135, 20 + i * 5 + (i % 2 ? 40 : 0) + (i > 9 ? (i - 9) * 30 : 0)]);
    s += `<path d="${wobblyPath(pts, r, 4)}" fill="none" stroke="#F4F4F4" stroke-width="10" stroke-linecap="round"/>`;
    s += text("DUE MONDAY", 90, 1000, { font: FONTS.kid, size: 110, fill: "#F4F4F4", anchor: "middle", rotate: -90, opacity: 0.9 });
    s += text("SELL?", 1915, 700, { font: FONTS.kid, size: 100, fill: "#F4F4F4", anchor: "middle", rotate: 90, opacity: 0.85 });
    // Wooden frame bottom + chalk tray with a nub.
    s += `<rect x="0" y="1935" width="${W}" height="65" fill="#9C6A36"/><rect x="0" y="1935" width="${W}" height="12" fill="#C28A4E"/>`;
    s += `<rect x="1700" y="1915" width="60" height="22" rx="10" fill="#FFFFFF"/>`;
    return { body: s };
  },
  "gym-floor": (r) => {
    let s = full("#F4A81D");
    for (let x = 0; x < W; x += 64) s += `<rect x="${x}" y="0" width="62" height="${W}" fill="${r.pick(["#F7B232", "#EFA114", "#F4A81D", "#F9BA45"])}"/>`;
    for (let x = 0; x < W; x += 64) for (let y = r.int(-300, 0); y < W; y += r.int(380, 620)) s += `<rect x="${x}" y="${y}" width="62" height="3" fill="#C98410"/>`;
    s += `<path d="M0 260 H${W}" stroke="#E3122B" stroke-width="22"/><path d="M1880 0 V${W}" stroke="#1646FF" stroke-width="22"/>`;
    s += `<path d="M0 1700 A 700 700 0 0 1 700 2400" fill="none" stroke="#1646FF" stroke-width="22"/>`;
    s += `<circle cx="1000" cy="2040" r="330" fill="none" stroke="#E3122B" stroke-width="22"/>`;
    // Deflated dodgeball.
    s += `<path d="${blobPath(110, 1880, 95, r, 6, 0.35)}" fill="#D4232F"/><path d="M40 1860 q70 -30 140 10" stroke="#8E0F18" stroke-width="8" fill="none"/>`;
    return { body: s };
  },
  "detention-room": (r) => {
    let s = full("#5FF2C2");
    for (let x = 0; x <= W; x += 250) s += `<rect x="${x - 2}" y="0" width="4" height="${W}" fill="#3CC99C"/>`;
    for (let y = 0; y <= W; y += 250) s += `<rect x="0" y="${y - 2}" width="${W}" height="4" fill="#3CC99C"/>`;
    let dots = "";
    for (let i = 0; i < 700; i++) {
      const [x, y] = framePoint(r, -40);
      dots += `M${x} ${y} h${r.int(4, 9)} `;
    }
    s += `<path d="${dots}" stroke="#1E8F6E" stroke-width="5" stroke-linecap="round"/>`;
    let dots2 = "";
    for (let i = 0; i < 400; i++) {
      const [x, y] = framePoint(r, -40);
      dots2 += `M${x} ${y} h${r.int(3, 7)} `;
    }
    s += `<path d="${dots2}" stroke="#E8FFF7" stroke-width="5" stroke-linecap="round"/>`;
    // HANG IN THERE poster in the top-left corner.
    s += `<g transform="rotate(-6 150 150)"><rect x="-40" y="-40" width="420" height="330" fill="#FFF7D6" stroke="#2B2B2B" stroke-width="6"/>`;
    s += `<rect x="150" y="30" width="36" height="120" fill="#D3121C"/><path d="M168 10 V180" stroke="#D3121C" stroke-width="6"/>`;
    s += `<path d="M168 150 v40 M150 205 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0 M168 223 v50 M168 240 l-30 20 M168 240 l30 20" fill="none" stroke="#2B2B2B" stroke-width="7"/>`;
    s += text("HANG IN THERE", 170, 272, { font: FONTS.condensed, size: 34, fill: "#2B2B2B", anchor: "middle" });
    s += `</g>`;
    return { body: s };
  },
  "principals-carpet": (r) => {
    let s = full("#5B1FA8");
    const colors = ["#18E5C5", "#FF2BD6", "#FFE14D", "#2BD1FF"];
    for (let i = 0; i < 170; i++) {
      const [x, y] = framePoint(r, -80);
      const c = r.pick(colors);
      const k = r.int(0, 2);
      if (k === 0) s += `<path d="${penLine(x, y, x + r.int(-70, 70), y + r.int(-70, 70), r, 16, 3)}" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
      else if (k === 1) s += `<path d="M${x} ${y} l${r.int(20, 40)} ${r.int(30, 50)} l${-r.int(40, 70)} 0 Z" fill="${c}" transform="rotate(${r.int(0, 360)} ${x} ${y})"/>`;
      else s += `<circle cx="${x}" cy="${y}" r="${r.int(8, 16)}" fill="none" stroke="${c}" stroke-width="7"/>`;
    }
    // Worn path toward the desk.
    s += `<path d="M1000 2000 Q 980 1960 1000 1900" stroke="#3E1178" stroke-width="260" stroke-opacity="0.5" fill="none"/>`;
    return { body: s };
  },
  "picture-day-lasers": (r) => {
    const defs = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A0E3F"/><stop offset="1" stop-color="#2E0B52"/></linearGradient>`;
    let s = `<rect width="${W}" height="${W}" fill="url(#g)"/>`;
    const beams: [number, number, number, number, string][] = [];
    for (let i = 0; i < 9; i++) {
      const c = i % 2 ? "#FF2BD6" : "#18E5FF";
      beams.push([r.int(-200, 2200), -100, r.int(-200, 2200), 2100, c]);
    }
    for (const [x1, y1, x2, y2, c] of beams) {
      for (const [w, o] of [[70, 0.12], [34, 0.25], [12, 0.9]] as [number, number][]) {
        s += `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${c}" stroke-width="${w}" stroke-opacity="${o}" stroke-linecap="round"/>`;
      }
    }
    for (let i = 0; i < 16; i++) {
      const [x, y] = framePoint(r, 10);
      s += `<path d="${starPath(x, y, r.int(16, 34), 4, 4)}" fill="#FFFFFF"/>`;
    }
    return { body: s, defs };
  },
  "bathroom-stall": (r) => {
    let s = full("#FF7F6E");
    for (const x of [0, 660, 1340]) s += `<rect x="${x}" y="0" width="12" height="${W}" fill="#D9594A"/>`;
    for (let i = 0; i < 40; i++) {
      const [x, y] = framePoint(r, 25);
      s += `<circle cx="${x}" cy="${y}" r="9" fill="#E26A5A"/><circle cx="${x - 2}" cy="${y - 2}" r="4" fill="#FFB2A6"/>`;
    }
    const tag = (str: string, x: number, y: number, size: number, rot: number, c = "#1A1A1A") =>
      text(str, x, y, { font: FONTS.graffiti, size, fill: c, anchor: "middle", rotate: rot });
    s += tag("BUY HIGH SELL LOWER", 1000, 92, 88, -1);
    s += tag("NGMI", 88, 700, 120, -90, "#1C3A9E");
    s += tag("DYOR", 88, 1450, 100, -90);
    s += `<path d="M1905 900 c -60 -60, -120 10, 0 110 c 120 -100, 60 -170, 0 -110 Z" fill="none" stroke="#D3121C" stroke-width="8"/>`;
    s += tag("BAGS", 1908, 1150, 70, 90, "#D3121C");
    s += tag("4EVER", 1908, 1400, 70, 90, "#D3121C");
    let tally = "";
    for (let g = 0; g < 6; g++) {
      const x0 = 300 + g * 140;
      for (let k = 0; k < 4; k++) tally += `M${x0 + k * 22} 1925 v60 `;
      tally += `M${x0 - 10} 1975 l100 -40 `;
    }
    s += `<path d="${tally}" stroke="#1A1A1A" stroke-width="7" stroke-linecap="round"/>`;
    s += tag("wen moon", 1500, 1972, 64, -2, "#1C3A9E");
    return { body: s };
  },
  "sticker-bombed-desk": (r) => {
    let s = full("#F2E3C6");
    const neon = ["#FF2BD6", "#18E5FF", "#39FF14", "#FFE600", "#FF7A00", "#8B5CFF", "#FF3B3B"];
    const words = ["100X", "HODL", "TO THE MOON", "NGMI", "WAGMI", "NOT FINANCIAL ADVICE", "GM", "WEN?", "LFG", "FEW", "UP ONLY", "SER", "DYOR", "RUGPROOF*"];
    for (let i = 0; i < 70; i++) {
      const [x, y] = framePoint(r, -90);
      const c = r.pick(neon);
      const rot = r.int(-35, 35);
      const kind = r.int(0, 3);
      let g = `<g transform="rotate(${rot} ${x} ${y})">`;
      if (kind === 0) {
        const rad = r.int(55, 95);
        g += `<circle cx="${x}" cy="${y}" r="${rad + 8}" fill="#fff"/><circle cx="${x}" cy="${y}" r="${rad}" fill="${c}"/>`;
        g += text(r.pick(words.slice(0, 12)), x, y + 12, { font: FONTS.condensed, size: Math.round(rad * 0.42), fill: "#111", anchor: "middle" });
      } else if (kind === 1) {
        const w = r.int(180, 300);
        g += `<rect x="${x - w / 2 - 8}" y="${y - 48}" width="${w + 16}" height="96" rx="16" fill="#fff"/><rect x="${x - w / 2}" y="${y - 40}" width="${w}" height="80" rx="12" fill="${c}"/>`;
        g += text(r.pick(words), x, y + 16, { font: FONTS.condensed, size: 40, fill: "#111", anchor: "middle" });
      } else if (kind === 2) {
        g += `<path d="${starPath(x, y, 90, 40)}" fill="#fff"/><path d="${starPath(x, y, 76, 32)}" fill="${c}"/>`;
      } else {
        g += `<circle cx="${x}" cy="${y}" r="70" fill="#fff"/>` + rocket(x, y, 1, c, "#FF3B3B", 0);
      }
      s += g + `</g>`;
    }
    return { body: s };
  },
  "overhead-projector": (r) => {
    const defs = `<radialGradient id="glow" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#FFF6D8"/><stop offset="0.55" stop-color="#FFE9A8"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>`;
    let s = full("#0B1030");
    s += `<path d="M-100 -60 L2100 -60 L1850 2080 L150 2080 Z" fill="url(#glow)"/>`;
    s += `<path d="M60 10 L1940 10 L1780 1990 L220 1990 Z" fill="none" stroke="#FFF6D8" stroke-opacity="0.4" stroke-width="18"/>`;
    // Ghost chart projected at the top.
    const pts: [number, number][] = [];
    for (let i = 0; i <= 12; i++) pts.push([120 + i * 150, 40 + (i < 6 ? -i * 3 : (i - 6) * 14) + (i % 2) * 18]);
    s += `<path d="${wobblyPath(pts, r, 2)}" fill="none" stroke="#D3121C" stroke-opacity="0.55" stroke-width="12"/>`;
    for (let i = 0; i < 90; i++) {
      const [x, y] = framePoint(r, 0);
      s += `<circle cx="${x}" cy="${y}" r="${n(r.float(1.5, 4))}" fill="#FFFFFF" fill-opacity="${n(r.float(0.3, 0.8))}"/>`;
    }
    s += text("PLEASE DO NOT TOUCH THE PROJECTOR", 1000, 1975, { font: FONTS.condensed, size: 40, fill: "#0B1030", anchor: "middle", opacity: 0.7 });
    return { body: s, defs };
  },
  "green-candle-floor": (r) => {
    let s = full("#050A05");
    for (let x = -40; x < W + 40; x += r.int(90, 150)) {
      const h = r.int(500, 1900);
      const w = r.int(40, 70);
      const top = W - h;
      s += `<rect x="${x - w}" y="${top - 30}" width="${w * 3}" height="${h + 60}" fill="#18FF6D" fill-opacity="0.07"/>`;
      s += `<path d="M${x + w / 2} ${top - r.int(40, 120)} V${W}" stroke="#18FF6D" stroke-width="6"/>`;
      s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" fill="#18FF6D"/>`;
      s += `<rect x="${x + 6}" y="${top + 6}" width="${w * 0.3}" height="${h - 12}" fill="#B9FFD4" fill-opacity="0.45"/>`;
    }
    for (let i = 0; i < 70; i++) {
      const [x, y] = framePoint(r, 0);
      s += `<rect x="${x}" y="${y}" width="${r.int(10, 22)}" height="${r.int(6, 12)}" fill="${r.pick(["#FFE600", "#FF2BD6", "#18E5FF", "#FFFFFF"])}" transform="rotate(${r.int(0, 180)} ${x} ${y})"/>`;
    }
    return { body: s };
  },
  "liquidation-red": (r) => {
    const defs = `<radialGradient id="siren" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFE3A0"/><stop offset="0.35" stop-color="#FF7A00" stop-opacity="0.7"/><stop offset="1" stop-color="#FF1A1A" stop-opacity="0"/></radialGradient>`;
    let s = full("#FF1A1A");
    for (let row = -2; row < 16; row++) {
      for (let col = -1; col < 5; col++) {
        const x = col * 560 + (row % 2) * 280;
        const y = row * 150;
        s += text("LIQUIDATED", x, y, { font: FONTS.condensed, size: 92, fill: "#B00000", rotate: -30, opacity: 0.55 });
      }
    }
    for (const [x, y] of [[0, 0], [W, 0], [0, W], [W, W]]) s += `<circle cx="${x}" cy="${y}" r="420" fill="url(#siren)"/>`;
    void r;
    return { body: s, defs };
  },
};

// ---------------------------------------------------------------------------
// Stains
// ---------------------------------------------------------------------------

const STAIN: Record<string, (r: Rng) => string> = {
  "coffee-ring": (r) => {
    const cx = 1240;
    const cy = 880;
    const rad = 175;
    let s = `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#8B5A2B" fill-opacity="0.12"/>`;
    s += `<path d="${wobblyPath(ringPts(cx, cy, rad, 40), r, 4, true)}" fill="none" stroke="#6F4527" stroke-width="16" stroke-opacity="0.45"/>`;
    s += `<path d="${wobblyPath(ringPts(cx, cy, rad - 12, 40), r, 3, true)}" fill="none" stroke="#6F4527" stroke-width="5" stroke-opacity="0.35"/>`;
    s += `<path d="M${cx + rad * 0.7} ${cy + rad * 0.7} q 30 60 10 140 q -6 20 -22 0 q -8 -60 -2 -130 Z" fill="#6F4527" fill-opacity="0.35"/>`;
    return s;
  },
  "cafeteria-gravy": (r) => {
    const cx = 470;
    const cy = 1810;
    let s = `<path d="${blobPath(cx, cy, 130, r, 8, 0.5)}" fill="#B98A4B" fill-opacity="0.75"/>`;
    s += `<path d="${blobPath(cx - 20, cy - 20, 60, r, 6, 0.4)}" fill="#E2BE84" fill-opacity="0.8"/>`;
    for (let k = 0; k < 6; k++) s += `<ellipse cx="${cx + 40}" cy="${cy + 10}" rx="${50 - k * 8}" ry="${34 - k * 5}" fill="none" stroke="#8C6230" stroke-width="3" stroke-opacity="0.6"/>`;
    s += `<ellipse cx="${cx - 40}" cy="${cy - 50}" rx="30" ry="10" fill="#FFFFFF" fill-opacity="0.55" transform="rotate(-20 ${cx - 40} ${cy - 50})"/>`;
    return s;
  },
  "chocolate-milk": (r) => {
    const top = 1620;
    const pts: [number, number][] = [];
    for (let x = CARD.x; x <= CARD.x + CARD.w; x += 110) pts.push([x, top + Math.sin(x / 140) * 40 + r.int(-20, 20)]);
    const edge = wobblyPath(pts, r, 6);
    let s = `<path d="${edge} L${CARD.x + CARD.w} ${CARD.y + CARD.h} L${CARD.x} ${CARD.y + CARD.h} Z" fill="#7B4A2A" fill-opacity="0.22"/>`;
    s += `<path d="${edge}" fill="none" stroke="#5A3218" stroke-width="10" stroke-opacity="0.5"/>`;
    s += `<path d="${edge}" fill="none" stroke="#5A3218" stroke-width="4" stroke-opacity="0.35" transform="translate(0 40)"/>`;
    return s;
  },
  "folded-eighths": () => {
    const xs = [CARD.x + CARD.w / 2];
    const ys = [CARD.y + CARD.h / 4, CARD.y + CARD.h / 2, CARD.y + (CARD.h * 3) / 4];
    let s = "";
    for (const x of xs) s += `<rect x="${x - 3}" y="${CARD.y}" width="6" height="${CARD.h}" fill="#000" fill-opacity="0.12"/><rect x="${x + 3}" y="${CARD.y}" width="5" height="${CARD.h}" fill="#FFF" fill-opacity="0.5"/>`;
    for (const y of ys) s += `<rect x="${CARD.x}" y="${y - 3}" width="${CARD.w}" height="6" fill="#000" fill-opacity="0.12"/><rect x="${CARD.x}" y="${y + 3}" width="${CARD.w}" height="5" fill="#FFF" fill-opacity="0.5"/>`;
    for (const x of xs) for (const y of ys) s += `<circle cx="${x}" cy="${y}" r="22" fill="#FFFFFF" fill-opacity="0.7"/>`;
    // Softened panels.
    s += `<rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w / 2}" height="${CARD.h / 4}" fill="#000" fill-opacity="0.03"/><rect x="${CARD.x + CARD.w / 2}" y="${CARD.y + CARD.h / 2}" width="${CARD.w / 2}" height="${CARD.h / 4}" fill="#000" fill-opacity="0.03"/>`;
    return s;
  },
  "grape-juice": (r) => splat(1400, 1020, 120, r, "#7B2CBF", 0.55, 16) + `<path d="M1400 1100 q -10 120 4 260" stroke="#7B2CBF" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round" fill="none"/><rect x="1470" y="870" width="10" height="160" rx="5" fill="#FFFFFF" transform="rotate(35 1475 950)" stroke="#7B2CBF" stroke-width="4"/>`,
  "pizza-grease": (r) => {
    const g = GRADE_GLYPHS[3];
    return `<path d="${blobPath(g.x + 120, g.y + 110, 150, r, 5, 0.3)}" fill="#E8C66A" fill-opacity="0.33"/><path d="${blobPath(g.x + 120, g.y + 110, 150, r, 5, 0.3)}" fill="none" stroke="#C49A3A" stroke-opacity="0.45" stroke-width="6"/>`;
  },
  tears: (r) => {
    let s = "";
    for (let i = 0; i < 6; i++) {
      const x = r.int(420, 1650);
      const y = r.int(ZONES.comment.y + 40, ZONES.comment.y + ZONES.comment.h - 20);
      const rad = r.int(24, 44);
      s += `<circle cx="${x}" cy="${y}" r="${rad}" fill="#6FA8DC" fill-opacity="0.16"/><path d="${wobblyPath(ringPts(x, y, rad, 14), r, 2.5, true)}" fill="none" stroke="#4A6E9A" stroke-opacity="0.45" stroke-width="4"/>`;
    }
    return s;
  },
  "shoe-print": (r) => {
    let s = `<g transform="rotate(-32 1000 1150)">`;
    s += `<path d="M760 1000 C 760 860, 1240 860, 1260 1000 C 1280 1120, 1180 1160, 1150 1240 C 1120 1320, 1180 1420, 1100 1480 C 1020 1540, 860 1520, 840 1440 C 820 1360, 900 1300, 860 1220 C 820 1140, 760 1120, 760 1000 Z" fill="#555" fill-opacity="0.16" stroke="#444" stroke-opacity="0.35" stroke-width="10"/>`;
    for (let y = 900; y < 1500; y += 38) s += `<path d="${penLine(800, y, 1220, y + 20, r, 4)}" stroke="#333" stroke-opacity="0.25" stroke-width="14" stroke-linecap="round"/>`;
    s += `</g>`;
    return s;
  },
  booger: (r) => {
    const cx = 1740;
    const cy = 1830;
    return `<path d="${blobPath(cx, cy, 34, r, 6, 0.6)}" fill="#A5C43A"/><path d="${blobPath(cx + 26, cy + 10, 18, r, 5, 0.5)}" fill="#8DAF1F"/><ellipse cx="${cx - 8}" cy="${cy - 10}" rx="10" ry="5" fill="#F4FFD0"/>`;
  },
  nosebleed: (r) => {
    let s = "";
    for (let i = 0; i < 6; i++) s += `<circle cx="${r.int(900, 1300)}" cy="${r.int(1000, 1160)}" r="${r.int(7, 20)}" fill="#7A0A0A" fill-opacity="0.85"/>`;
    s += `<path d="M960 1180 q 80 30 180 10" stroke="#7A0A0A" stroke-opacity="0.6" stroke-width="16" stroke-linecap="round" fill="none"/>`;
    return s;
  },
  ketchup: (r) =>
    splat(640, 1110, 90, r, "#E3261B", 0.9, 14) +
    `<path d="M780 1170 l90 -20 l14 50 l-90 22 Z" fill="#FFFFFF" stroke="#E3261B" stroke-width="5"/><text x="800" y="1195" font-family="${FONTS.condensed}" font-size="22" fill="#E3261B" transform="rotate(-12 800 1195)">KETCHUP</text>`,
  pristine: () => "",
  scorched: (r) => {
    const x1 = CARD.x + CARD.w;
    const y1 = CARD.y + CARD.h;
    const pts: [number, number][] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push([x1 - 520 * (1 - t) + r.int(-30, 30), y1 - 520 * t + r.int(-30, 30)]);
    }
    const edge = wobblyPath(pts, r, 14);
    let s = `<path d="${edge} L${x1 + 10} ${y1 + 10} Z" fill="#6B3A12" fill-opacity="0.55"/>`;
    const inner = wobblyPath(pts.map(([x, y]) => [x + (x1 - x) * 0.35, y + (y1 - y) * 0.35] as [number, number]), r, 10);
    s += `<path d="${inner} L${x1 + 10} ${y1 + 10} Z" fill="#1A1008"/>`;
    s += `<path d="${edge}" fill="none" stroke="#FF7A00" stroke-width="7" stroke-opacity="0.8"/>`;
    for (let i = 0; i < 18; i++) s += `<circle cx="${x1 - r.int(0, 600)}" cy="${y1 - r.int(0, 600)}" r="${r.int(3, 9)}" fill="#333" fill-opacity="0.6"/>`;
    return s;
  },
};

function ringPts(cx: number, cy: number, rad: number, k: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= k; i++) {
    const a = (i / k) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }
  return pts;
}

export const surfacesGroup: ArtModule = {
  group: "surfaces",
  owns: ["01-Background", "10-Stain"],
  files(): ArtFile[] {
    const out: ArtFile[] = [];
    for (const b of BACKGROUNDS) {
      const { body, defs } = BG[b.id](art("bg", b.id));
      out.push({ layer: "background", slug: b.id, svg: svgDoc(body, { defs }) });
    }
    for (const st of STAINS) out.push({ layer: "stain", slug: st.id, svg: svgDoc(STAIN[st.id](art("stain", st.id))) });
    return out;
  },
};
