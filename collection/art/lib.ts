/**
 * Shared drawing helpers for every art group. Everything is deterministic:
 * jitter comes from seeded streams (`art(...)`), never Math.random.
 *
 * Rules for layer files (see SPEC.md "Art-module interface"):
 * - Full-canvas files are 2000x2000 with viewBox "0 0 2000 2000", transparent
 *   outside their art. Grade glyphs use a GLYPH.w x GLYPH.h viewBox.
 * - Only bundled font families (FONTS). Text is fine: resvg lays it out at
 *   render time with the bundled TTFs.
 * - No feGaussianBlur / feTurbulence on big areas at render time (slow). Use
 *   blurImage()/noiseImage() here: they pre-render a small PNG at build time
 *   and embed it, which costs nothing per token.
 */
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { FONTS } from "../src/fonts";
import { FONTS_DIR } from "../src/node/paths";
import { rng, type Rng } from "../src/prng";

export { FONTS };
export type { Rng };

export const W = 2000;

/** Seeded stream for art jitter: art("paper", "carbon"). */
export const art = (...parts: (string | number)[]): Rng => rng("art", ...parts);

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** A complete SVG document (single-shape `opacity` is flattened, see below). */
export function svgDoc(body: string, opts: { w?: number; h?: number; defs?: string } = {}): string {
  const w = opts.w ?? W;
  const h = opts.h ?? W;
  const defs = opts.defs ? `<defs>${opts.defs}</defs>` : "";
  return flattenOpacity(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>\n`,
  );
}

/**
 * resvg renders every element with `opacity` into its own full-canvas layer
 * (slow: ~10-20 ms each). For single shapes and text, fill-opacity and
 * stroke-opacity look the same and cost nothing, so rewrite them. Groups and
 * images keep `opacity` (use sparingly).
 */
export function flattenOpacity(svg: string): string {
  return svg.replace(/<(rect|circle|ellipse|path|text|line|polygon|polyline)\b([^>]*?)\sopacity="([\d.]+)"([^>]*?)(\/?)>/g, (_m, tag: string, a: string, op: string, b: string, slash: string) => {
    let rest = `${a}${b}`;
    const o = Number(op);
    for (const kind of ["fill", "stroke"]) {
      const re = new RegExp(`\\s${kind}-opacity="([\\d.]+)"`);
      const hit = re.exec(rest);
      if (hit) rest = rest.replace(re, ` ${kind}-opacity="${+(Number(hit[1]) * o).toFixed(4)}"`);
      else rest += ` ${kind}-opacity="${op}"`;
    }
    return `<${tag}${rest}${slash}>`;
  });
}

export const n = (x: number) => (Math.round(x * 10) / 10).toString();

type Attrs = Record<string, string | number | undefined>;
export function attrs(a: Attrs): string {
  return Object.entries(a)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}="${typeof v === "number" ? n(v) : esc(String(v))}"`)
    .join(" ");
}

/** <text> with sane defaults. `font` is a family name (use FONTS). */
export function text(
  str: string,
  x: number,
  y: number,
  o: {
    font: string;
    size: number;
    fill?: string;
    anchor?: "start" | "middle" | "end";
    weight?: string | number;
    rotate?: number;
    spacing?: number;
    opacity?: number;
    stroke?: string;
    strokeWidth?: number;
    style?: string;
    extra?: Attrs;
  },
): string {
  const t = o.rotate ? `rotate(${n(o.rotate)} ${n(x)} ${n(y)})` : undefined;
  return `<text ${attrs({
    x,
    y,
    "font-family": o.font,
    "font-size": o.size,
    "font-weight": o.weight,
    fill: o.fill ?? "currentColor",
    "text-anchor": o.anchor,
    "letter-spacing": o.spacing,
    opacity: o.opacity,
    stroke: o.stroke,
    "stroke-width": o.strokeWidth,
    "stroke-linejoin": o.stroke ? "round" : undefined,
    "paint-order": o.stroke ? "stroke" : undefined,
    transform: t,
    style: o.style,
    ...o.extra,
  })}>${esc(str)}</text>`;
}

/** Hand-drawn polyline through points with seeded wobble, as path data. */
export function wobblyPath(points: readonly [number, number][], r: Rng, amp = 3, closed = false): string {
  if (points.length < 2) return "";
  const j = () => (r.next() - 0.5) * 2 * amp;
  const pts = points.map(([x, y]) => [x + j(), y + j()] as [number, number]);
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2 + j();
    const my = (y0 + y1) / 2 + j();
    d += ` Q${n(mx)} ${n(my)} ${n(x1)} ${n(y1)}`;
  }
  return closed ? d + " Z" : d;
}

