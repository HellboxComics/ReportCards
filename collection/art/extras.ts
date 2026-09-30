/**
 * EXTRAS (foundation-owned) — collection-level images in layers/extras:
 * - unrevealed.svg: the pre-reveal placeholder (brief: UNREVEALED.art in the copy)
 * - collection.svg: the contract-level collection image
 */
import { COLLECTION, UNREVEALED } from "../copy/descriptions";
import { art, FONTS, measure, penLine, scallopPath, splat, svgDoc, text, wobblyPath } from "./lib";
import type { ArtFile, ArtModule } from "./types";

const RED = "#D3121C";

function fit(str: string, font: string, max: number, w: number): number {
  const m = measure(str, font, max);
  return m <= w ? max : Math.floor((max * w) / m);
}

export function unrevealedSvg(): string {
  const r = art("extras", "unrevealed");
  const im = UNREVEALED.image;
  let s = `<rect width="2000" height="2000" fill="#FF6A00"/>`;
  // Loud halftone dots in the frame.
  for (let y = 30; y < 2000; y += 60) for (let x = (y / 60) % 2 ? 30 : 60; x < 2000; x += 60) s += `<circle cx="${x}" cy="${y}" r="9" fill="#FF8A2A"/>`;
  // Envelope.
  const ex = 180;
  const ey = 260;
  const ew = 1640;
  const eh = 1520;
  for (let i = 0; i < 8; i++) s += `<rect x="${ex + 24 - i * 5}" y="${ey + 32 - i * 5}" width="${ew + i * 10}" height="${eh + i * 10}" rx="${14 + i * 5}" fill="#000" fill-opacity="0.05"/>`;
  s += `<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" rx="14" fill="#D9A441"/>`;
  s += `<path d="M${ex} ${ey} L${ex + ew / 2} ${ey + 520} L${ex + ew} ${ey}" fill="#C8923A"/>`;
  s += `<path d="M${ex} ${ey} L${ex + ew / 2} ${ey + 520} L${ex + ew} ${ey}" fill="none" stroke="#9E7128" stroke-width="6"/>`;
  // String-and-button clasp.
  s += `<circle cx="${ex + ew / 2}" cy="${ey + 470}" r="46" fill="#B89A5A" stroke="#6B5530" stroke-width="6"/><circle cx="${ex + ew / 2}" cy="${ey + 700}" r="46" fill="#B89A5A" stroke="#6B5530" stroke-width="6"/>`;
  s += `<path d="M${ex + ew / 2} ${ey + 470} C ${ex + ew / 2 + 150} ${ey + 520}, ${ex + ew / 2 - 150} ${ey + 640}, ${ex + ew / 2} ${ey + 700} C ${ex + ew / 2 + 200} ${ey + 760}, ${ex + ew / 2 + 260} ${ey + 900}, ${ex + ew / 2 + 120} ${ey + 980}" fill="none" stroke="#F4EBD5" stroke-width="7"/>`;
  // Routing lines.
  for (let i = 0; i < 6; i++) {
    const y = ey + 820 + i * 70;
    s += `<path d="M${ex + 60} ${y} H${ex + 700}" stroke="#9E7128" stroke-width="3"/>`;
  }
  s += text("TO: THE PARENT OR GUARDIAN OF", ex + 70, ey + 800, { font: FONTS.typewriter, size: 34, fill: "#3A2A10" });
  s += text("STUDENT ID #____", ex + 70, ey + 880, { font: FONTS.typewriter, size: 48, fill: "#3A2A10" });
  // White label with the headline.
  const lx = ex + 120;
  const ly = ey + 1080;
  const lw = ew - 240;
  s += `<rect x="${lx}" y="${ly}" width="${lw}" height="330" fill="#FFFFFF" stroke="#222" stroke-width="6" transform="rotate(-2 ${lx + lw / 2} ${ly + 165})"/>`;
  s += text(im.headline, lx + lw / 2, ly + 150, { font: FONTS.condensed, size: fit(im.headline, FONTS.condensed, 180, lw - 60), fill: "#111", anchor: "middle", rotate: -2 });
  s += text(im.subhead, lx + lw / 2, ly + 240, { font: FONTS.typewriter, size: fit(im.subhead, FONTS.typewriter, 58, lw - 80), fill: "#111", anchor: "middle", rotate: -2 });
  im.envelopeLines.slice(1).forEach((l, i) => {
    s += text(l, lx + lw / 2, ly + 290 + i * 34, { font: FONTS.mono, size: 26, fill: "#444", anchor: "middle", rotate: -2, weight: "bold" });
  });
  // CONFIDENTIAL stamp.
  s += `<g transform="rotate(-14 1000 560)"><rect x="440" y="440" width="1120" height="230" rx="16" fill="none" stroke="${RED}" stroke-width="22" stroke-opacity="0.9" stroke-dasharray="300 14 180 10 500 16"/>`;
  s += text(im.stamp, 1000, 610, { font: FONTS.stamp, size: fit(im.stamp, FONTS.stamp, 170, 1020), fill: RED, anchor: "middle", opacity: 0.9 }) + `</g>`;
  // Coffee ring.
  s += `<circle cx="1580" cy="1560" r="150" fill="#6F4527" fill-opacity="0.1"/><path d="${wobblyPath(Array.from({ length: 31 }, (_, i) => [1580 + Math.cos((i / 30) * Math.PI * 2) * 150, 1560 + Math.sin((i / 30) * Math.PI * 2) * 150] as [number, number]), r, 4, true)}" fill="none" stroke="#6F4527" stroke-width="14" stroke-opacity="0.45"/>`;
  // Harrow's scrawl.
  s += text(im.handwritten, 1000, 1880, { font: FONTS.harrow, size: 96, fill: "#FFFFFF", anchor: "middle", rotate: -3 });
  s += `<path d="${penLine(560, 1905, 1450, 1880, r, 4)}" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" fill="none"/>`;
  s += text("DO NOT CALL THE SCHOOL", 1000, 200, { font: FONTS.condensed, size: 110, fill: "#FFFFFF", anchor: "middle" });
  return svgDoc(s);
}

