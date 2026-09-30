/**
 * npm run collection:layer-sheet -- --layer "<Layer>" --out DIR [--base ID] [--seed S]
 *
 * Renders every trait of one layer on the same base token (forced, rules
 * ignored), side by side: DIR/<layer>/<slug>.png (full 2000px),
 * DIR/<layer>/thumbs/<slug>.png (300px), DIR/<layer>-sheet.png (500px
 * cells) and DIR/<layer>-thumbs.png (300px cells, the marketplace view).
 * Layers: Background, Paper, School, Semester, Grades, Attendance,
 * Teacher Comment, Pen Marks, Doodle, Stain, Parent Signature, Incident, Status.
 */
import fs from "node:fs";
import path from "node:path";
import { STATUSES } from "../../copy/traits";
import { findLayer, gradeSlug, LAYERS, LETTERS, SUBJECT_KEYS } from "../catalog";
import { DEFAULT_SEED } from "../constants";
import type { Force } from "../force";
import { selectCollection } from "../select";
import { renderAll } from "../node/pool";
import { contactSheet } from "../node/sheet";
import { fail, flag, intFlag, parseArgs } from "./args";

async function main() {
  const a = parseArgs();
  const layerQ = flag(a, "layer") ?? fail('--layer "<Layer>" is required');
  const out = flag(a, "out") ?? fail("--out DIR is required");
  const seed = flag(a, "seed") ?? DEFAULT_SEED;
  const layer = findLayer(layerQ) ?? fail(`unknown layer "${layerQ}"`);
  const sel = selectCollection(seed);
  const firstGen = sel.tokens.find((t) => t.kind === "generative")!.id;
  const base = intFlag(a, "base", firstGen);
  if (sel.tokens[base - 1]?.kind !== "generative") fail(`--base ${base} must be a generated (not 1/1) token`);

  let variants: { slug: string; label: string; force: Force[] }[];
  let name: string;
  if (layer === "grades") {
    name = "Grades";
    variants = LETTERS.map((g) => ({ slug: gradeSlug(g), label: g, force: SUBJECT_KEYS.map((k) => ({ layer: k, value: g })) }));
  } else if (layer === "status") {
    name = "Status";
    variants = STATUSES.map((s) => ({ slug: s.id, label: s.name, force: [{ layer, value: s.key }] }));
  } else {
    const def = LAYERS[layer];
    name = def.key === "season" ? "Semester" : def.traitType;
    variants = def.values.map((v) => ({ slug: v.id, label: v.name, force: [{ layer, value: v.id }] }));
  }
  const dir = path.join(out, name.replace(/\s+/g, "-"));
  fs.mkdirSync(path.join(dir, "thumbs"), { recursive: true });
  // Each variant renders the base token with one forced value; ids repeat, so tag by index.
  const results = await renderAll(
    variants.map((v, i) => ({ id: base, seed, force: v.force, out: path.join(dir, `${v.slug}.png`), thumb: path.join(dir, "thumbs", `${v.slug}.png`), tag: i })),
  );
  const items = variants.map((v) => ({ png: fs.readFileSync(path.join(dir, "thumbs", `${v.slug}.png`)), label: v.label, sublabel: v.slug }));
  const big = variants.map((v) => ({ png: fs.readFileSync(path.join(dir, `${v.slug}.png`)), label: v.label, sublabel: v.slug }));
  fs.writeFileSync(path.join(out, `${name.replace(/\s+/g, "-")}-thumbs.png`), contactSheet(items, { cols: 6, title: `${name} — ${variants.length} traits on token #${base} (300px)` }));
  fs.writeFileSync(path.join(out, `${name.replace(/\s+/g, "-")}-sheet.png`), contactSheet(big, { cols: 4, cell: 500, title: `${name} — ${variants.length} traits on token #${base}` }));
  const avg = results.reduce((s, r) => s + r.ms, 0) / results.length;
  console.log(`${name}: ${variants.length} renders (avg ${avg.toFixed(0)} ms) → ${out}/${name.replace(/\s+/g, "-")}-sheet.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
