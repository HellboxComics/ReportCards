/**
 * Writes layer files: `npm run collection:layers [-- --group <name> ...]`.
 * Trait files are named <slug>#<target>.svg where <target> is the designed
 * quota from collection/src/catalog.ts (informational). Existing .svg files
 * for the same slug are replaced; .png overrides are never touched.
 */
import fs from "node:fs";
import path from "node:path";
import { GRADES_DIR, LAYERS, ONE_OF_ONE_DIR, type LayerKey } from "../src/catalog";
import { GENERATIVE_COUNT } from "../src/constants";
import { LAYERS_ROOT } from "../src/node/paths";
import { designTargets } from "../src/quotas";
import { statusQuotas, STATUS_KEY } from "../src/select";
import { GROUPS } from "./index";
import type { ArtFile, ArtModule } from "./types";

export function targetDir(f: ArtFile): string {
  if (f.layer === "grades") return GRADES_DIR;
  if (f.layer === "1of1") return ONE_OF_ONE_DIR;
  if (f.layer === "extras") return "extras";
  const dir = LAYERS[f.layer].dir;
  if (!dir) throw new Error(`layer ${f.layer} has no files`);
  return dir;
}

const weightCache = new Map<LayerKey, Map<string, number>>();
export function fileWeight(f: ArtFile): number | null {
  if (f.layer === "grades" || f.layer === "1of1" || f.layer === "extras") return null;
  let m = weightCache.get(f.layer);
  if (!m) {
    m = new Map();
    const layer = LAYERS[f.layer];
    if (f.layer === "status") {
      const q = statusQuotas();
      for (const v of layer.values) m.set(v.id, q[STATUS_KEY[v.id]]);
    } else if (layer.tierShares) {
      const t = designTargets(layer, GENERATIVE_COUNT);
      layer.values.forEach((v, i) => m!.set(v.id, t[i]));
    }
    weightCache.set(f.layer, m);
  }
  return m.get(f.slug) ?? null;
}

export function writeArtFile(f: ArtFile, root = LAYERS_ROOT): string {
  const dir = path.join(root, targetDir(f));
  fs.mkdirSync(dir, { recursive: true });
  for (const name of fs.readdirSync(dir)) {
    const m = /^(.+?)(?:#\d+)?\.svg$/.exec(name);
    if (m && m[1] === f.slug) fs.unlinkSync(path.join(dir, name));
  }
  const w = fileWeight(f);
  const file = path.join(dir, `${f.slug}${w === null ? "" : `#${w}`}.svg`);
  fs.writeFileSync(file, f.svg);
  return file;
}

async function main() {
  const args = process.argv.slice(2);
  const groups: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--group") groups.push(args[++i]);
    else if (args[i].startsWith("--group=")) groups.push(args[i].slice(8));
  }
  const names = groups.length ? groups : Object.keys(GROUPS);
  for (const name of names) {
    const load = GROUPS[name];
    if (!load) throw new Error(`unknown group "${name}". Groups: ${Object.keys(GROUPS).join(", ")}`);
    const t0 = Date.now();
    const mod: ArtModule = await load();
    const files = mod.files();
    const dirs = new Set<string>();
    for (const f of files) {
      writeArtFile(f);
      dirs.add(targetDir(f));
    }
    console.log(`[${name}] wrote ${files.length} files to ${[...dirs].join(", ")} in ${Date.now() - t0} ms`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