/** A wobbly straight stroke subdivided into segments. */
export function penLine(x1: number, y1: number, x2: number, y2: number, r: Rng, amp = 3, segs = 6): string {
  const pts: [number, number][] = [];
  for (let i = 0; i <= segs; i++) pts.push([x1 + ((x2 - x1) * i) / segs, y1 + ((y2 - y1) * i) / segs]);
  return wobblyPath(pts, r, amp);
}

/** Rough rectangle outline path. */
export function roughRect(x: number, y: number, w: number, h: number, r: Rng, amp = 3): string {
  return wobblyPath(
    [
      [x, y],
      [x + w / 2, y],
      [x + w, y],
      [x + w, y + h / 2],
      [x + w, y + h],
      [x + w / 2, y + h],
      [x, y + h],
      [x, y + h / 2],
      [x, y],
    ],
    r,
    amp,
  );
}

/** Irregular closed blob (stains, splats). */
export function blobPath(cx: number, cy: number, rad: number, r: Rng, lobes = 9, irregular = 0.35): string {
  const pts: [number, number][] = [];
  const k = lobes * 2;
  for (let i = 0; i < k; i++) {
    const a = (i / k) * Math.PI * 2;
    const rr = rad * (1 - irregular / 2 + r.next() * irregular);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }
  // Smooth closed curve through midpoints.
  let d = "";
  for (let i = 0; i < k; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % k];
    const mx = (p0[0] + p1[0]) / 2;
    const my = (p0[1] + p1[1]) / 2;
    d += i === 0 ? `M${n(mx)} ${n(my)}` : ` Q${n(p0[0])} ${n(p0[1])} ${n(mx)} ${n(my)}`;
  }
  const p0 = pts[0];
  const p1 = pts[1];
  d += ` Q${n(p0[0])} ${n(p0[1])} ${n((p0[0] + p1[0]) / 2)} ${n((p0[1] + p1[1]) / 2)} Z`;
  return d;
}

/** Splat: a blob plus satellite droplets. */
export function splat(cx: number, cy: number, rad: number, r: Rng, fill: string, opacity = 1, drops = 10): string {
  let s = `<path d="${blobPath(cx, cy, rad, r, 11, 0.55)}" fill="${fill}" opacity="${opacity}"/>`;
  for (let i = 0; i < drops; i++) {
    const a = r.next() * Math.PI * 2;
    const d = rad * (1.1 + r.next() * 0.9);
    const dr = rad * (0.04 + r.next() * 0.12);
    s += `<circle cx="${n(cx + Math.cos(a) * d)}" cy="${n(cy + Math.sin(a) * d)}" r="${n(dr)}" fill="${fill}" opacity="${opacity}"/>`;
  }
  return s;
}

/** Star polygon path. */
export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5, rot = -90): string {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const rr = i % 2 === 0 ? outer : inner;
    const a = ((rot + (i * 180) / points) * Math.PI) / 180;
    d += `${i === 0 ? "M" : "L"}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)} `;
  }
  return d + "Z";
}

/** Scalloped circle path (seals, stickers). */
export function scallopPath(cx: number, cy: number, rad: number, bumps = 24, depth = 0.06): string {
  let d = "";
  const steps = bumps * 8;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = rad * (1 - depth + depth * Math.cos(a * bumps));
    d += `${i === 0 ? "M" : "L"}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)} `;
  }
  return d + "Z";
}

/** Heart path centred at (cx, cy) with width ~ 2*s. */
export function heartPath(cx: number, cy: number, s: number): string {
  return `M${n(cx)} ${n(cy + s * 0.9)} C${n(cx - s * 1.6)} ${n(cy - s * 0.1)} ${n(cx - s * 0.7)} ${n(cy - s * 1.2)} ${n(cx)} ${n(cy - s * 0.35)} C${n(cx + s * 0.7)} ${n(cy - s * 1.2)} ${n(cx + s * 1.6)} ${n(cy - s * 0.1)} ${n(cx)} ${n(cy + s * 0.9)} Z`;
}

// ---------------------------------------------------------------------------
// Build-time raster helpers (pre-rendered, embedded as PNG data URIs)
// ---------------------------------------------------------------------------