export function collectionSvg(): string {
  const r = art("extras", "collection");
  let s = `<rect width="2000" height="2000" fill="#FFD400"/>`;
  for (let i = 0; i < 12; i++) s += `<rect x="${-200 + i * 200}" y="-100" width="80" height="2400" fill="#FFC400" transform="rotate(25 1000 1000)"/>`;
  // Fanned stack of cards.
  const colors = ["#FFC9D9", "#D7EDCF", "#FFFFFF", "#F3EBD4", "#FFF3D2"];
  colors.forEach((c, i) => {
    s += `<rect x="330" y="300" width="1340" height="1500" rx="10" fill="${c}" stroke="#00000033" stroke-width="4" transform="rotate(${-14 + i * 6} 1000 1050)"/>`;
  });
  s += `<rect x="330" y="300" width="1340" height="1500" rx="10" fill="#FFFFFF" stroke="#1B2A6B" stroke-width="10" transform="rotate(4 1000 1050)"/>`;
  s += `<g transform="rotate(4 1000 1050)">`;
  s += text(COLLECTION.name.toUpperCase(), 1000, 520, { font: FONTS.slab, size: 190, fill: "#1B2A6B", anchor: "middle" });
  s += text("OFFICIAL · ROBINHOOD CHAIN · 3,333 STUDENTS", 1000, 600, { font: FONTS.mono, size: 44, fill: "#1B2A6B", anchor: "middle", weight: "bold" });
  s += text("F", 820, 1270, { font: FONTS.marker, size: 700, fill: RED, anchor: "middle", rotate: -6 });
  s += `<path d="${wobblyPath(Array.from({ length: 25 }, (_, i) => [820 + Math.cos(-0.5 + (i / 24) * Math.PI * 2.2) * 300, 1030 + Math.sin(-0.5 + (i / 24) * Math.PI * 2.2) * 330] as [number, number]), r, 10)}" fill="none" stroke="${RED}" stroke-width="16" stroke-linecap="round"/>`;
  s += text("SEE ME", 1330, 900, { font: FONTS.marker, size: 150, fill: RED, anchor: "middle", rotate: -12 });
  s += text("RETURN SIGNED BY MONDAY", 1000, 1690, { font: FONTS.condensed, size: 96, fill: RED, anchor: "middle" });
  s += `</g>`;
  s += `<path d="${scallopPath(1700, 1700, 190, 30, 0.07)}" fill="#F2C12E" stroke="#7A5A00" stroke-width="8"/>`;
  s += text("33", 1700, 1700, { font: FONTS.condensed, size: 140, fill: "#3A2A00", anchor: "middle" });
  s += text("ONE-OF-ONES", 1700, 1770, { font: FONTS.condensed, size: 40, fill: "#3A2A00", anchor: "middle" });
  s += splat(340, 1720, 70, r, "#6F4527", 0.35, 10);
  return svgDoc(s);
}

export const extrasGroup: ArtModule = {
  group: "extras",
  owns: ["extras"],
  files(): ArtFile[] {
    return [
      { layer: "extras", slug: "unrevealed", svg: unrevealedSvg() },
      { layer: "extras", slug: "collection", svg: collectionSvg() },
    ];
  },
};
