/**
 * npm run collection:set-base-uri -- <uri> [--out DIR]
 *
 * Points every image at <uri>/<id>.png: rewrites collection/base-uri.ts (the
 * default for tokenMetadata() and the live endpoint) and the `image` field of
 * every generated metadata file, _metadata.json, collection.json and
 * unrevealed.json. Nothing else changes, so the metadata stays byte-identical
 * to a fresh `collection:generate -- --base-uri <uri>`.
 */
import fs from "node:fs";
import path from "node:path";
import { COLLECTION_ROOT, OUTPUT_ROOT } from "../node/paths";
import { fail, flag, parseArgs } from "./args";

const json = (v: unknown) => JSON.stringify(v, null, 2) + "\n";

function main() {
  const a = parseArgs();
  const uri = (a.positional[0] ?? flag(a, "uri") ?? fail("usage: npm run collection:set-base-uri -- <uri>")).replace(/\/+$/, "");
  if (!/^(ipfs|ar|https?):\/\/\S+$/.test(uri)) fail(`"${uri}" doesn't look like ipfs://, ar:// or http(s):// URI`);
  const out = path.resolve(flag(a, "out") ?? OUTPUT_ROOT);

  const cfg = path.join(COLLECTION_ROOT, "base-uri.ts");
  const src = fs.readFileSync(cfg, "utf8").replace(/export const BASE_URI = "[^"]*";/, `export const BASE_URI = ${JSON.stringify(uri)};`);
  fs.writeFileSync(cfg, src);

  const img = (file: string) => `${uri}/${file}`;
  let n = 0;
  const metaDir = path.join(out, "metadata");
  if (fs.existsSync(metaDir)) {
    for (const f of fs.readdirSync(metaDir)) {
      if (!/^\d+\.json$/.test(f)) continue;
      const p = path.join(metaDir, f);
      const m = JSON.parse(fs.readFileSync(p, "utf8"));
      m.image = img(`${m.edition}.png`);
      fs.writeFileSync(p, json(m));
      n++;
    }
    const allPath = path.join(metaDir, "_metadata.json");
    if (fs.existsSync(allPath)) {
      const all = JSON.parse(fs.readFileSync(allPath, "utf8")) as { edition: number; image: string }[];
      for (const m of all) m.image = img(`${m.edition}.png`);
      fs.writeFileSync(allPath, json(all));
    }
  }
  for (const [file, name] of [["collection.json", "collection.png"], ["unrevealed.json", "unrevealed.png"]]) {
    const p = path.join(out, file);
    if (!fs.existsSync(p)) continue;
    const m = JSON.parse(fs.readFileSync(p, "utf8"));
    m.image = img(name);
    fs.writeFileSync(p, json(m));
  }
  console.log(`base URI → ${uri} (collection/base-uri.ts + ${n} token files, _metadata.json, collection.json, unrevealed.json)`);
}

main();
