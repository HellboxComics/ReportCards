/**
 * Layer file registry (node-only). Layer files live at
 *   collection/layers/<NN-Layer>/<slug>#<target>.svg
 * and a same-named .png overrides the .svg. The "#<target>" part is the
 * documented quota (informational: quotas come from collection/src/catalog.ts);
 * files may also omit it. Grade glyphs and one-of-ones have no weight.
 */
import fs from "node:fs";
import path from "node:path";
import { LAYERS_ROOT } from "./paths";

export interface LayerFile {
  readonly path: string;
  readonly kind: "svg" | "png";
  readonly slug: string;
  readonly weight: number | null;
}

const FILE_RE = /^(.+?)(?:#(\d+))?\.(svg|png)$/;

const dirCache = new Map<string, Map<string, LayerFile>>();

/** All files in a layer folder, keyed by slug (png wins over svg). */
export function listLayer(dir: string, root: string = LAYERS_ROOT): Map<string, LayerFile> {
  const key = path.join(root, dir);
  const hit = dirCache.get(key);
  if (hit) return hit;
  const out = new Map<string, LayerFile>();
  if (fs.existsSync(key)) {
    for (const name of fs.readdirSync(key).sort()) {
      const m = FILE_RE.exec(name);
      if (!m) continue;
      const file: LayerFile = {
        path: path.join(key, name),
        kind: m[3] as "svg" | "png",
        slug: m[1],
        weight: m[2] ? Number(m[2]) : null,
      };
      const prev = out.get(file.slug);
      if (!prev || (prev.kind === "svg" && file.kind === "png")) out.set(file.slug, file);
    }
  }
  dirCache.set(key, out);
  return out;
}

/** Forget cached listings/contents (after `collection:layers` rewrites files). */
export function clearLayerCache(): void {
  dirCache.clear();
  contentCache.clear();
}

export function layerFile(dir: string, slug: string): LayerFile {
  const f = listLayer(dir).get(slug);
  if (!f) throw new Error(`missing layer file ${dir}/${slug}(.svg|.png) under ${LAYERS_ROOT}`);
  return f;
}

interface ParsedSvg {
  kind: "svg";
  viewBox: [number, number, number, number];
  inner: string;
}
interface ParsedPng {
  kind: "png";
  dataUri: string;
  width: number;
  height: number;
}
type Parsed = ParsedSvg | ParsedPng;

const contentCache = new Map<string, Parsed>();

function parse(file: LayerFile): Parsed {
  const hit = contentCache.get(file.path);
  if (hit) return hit;
  let parsed: Parsed;
  if (file.kind === "png") {
    const buf = fs.readFileSync(file.path);
    parsed = { kind: "png", dataUri: `data:image/png;base64,${buf.toString("base64")}`, width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } else {
    const src = fs.readFileSync(file.path, "utf8");
    const open = /<svg\b[^>]*>/i.exec(src);
    const close = src.lastIndexOf("</svg>");
    if (!open || close < 0) throw new Error(`not an svg: ${file.path}`);
    const tag = open[0];
    const vb = /viewBox="([^"]+)"/.exec(tag);
    let viewBox: [number, number, number, number];
    if (vb) viewBox = vb[1].trim().split(/[\s,]+/).map(Number) as [number, number, number, number];
    else {
      const w = Number(/\bwidth="([\d.]+)/.exec(tag)?.[1] ?? 2000);
      const h = Number(/\bheight="([\d.]+)/.exec(tag)?.[1] ?? 2000);
      viewBox = [0, 0, w, h];
    }
    parsed = { kind: "svg", viewBox, inner: src.slice(open.index + tag.length, close) };
  }
  contentCache.set(file.path, parsed);
  return parsed;
}

/** Prefix every id defined in `inner` (and references to it) so layers can't collide. */
export function namespaceIds(inner: string, prefix: string): string {
  const ids = new Set<string>();
  for (const m of inner.matchAll(/\bid="([^"]+)"/g)) ids.add(m[1]);
  if (ids.size === 0) return inner;
  return inner
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (m, id: string) => (ids.has(id) ? `url(#${prefix}${id})` : m))
    .replace(/(\b(?:xlink:)?href)="#([^"]+)"/g, (m, attr: string, id: string) => (ids.has(id) ? `${attr}="#${prefix}${id}"` : m));
}

/**
 * The file as an SVG fragment placed at (x, y, w, h) in the parent. Full
 * 2000x2000 layer files are inlined as a <g>; others become a nested <svg>.
 */
export function embed(file: LayerFile, prefix: string, box = { x: 0, y: 0, w: 2000, h: 2000 }): string {
  const p = parse(file);
  if (p.kind === "png") {
    return `<image x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" preserveAspectRatio="none" href="${p.dataUri}"/>`;
  }
  const inner = namespaceIds(p.inner, prefix);
  const [vx, vy, vw, vh] = p.viewBox;
  if (vx === 0 && vy === 0 && vw === box.w && vh === box.h && box.x === 0 && box.y === 0) return `<g>${inner}</g>`;
  return `<svg x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" viewBox="${p.viewBox.join(" ")}" overflow="visible">${inner}</svg>`;
}
