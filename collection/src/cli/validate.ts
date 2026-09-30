/**
 * npm run collection:validate [-- --seed S] [--out DIR] [--no-output]
 *
 * Full integrity + rules + rarity-curve check: supply cap, 1/1 placement,
 * grade/status coherence under the app's grading code, every trait's
 * conditions, exact quotas, token tiers, DNA uniqueness, metadata schema,
 * description uniqueness, layer files, and (unless --no-output) that
 * collection/output matches a fresh generation and its provenance hashes.
 */
import fs from "node:fs";
import path from "node:path";
import { BASE_URI } from "../../base-uri";
import { runAllChecks, type CheckResult } from "../checks";
import { DEFAULT_SEED } from "../constants";
import { allMetadata } from "../metadata";
import { selectCollection } from "../select";
import { checkLayerFiles, checkOutput } from "../node/checks-fs";
import { OUTPUT_ROOT } from "../node/paths";
import { flag, has, parseArgs } from "./args";

function main() {
  const a = parseArgs();
  const seed = flag(a, "seed") ?? DEFAULT_SEED;
  const out = path.resolve(flag(a, "out") ?? OUTPUT_ROOT);
  const t0 = Date.now();
  const sel = selectCollection(seed);
  // Use the base URI the output was generated with (collection.json), else the configured one.
  let baseUri = BASE_URI;
  const colPath = path.join(out, "collection.json");
  if (fs.existsSync(colPath)) baseUri = String(JSON.parse(fs.readFileSync(colPath, "utf8")).image).replace(/\/collection\.png$/, "");
  const all = allMetadata(seed, { baseUri });
  const results: CheckResult[] = [...runAllChecks(sel, all, baseUri), checkLayerFiles()];
  if (!has(a, "no-output")) results.push(checkOutput(out, all));
  let failed = 0;
  for (const r of results) {
    const ok = r.problems.length === 0;
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${r.name}`);
    for (const pr of r.problems.slice(0, 12)) console.log(`        - ${pr}`);
    if (r.problems.length > 12) console.log(`        ... ${r.problems.length - 12} more`);
  }
  console.log(`\n${results.length - failed}/${results.length} checks passed in ${Date.now() - t0} ms (seed ${seed})`);
  process.exit(failed ? 1 : 0);
}

main();
