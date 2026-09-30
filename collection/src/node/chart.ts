/**
 * The published rarity curve: histogram of statistical rarity scores (log x),
 * bars shaded by token tier (one-hue ordinal ramp, Common light -> Legendary
 * dark), tier cut lines direct-labelled, plus a legend with exact counts.
 */
import { FONTS } from "../fonts";
import type { RarityTable } from "../rarity";
import { TOKEN_TIER_COUNTS } from "../rarity";
import { renderSvg } from "./render";

const SURFACE = "#fcfcfb";
const TEXT = "#0b0b0b";
const TEXT_2 = "#52514e";
const GRID = "#e4e2dc";
// Ordinal blue ramp (reference palette steps 250..650), Common -> Legendary.
const TIER_COLOR: Record<string, string> = {
  Common: "#86b6ef",
  Uncommon: "#5598e7",
  Rare: "#2a78d6",
  Epic: "#1c5cab",
  Legendary: "#104281",
};

export function rarityChartPng(table: RarityTable): Buffer {
  const W = 1800;
  const H = 1000;
  const m = { l: 110, r: 60, t: 150, b: 120 };
  const pw = W - m.l - m.r;
  const ph = H - m.t - m.b;
  const gens = table.byId.filter((r) => r.score !== null) as { score: number; tier: string; rank: number }[];
  const scores = gens.map((g) => g.score);
  const lo = Math.log10(Math.min(...scores));
  const hi = Math.log10(Math.max(...scores));
  const x0 = Math.floor(lo * 10) / 10;
  const x1 = Math.ceil(hi * 10) / 10;
  const BINS = 60;
  const bw = (x1 - x0) / BINS;
  // Count per bin per tier.
  const bins = Array.from({ length: BINS }, () => new Map<string, number>());
  for (const g of gens) {
    const b = Math.min(BINS - 1, Math.floor((Math.log10(g.score) - x0) / bw));
    bins[b].set(g.tier, (bins[b].get(g.tier) ?? 0) + 1);
  }
  const maxCount = Math.max(...bins.map((b) => [...b.values()].reduce((a, c) => a + c, 0)));
  const yMax = Math.ceil(maxCount / 50) * 50;
  const X = (v: number) => m.l + ((v - x0) / (x1 - x0)) * pw;
  const Y = (c: number) => m.t + ph - (c / yMax) * ph;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${SURFACE}"/>`;
  s += `<text x="${m.l}" y="58" font-family="${FONTS.condensed}" font-size="40" fill="${TEXT}">Report Cards — rarity curve (3,300 generated cards)</text>`;
  s += `<text x="${m.l}" y="98" font-family="${FONTS.mono}" font-size="22" fill="${TEXT_2}">score = sum of 1/frequency over 18 visible traits · tiers are exact rank cuts · 33 one-of-ones rank above all</text>`;
  // Grid + y axis.
  for (let c = 0; c <= yMax; c += yMax / 5) {
    s += `<path d="M${m.l} ${Y(c)} H${m.l + pw}" stroke="${GRID}" stroke-width="1"/>`;
    s += `<text x="${m.l - 14}" y="${Y(c) + 7}" text-anchor="end" font-family="${FONTS.mono}" font-size="20" fill="${TEXT_2}">${c}</text>`;
  }
  s += `<text x="30" y="${m.t + ph / 2}" transform="rotate(-90 30 ${m.t + ph / 2})" text-anchor="middle" font-family="${FONTS.mono}" font-size="22" fill="${TEXT_2}">cards per bin</text>`;
  // x ticks (log).
  for (const v of [30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000]) {
    const lv = Math.log10(v);
    if (lv < x0 || lv > x1) continue;
    s += `<path d="M${X(lv)} ${m.t + ph} v8" stroke="${TEXT_2}" stroke-width="2"/><text x="${X(lv)}" y="${m.t + ph + 34}" text-anchor="middle" font-family="${FONTS.mono}" font-size="20" fill="${TEXT_2}">${v}</text>`;
  }
  s += `<text x="${m.l + pw / 2}" y="${H - 30}" text-anchor="middle" font-family="${FONTS.mono}" font-size="22" fill="${TEXT_2}">rarity score (log scale) →  rarer</text>`;
  // Stacked bars (2px surface gap between bars and segments).
  const order = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
  bins.forEach((b, i) => {
    const bx = X(x0 + i * bw) + 1;
    const w = Math.max(1, X(x0 + (i + 1) * bw) - X(x0 + i * bw) - 2);
    let acc = 0;
    for (const tier of order) {
      const c = b.get(tier) ?? 0;
      if (!c) continue;
      const yTop = Y(acc + c);
      const hgt = Y(acc) - yTop - (acc > 0 ? 2 : 0);
      if (hgt > 0) s += `<rect x="${bx}" y="${yTop}" width="${w}" height="${hgt}" rx="${Math.min(3, w / 3)}" fill="${TIER_COLOR[tier]}"/>`;
      acc += c;
    }
  });
  s += `<path d="M${m.l} ${m.t + ph} H${m.l + pw}" stroke="${TEXT_2}" stroke-width="2"/>`;
  // Tier cut lines: min score of each tier above Common.
  let labelRow = 0;
  for (const [tier] of TOKEN_TIER_COUNTS) {
    if (tier === "Common") continue;
    const minScore = Math.min(...gens.filter((g) => g.tier === tier).map((g) => g.score));
    const x = X(Math.log10(minScore));
    s += `<path d="M${x} ${m.t - 10} V${m.t + ph}" stroke="${TEXT}" stroke-width="2" stroke-dasharray="6 6"/>`;
    const label = `${tier} ≥ ${minScore.toFixed(0)}`;
    const ly0 = m.t + 12 + labelRow * 30;
    s += `<rect x="${x + 4}" y="${ly0 - 20}" width="${label.length * 12.2 + 10}" height="27" fill="${SURFACE}" fill-opacity="0.92"/>`;
    s += `<text x="${x + 8}" y="${ly0}" font-family="${FONTS.mono}" font-size="20" fill="${TEXT}">${label}</text>`;
    labelRow++;
  }
  // The long tail: the valedictorians and one-off semesters.
  const tail = gens.filter((g) => g.score >= 1000).length;
  if (tail) s += `<text x="${X(Math.log10(1000)) + 20}" y="${m.t + ph - 40}" font-family="${FONTS.mono}" font-size="20" fill="${TEXT_2}">${tail} cards score ≥ 1000 (valedictorians, one-off semesters) →</text>`;
  // Legend with exact counts.
  let lx = m.l + pw - 520;
  const ly = m.t + 130;
  s += `<rect x="${lx - 20}" y="${ly - 40}" width="540" height="${TOKEN_TIER_COUNTS.length * 40 + 30}" fill="${SURFACE}" stroke="${GRID}"/>`;
  TOKEN_TIER_COUNTS.slice()
    .reverse()
    .forEach(([tier, count], i) => {
      const y = ly + i * 40;
      s += `<rect x="${lx}" y="${y - 20}" width="26" height="26" rx="4" fill="${TIER_COLOR[tier]}"/>`;
      s += `<text x="${lx + 40}" y="${y}" font-family="${FONTS.mono}" font-size="22" fill="${TEXT}">${tier.padEnd(10)} ${String(count).padStart(5)}  (${((count / 3300) * 100).toFixed(0)}%)</text>`;
    });
  lx += 0;
  s += `</svg>`;
  return renderSvg(s, { width: W });
}
