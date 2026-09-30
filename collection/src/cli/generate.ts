/**
 * npm run collection:generate -- [--count 3333] [--seed S] [--base-uri URI] [--no-images] [--out DIR] [--threads N]
 *
 * Writes, under collection/output (or --out):
 *   metadata/<id>.json, metadata/_metadata.json   token metadata (ids 1..count)
 *   images/<id>.png                               token images (unless --no-images)
 *   images/unrevealed.png, images/collection.png  placeholder + collection image
 *   rarity.json, provenance.json, collection.json, unrevealed.json
 * Refuses --count above MAX_SUPPLY (3,333). A full default run also refreshes
 * collection/preview/RARITY.md and rarity-curve.png.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { assertSupply, DEFAULT_SEED, MAX_SUPPLY } from "../constants";
import { allMetadata, collectionMetadata, unrevealedMetadata } from "../metadata";
import { rarityTable } from "../rarity";
import { selectCollection } from "../select";
import { rarityChartPng } from "../node/chart";
import { layerFile } from "../node/layers";
import { OUTPUT_ROOT, PREVIEW_ROOT } from "../node/paths";
import { defaultThreads, renderAll } from "../node/pool";
import { renderSvg } from "../node/render";
import { rarityJson, rarityMarkdown } from "../node/report";
import { BASE_URI } from "../../base-uri";
import { fail, flag, has, intFlag, parseArgs } from "./args";

const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

async function main() {
  const a = parseArgs();
  const count = intFlag(a, "count", MAX_SUPPLY);
  try {
    assertSupply(count);
  } catch (e) {
    fail((e as Error).message);
  }
  const seed = flag(a, "seed") ?? DEFAULT_SEED;
  const baseUri = flag(a, "base-uri") ?? BASE_URI;
  const out = path.resolve(flag(a, "out") ?? OUTPUT_ROOT);
  const images = !has(a, "no-images");
  const threads = intFlag(a, "threads", defaultThreads());

  const t0 = Date.now();
  const sel = selectCollection(seed);
  const table = rarityTable(sel);
  const all = allMetadata(seed, { baseUri }).slice(0, count);
  console.log(`selection + metadata for ${count} tokens in ${Date.now() - t0} ms (seed ${seed})`);

  const metaDir = path.join(out, "metadata");
  fs.mkdirSync(metaDir, { recursive: true });
  for (const f of fs.readdirSync(metaDir)) if (f.endsWith(".json")) fs.unlinkSync(path.join(metaDir, f));
  for (const m of all) fs.writeFileSync(path.join(metaDir, `${m.edition}.json`), json(m));
  fs.writeFileSync(path.join(metaDir, "_metadata.json"), json(all));
  fs.writeFileSync(path.join(out, "rarity.json"), json(rarityJson(sel)));
  fs.writeFileSync(path.join(out, "collection.json"), json({ ...collectionMetadata({ baseUri }), seed }));
  fs.writeFileSync(path.join(out, "unrevealed.json"), json(unrevealedMetadata(undefined, { baseUri })));
  console.log(`wrote ${all.length} metadata files + _metadata.json, rarity.json, collection.json, unrevealed.json → ${out}`);

  const provPath = path.join(out, "provenance.json");
  if (images) {
    const imgDir = path.join(out, "images");
    fs.mkdirSync(imgDir, { recursive: true });
    const t1 = Date.now();
    const results = await renderAll(
      all.map((m) => ({ id: m.edition, seed, out: path.join(imgDir, `${m.edition}.png`) })),
      {
        threads,
        onResult: (_r, done, total) => {
          if (done % 25 === 0 || done === total) process.stdout.write(`\r  rendered ${done}/${total} (${((Date.now() - t1) / done).toFixed(0)} ms/token wall, ${threads} threads)   `);
        },
      },
    );
    process.stdout.write("\n");
    for (const slug of ["unrevealed", "collection"]) {
      const svg = fs.readFileSync(layerFile("extras", slug).path, "utf8");
      fs.writeFileSync(path.join(imgDir, `${slug}.png`), renderSvg(svg));
    }
    const hashes = results.map((r) => r.sha256);
    const provenance = createHash("sha256").update(hashes.join("")).digest("hex");
    fs.writeFileSync(
      provPath,
      json({
        seed,
        maxSupply: MAX_SUPPLY,
        count,
        algorithm: "sha256",
        method: "provenanceHash = sha256(concat(sha256(image) for id 1..count, in id order))",
        provenanceHash: provenance,
        images: results.map((r) => ({ id: r.id, sha256: r.sha256 })),
      }),
    );
    const ms = results.map((r) => r.ms);
    const bytes = results.map((r) => r.bytes);
    const avg = (xs: number[]) => xs.reduce((x, y) => x + y, 0) / xs.length;
    console.log(
      `rendered ${results.length} images in ${((Date.now() - t1) / 1000).toFixed(1)} s · ${avg(ms).toFixed(0)} ms/token/core (max ${Math.max(...ms).toFixed(0)}) · PNG avg ${(avg(bytes) / 1024).toFixed(0)} KB (max ${(Math.max(...bytes) / 1024).toFixed(0)} KB) · provenance ${provenance}`,
    );
  } else if (!fs.existsSync(provPath) || JSON.parse(fs.readFileSync(provPath, "utf8")).seed !== seed) {
    fs.writeFileSync(provPath, json({ seed, maxSupply: MAX_SUPPLY, count, algorithm: "sha256", provenanceHash: null, note: "images not rendered yet: run collection:generate without --no-images" }));
  }

  if (seed === DEFAULT_SEED && count === MAX_SUPPLY) {
    fs.mkdirSync(PREVIEW_ROOT, { recursive: true });
    fs.writeFileSync(path.join(PREVIEW_ROOT, "RARITY.md"), rarityMarkdown(sel));
    fs.writeFileSync(path.join(PREVIEW_ROOT, "rarity-curve.png"), rarityChartPng(table));
    console.log(`refreshed ${path.relative(process.cwd(), PREVIEW_ROOT)}/RARITY.md and rarity-curve.png`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
