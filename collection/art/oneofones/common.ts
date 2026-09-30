/**
 * Shared scaffolding for the 33 one-of-ones (placeholder pass). Each 1/1 is
 * a full 2000x2000 image at collection/layers/1of1/<slug>.svg. The
 * placeholder composes: the piece's palette as a loud background, its gag
 * (drawn per slug in a.ts / b.ts), a tilted mini report card with its
 * bespoke grades and comment, a huge status stamp and a gold "1 OF 1" badge.
 *
 * Artists: replace a piece by rewriting its gag + composition in a.ts/b.ts
 * (or drop a same-named PNG next to the SVG). Follow the brief in
 * collection/copy/oneOfOnes.ts: `thumbnail` is the idea that must read at 300px.
 */
import { ONE_OF_ONES, type OneOfOne } from "../../copy/oneOfOnes";
import { SUBJECT_KEYS, SUBJECT_NAMES } from "../../src/catalog";
import { art, fitText, FONTS, measure, scallopPath, starPath, svgDoc, text, type Rng } from "../lib";
import type { ArtFile } from "../types";

export const RED = "#D3121C";

/** "#RRGGBB name" -> "#RRGGBB". */
export const hex = (p: string) => p.split(" ")[0];

export type Gag = (p: OneOfOne, r: Rng) => { under?: string; over?: string; card?: { x: number; y: number; rot: number; scale: number } };

export function fitSize(str: string, font: string, max: number, w: number): number {
  const m = measure(str, font, max);
  return m <= w ? max : Math.floor((max * w) / m);
}

/** A mini report card (800x1000 before scale) with the piece's own grades and comment. */
export function miniCard(p: OneOfOne, x: number, y: number, rot: number, scale: number, paper = "#FFFBEF", ink = "#1B2A6B"): string {
  const W = 800;
  const H = 1000;
  let s = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${scale}) translate(${-W / 2} ${-H / 2})">`;
  s += `<rect x="18" y="26" width="${W}" height="${H}" fill="#000" fill-opacity="0.3"/>`;
  s += `<rect width="${W}" height="${H}" fill="${paper}" stroke="#00000033" stroke-width="3"/>`;
  s += text(p.traits.School.toUpperCase(), 40, 80, { font: FONTS.slab, size: fitSize(p.traits.School.toUpperCase(), FONTS.slab, 52, W - 80), fill: ink });
  s += text(`${p.traits.Semester.toUpperCase()}`, 40, 130, { font: FONTS.mono, size: 30, fill: ink, weight: "bold" });
  s += `<rect x="40" y="150" width="${W - 80}" height="5" fill="${ink}"/>`;
  SUBJECT_KEYS.forEach((k, i) => {
    const yy = 230 + i * 105;
    s += text(SUBJECT_NAMES[k].toUpperCase(), 40, yy, { font: FONTS.mono, size: 30, fill: ink, weight: "bold" });
    const g = p.grades[k];
    s += text(g, W - 50, yy + 22, { font: FONTS.marker, size: fitSize(g, FONTS.marker, 92, 330), fill: RED, anchor: "end", rotate: -4 });
    s += `<rect x="40" y="${yy + 38}" width="${W - 80}" height="2" fill="${ink}" fill-opacity="0.35"/>`;
  });
  const fit = fitText(p.traits["Teacher Comment"], FONTS.harrow, 44, W - 80, 3, 24);
  fit.lines.forEach((l, i) => (s += text(l, 40, 880 + i * fit.size * 1.05, { font: FONTS.harrow, size: fit.size, fill: RED })));
  s += `</g>`;
  return s;
}

/** Huge rubber stamp with the piece's bespoke Status. */
export function bigStamp(str: string, x: number, y: number, rot: number, color: string, maxW = 1500, maxSize = 200): string {
  const size = fitSize(str, FONTS.stamp, maxSize, maxW - 100);
  const w = Math.min(maxW, measure(str, FONTS.stamp, size) + 100);
  const h = size * 1.25;
  return `<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="16" fill="none" stroke="${color}" stroke-width="${Math.max(12, size / 9)}" stroke-opacity="0.9"/>${text(str, x, y + size * 0.36, { font: FONTS.stamp, size, fill: color, anchor: "middle", opacity: 0.9 })}</g>`;
}

/** Gold "1 OF 1" badge. */
export function badge(x: number, y: number, n: number): string {
  return `<path d="${scallopPath(x, y, 118, 26, 0.07)}" fill="#F2C12E" stroke="#7A5A00" stroke-width="6"/><circle cx="${x}" cy="${y}" r="88" fill="none" stroke="#7A5A00" stroke-width="4"/>${text("1 OF 1", x, y + 6, { font: FONTS.condensed, size: 58, fill: "#3A2A00", anchor: "middle" })}${text(`No. ${n} of 33`, x, y + 48, { font: FONTS.condensed, size: 24, fill: "#3A2A00", anchor: "middle" })}`;
}

/** Title banner along the top. */
export function titleBanner(title: string, color: string, fg = "#FFFFFF"): string {
  const size = fitSize(title.toUpperCase(), FONTS.condensed, 130, 1700);
  return `<rect x="0" y="0" width="2000" height="${size + 70}" fill="${color}"/>${text(title.toUpperCase(), 1000, size + 20, { font: FONTS.condensed, size, fill: fg, anchor: "middle" })}`;
}

/** The placeholder composition shared by every 1/1. */
export function placeholder(p: OneOfOne, gag: Gag): string {
  const n = ONE_OF_ONES.indexOf(p) + 1;
  const r = art("1of1", p.slug);
  const pal = p.visual.palette.map(hex);
  const g = gag(p, r);
  const card = g.card ?? { x: 1000, y: 1090, rot: r.float(-6, 6), scale: 1.2 };
  let s = `<rect width="2000" height="2000" fill="${pal[0]}"/>`;
  s += g.under ?? "";
  s += miniCard(p, card.x, card.y, card.rot, card.scale);
  s += g.over ?? "";
  s += bigStamp(p.traits.Status, 1000, 1620, r.float(-10, -3), pal.find((c) => c.toUpperCase() !== pal[0].toUpperCase() && isStrong(c)) ?? RED);
  s += titleBanner(p.title, "#111111");
  s += badge(1830, 1830, n);
  return svgDoc(s);
}

function isStrong(c: string): boolean {
  const v = parseInt(c.slice(1), 16);
  const r = (v >> 16) & 255;
  const g = (v >> 8) & 255;
  const b = v & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min > 90 && max > 150;
}

export function oneOfOneFiles(range: [number, number], gags: Record<string, Gag>): ArtFile[] {
  return ONE_OF_ONES.slice(range[0] - 1, range[1]).map((p) => {
    const gag = gags[p.slug];
    if (!gag) throw new Error(`no art for one-of-one ${p.slug}`);
    return { layer: "1of1" as const, slug: p.slug, svg: placeholder(p, gag) };
  });
}

export { starPath };
