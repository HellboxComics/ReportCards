/**
 * npm run collection:sample -- --count N --seed S --out DIR [--force "Layer=Trait" ...] [--one-of-ones] [--ids 1,2,3]
 *
 * Renders N tokens (seeded pick; generated cards unless --one-of-ones) to
 * DIR/<id>.png, 300px thumbnails to DIR/thumbs/<id>.png, and a labelled
 * DIR/contact-sheet.png. Prints render time per token and PNG sizes.
 */
import fs from "node:fs";
import path from "node:path";
import { STATUS_BY_KEY } from "../../copy/traits";
import { DEFAULT_SEED, MAX_SUPPLY } from "../constants";
import { parseForce } from "../force";
import { rng } from "../prng";
import { selectCollection } from "../select";
import { defaultThreads, renderAll } from "../node/pool";
import { contactSheet } from "../node/sheet";
import { fail, flag, flags, has, intFlag, parseArgs } from "./args";

async function main() {
  const a = parseArgs();
  const out = flag(a, "out") ?? fail("--out DIR is required");
  const seed = flag(a, "seed") ?? DEFAULT_SEED;
  const count = intFlag(a, "count", 24);
  const forces = flags(a, "force").map(parseForce);
  const sel = selectCollection(seed);
  let ids: number[];
  const explicit = flag(a, "ids");
  if (explicit) ids = explicit.split(",").map((s) => Number(s.trim()));
  else {
    const pool = has(a, "one-of-ones") ? [...sel.oneOfOneIds] : sel.tokens.filter((t) => t.kind === "generative").map((t) => t.id);
    ids = rng(seed, "sample", count, forces.map((f) => `${f.layer}=${f.value}`).join(",")).shuffle(pool).slice(0, count).sort((x, y) => x - y);
  }
  for (const id of ids) if (!Number.isInteger(id) || id < 1 || id > MAX_SUPPLY) fail(`id ${id} outside 1..${MAX_SUPPLY}`);
  fs.mkdirSync(path.join(out, "thumbs"), { recursive: true });
  const t0 = Date.now();
  const results = await renderAll(
    ids.map((id) => ({ id, seed, out: path.join(out, `${id}.png`), thumb: path.join(out, "thumbs", `${id}.png`), force: forces })),
    { onResult: (r, done, total) => process.stdout.write(`\r  rendered ${done}/${total} (#${r.id} ${Math.round(r.ms)} ms, ${(r.bytes / 1024).toFixed(0)} KB)   `) },
  );
  process.stdout.write("\n");
  const items = ids.map((id) => {
    const t = sel.tokens[id - 1];
    const label = t.kind === "oneOfOne" ? `#${id} 1/1` : `#${id} ${STATUS_BY_KEY[t.status].name}`;
    const sub = t.kind === "oneOfOne" ? t.piece.title : `${t.traits.background} · ${t.traits.paper}`;
    return { png: fs.readFileSync(path.join(out, "thumbs", `${id}.png`)), label, sublabel: sub };
  });
  fs.writeFileSync(path.join(out, "contact-sheet.png"), contactSheet(items, { cols: 6, title: `Report Cards — ${ids.length} samples — seed ${seed}` }));
  const ms = results.map((r) => r.ms);
  const kb = results.map((r) => r.bytes / 1024);
  const avg = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length;
  const summary = {
    seed,
    ids,
    forces,
    threads: defaultThreads(),
    wallSeconds: (Date.now() - t0) / 1000,
    renderMsPerToken: { avg: Math.round(avg(ms)), max: Math.round(Math.max(...ms)), min: Math.round(Math.min(...ms)) },
    pngKB: { avg: Math.round(avg(kb)), max: Math.round(Math.max(...kb)), min: Math.round(Math.min(...kb)) },
  };
  fs.writeFileSync(path.join(out, "samples.json"), JSON.stringify(summary, null, 2) + "\n");
  console.log(JSON.stringify(summary.renderMsPerToken), "ms/token (per core)", JSON.stringify(summary.pngKB), "KB", `→ ${out}/contact-sheet.png`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