let fontFilesCache: string[] | null = null;
export function fontFiles(): string[] {
  fontFilesCache ??= fs
    .readdirSync(FONTS_DIR)
    .filter((f) => f.endsWith(".ttf"))
    .sort()
    .map((f) => path.join(FONTS_DIR, f));
  return fontFilesCache;
}

function renderSmall(svg: string): Buffer {
  return new Resvg(svg, { font: { fontFiles: fontFiles(), loadSystemFonts: false, defaultFontFamily: FONTS.mono } })
    .render()
    .asPng();
}

/**
 * Blurred copy of `shapes` (drawn in a w x h box) as an <image> placed at
 * (x, y, w, h). Rendered at 1/scale resolution and smoothed up, so blur
 * costs nothing at token render time.
 */
export function blurImage(
  shapes: string,
  box: { x: number; y: number; w: number; h: number },
  blur: number,
  opts: { scale?: number; opacity?: number } = {},
): string {
  const scale = opts.scale ?? 8;
  const w = Math.ceil(box.w / scale);
  const h = Math.ceil(box.h / scale);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${box.w} ${box.h}"><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter><g filter="url(#b)">${shapes}</g></svg>`;
  const png = renderSmall(svg);
  return `<image ${attrs({ x: box.x, y: box.y, width: box.w, height: box.h, opacity: opts.opacity })} preserveAspectRatio="none" href="data:image/png;base64,${png.toString("base64")}"/>`;
}

/**
 * Low-frequency paper mottling as ONE embedded image covering `box`,
 * rendered at 1/scale and smoothed up. (A tiled <pattern> of noise costs
 * ~350 ms per render in resvg; one scaled image costs ~30 ms.) Keep alpha
 * low: noise inflates PNG size.
 */
export function noiseImage(
  box: { x: number; y: number; w: number; h: number },
  o: { freq?: number; octaves?: number; color: string; alpha: number; seed?: number; scale?: number },
): string {
  const scale = o.scale ?? 4;
  const w = Math.ceil(box.w / scale);
  const h = Math.ceil(box.h / scale);
  const [r, g, b] = hexRgb(o.color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><filter id="n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${o.freq ?? 0.08}" numOctaves="${o.octaves ?? 3}" seed="${o.seed ?? 1}"/><feColorMatrix values="0 0 0 0 ${r / 255} 0 0 0 0 ${g / 255} 0 0 0 0 ${b / 255} 0 0 0 ${o.alpha * 3} ${-o.alpha}"/></filter><rect width="${w}" height="${h}" filter="url(#n)"/></svg>`;
  const png = renderSmall(svg);
  return `<image ${attrs({ x: box.x, y: box.y, width: box.w, height: box.h })} preserveAspectRatio="none" href="data:image/png;base64,${png.toString("base64")}"/>`;
}

export function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Width of `str` in px for a bundled font (build-time, via resvg). */
const measureCache = new Map<string, number>();
export function measure(str: string, font: string, size: number, weight?: string | number): number {
  const key = `${font}|${size}|${weight ?? ""}|${str}`;
  const hit = measureCache.get(key);
  if (hit !== undefined) return hit;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4000" height="400"><text x="10" y="300" font-family="${font}" font-size="${size}"${weight ? ` font-weight="${weight}"` : ""}>${esc(str)}</text></svg>`;
  const bb = new Resvg(svg, { font: { fontFiles: fontFiles(), loadSystemFonts: false, defaultFontFamily: FONTS.mono } }).getBBox();
  const w = bb ? bb.width : str.length * size * 0.6;
  measureCache.set(key, w);
  return w;
}

/** Greedy word wrap to `maxWidth` using real glyph metrics. */
export function wrap(str: string, font: string, size: number, maxWidth: number, weight?: string | number): string[] {
  const words = str.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (line && measure(next, font, size, weight) > maxWidth) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Largest size <= maxSize (step 2) at which `str` fits in `maxLines` lines of `maxWidth`. */
export function fitText(
  str: string,
  font: string,
  maxSize: number,
  maxWidth: number,
  maxLines: number,
  minSize = 20,
): { size: number; lines: string[] } {
  for (let size = maxSize; size >= minSize; size -= 2) {
    const lines = wrap(str, font, size, maxWidth);
    if (lines.length <= maxLines && lines.every((l) => measure(l, font, size) <= maxWidth)) return { size, lines };
  }
  return { size: minSize, lines: wrap(str, font, minSize, maxWidth) };
}
