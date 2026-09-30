#!/usr/bin/env node
// Hermetic `solc` for Foundry.
//
// Runs the npm-pinned solcjs (the official compiler built to WebAssembly, version locked in
// package-lock.json) behind the tiny slice of the native `solc` CLI that Foundry talks to:
//
//   solc --version            -> "Version: 0.8.34+commit.<hash>..." (Foundry parses the last line)
//   solc --standard-json ...  -> Standard JSON input on stdin, Standard JSON output on stdout
//
// Why: `forge` normally downloads native compilers from binaries.soliditylang.org, which some CI
// runners and sandboxes cannot reach. Same compiler version + same settings = the same bytecode,
// so this changes where the compiler comes from, not what it produces.
//
// tools/forge.mjs points Foundry here via FOUNDRY_SOLC. A dev with Foundry installed can ignore
// all of this and run plain `forge test`, which uses the native solc pinned in foundry.toml.
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const solc = require("solc");
const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  // "0.8.34+commit.80d5c536.Emscripten.clang" -> "0.8.34+commit.80d5c536"
  const version = solc.version().replace(/\.Emscripten\.clang$/, "");
  process.stdout.write(`solc, the solidity compiler commandline interface\nVersion: ${version}\n`);
  process.exit(0);
}

if (!args.includes("--standard-json")) {
  process.stderr.write(
    `tools/solc.mjs only implements --version and --standard-json (got: ${args.join(" ") || "nothing"}).\n`,
  );
  process.exit(1);
}

// Foundry inlines every source's content, but answer import callbacks from disk anyway so the
// shim also works for callers that pass only paths.
const roots = [process.cwd()];
for (let i = 0; i < args.length; i++) {
  if ((args[i] === "--base-path" || args[i] === "--include-path") && args[i + 1]) roots.push(args[++i]);
}
function findImports(importPath) {
  for (const root of roots) {
    const candidate = path.resolve(root, importPath);
    if (existsSync(candidate)) return { contents: readFileSync(candidate, "utf8") };
  }
  return { error: `File not found: ${importPath}` };
}

const input = readFileSync(0, "utf8");
process.stdout.write(solc.compile(input, { import: findImports }));
