/** Filesystem checks for `collection:validate`: layer files, generated output, provenance. */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ONE_OF_ONES } from "../../copy/oneOfOnes";
import { GRADES_DIR, gradeSlug, LAYERS, LETTERS, ONE_OF_ONE_DIR, type LayerDef } from "../catalog";
import type { CheckResult } from "../checks";
import { GENERATIVE_COUNT, MAX_SUPPLY } from "../constants";
import { GLYPH } from "../layout";
import type { TokenMetadata } from "../metadata";
import { designTargets } from "../quotas";
import { statusQuotas, STATUS_KEY } from "../select";
import { listLayer } from "./layers";
import { LAYERS_ROOT } from "./paths";

function readSvgBox(file: string): string | null {
  const src = fs.readFileSync(file, "utf8");
  const tag = /<svg\b[^>]*>/i.exec(src)?.[0];
  if (!tag || !src.trimEnd().endsWith("</svg>")) return null;
  return /viewBox="([^"]+)"/.exec(tag)?.[1].trim().replace(/[\s,]+/g, " ") ?? null;
}

function pngSize(file: string): [number, number] {
  const b = fs.readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

/** Every trait value has a file of the right size; no orphans; weights match the design. */
export function checkLayerFiles(root = LAYERS_ROOT): CheckResult {
  const p: string[] = [];
  const expectDir = (dir: string, slugs: readonly string[], w: number, h: number, weights?: Map<string, number>) => {
    const files = listLayer(dir, root);
    for (const slug of slugs) {
      const f = files.get(slug);
      if (!f) {
        p.push(`missing ${dir}/${slug}`);
        continue;
      }
      if (f.kind === "svg") {
        const vb = readSvgBox(f.path);
        if (vb !== `0 0 ${w} ${h}`) p.push(`${dir}/${path.basename(f.path)}: viewBox "${vb}", expected "0 0 ${w} ${h}"`);
      } else {
        const [pw, ph] = pngSize(f.path);
        if (pw / ph !== w / h || pw < w) p.push(`${dir}/${path.basename(f.path)}: ${pw}x${ph} png, expected ${w}x${h}`);
      }
      const want = weights?.get(slug);
      if (want !== undefined && f.weight !== null && f.weight !== want) p.push(`${dir}/${path.basename(f.path)}: #${f.weight} but the designed quota is ${want}`);
    }
    for (const slug of files.keys()) if (!slugs.includes(slug)) p.push(`orphan file ${dir}/${slug}`);
  };
  for (const def of Object.values(LAYERS) as LayerDef[]) {
    if (!def.dir) continue;
    let weights: Map<string, number> | undefined;
    if (def.tierShares) {
      const t = designTargets(def, GENERATIVE_COUNT);
      weights = new Map(def.values.map((v, i) => [v.id, t[i]]));
    } else if (def.key === "status") {
      const q = statusQuotas();
      weights = new Map(def.values.map((v) => [v.id, q[STATUS_KEY[v.id]]]));
    }
    expectDir(def.dir, def.values.map((v) => v.id), 2000, 2000, weights);
  }
  expectDir(GRADES_DIR, LETTERS.map(gradeSlug), GLYPH.w, GLYPH.h);
  expectDir(ONE_OF_ONE_DIR, ONE_OF_ONES.map((o) => o.slug), 2000, 2000);
  expectDir("extras", ["unrevealed", "collection"], 2000, 2000);
  return { name: "layer files: one per trait value, right size, no orphans", problems: p.slice(0, 80) };
}

/** Output folder matches a fresh generation (byte-equal metadata) and provenance matches images. */
export function checkOutput(out: string, expected: readonly TokenMetadata[]): CheckResult {
  const p: string[] = [];
  const metaDir = path.join(out, "metadata");
  if (!fs.existsSync(metaDir)) return { name: "output", problems: [`no ${metaDir}; run collection:generate`] };
  const files = fs.readdirSync(metaDir).filter((f) => /^\d+\.json$/.test(f));
  const ids = files.map((f) => Number(f.slice(0, -5))).sort((a, b) => a - b);
  if (ids.length !== MAX_SUPPLY) p.push(`${ids.length} metadata files, expected ${MAX_SUPPLY}`);
  if (ids.some((id, i) => id !== i + 1)) p.push("metadata ids are not exactly 1..3333");
  for (const id of ids) {
    if (id > MAX_SUPPLY) {
      p.push(`metadata for id ${id} exceeds max supply`);
      continue;
    }
    const got = fs.readFileSync(path.join(metaDir, `${id}.json`), "utf8");
    if (got !== JSON.stringify(expected[id - 1], null, 2) + "\n") p.push(`metadata/${id}.json differs from a fresh generation`);
    if (p.length > 20) break;
  }
  const allPath = path.join(metaDir, "_metadata.json");
  if (!fs.existsSync(allPath)) p.push("missing _metadata.json");
  else if (fs.readFileSync(allPath, "utf8") !== JSON.stringify(expected.slice(0, ids.length), null, 2) + "\n") p.push("_metadata.json differs from a fresh generation");
  for (const f of ["rarity.json", "collection.json", "unrevealed.json", "provenance.json"]) if (!fs.existsSync(path.join(out, f))) p.push(`missing ${f}`);
  const provPath = path.join(out, "provenance.json");
  const imgDir = path.join(out, "images");
  if (fs.existsSync(provPath) && fs.existsSync(imgDir)) {
    const prov = JSON.parse(fs.readFileSync(provPath, "utf8"));
    if (prov.images) {
      const hashes: string[] = [];
      for (const { id, sha256 } of prov.images as { id: number; sha256: string }[]) {
        const img = path.join(imgDir, `${id}.png`);
        if (!fs.existsSync(img)) {
          p.push(`image ${id}.png missing`);
          continue;
        }
        const h = createHash("sha256").update(fs.readFileSync(img)).digest("hex");
        if (h !== sha256) p.push(`image ${id}.png hash mismatch`);
        hashes.push(sha256);
        if (p.length > 40) break;
      }
      if (createHash("sha256").update(hashes.join("")).digest("hex") !== prov.provenanceHash) p.push("combined provenance hash mismatch");
    }
  }
  return { name: "output: metadata byte-identical to a fresh run; provenance matches images", problems: p };
}
