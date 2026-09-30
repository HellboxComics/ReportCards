#!/usr/bin/env node
// `forge`, pinned by package-lock.json and fed the pinned solcjs compiler.
//
// Two npm papercuts this file exists to paper over:
//  1. npm deletes node_modules/.bin/forge when it prunes @foundry-rs/forge's other-platform
//     optional packages (they all declare a `forge` bin), so we launch the package directly.
//  2. forge downloads native solc from binaries.soliditylang.org, which is not reachable
//     everywhere. We point it at tools/solc.mjs (see that file) unless FOUNDRY_SOLC is already
//     set; `FOUNDRY_SOLC=0.8.34 npm test` uses forge's own native download instead.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const launcher = require.resolve("@foundry-rs/forge/bin.mjs");

const env = { ...process.env, TARGET_TOOL: "forge" };
env.FOUNDRY_SOLC ??= fileURLToPath(new URL("./solc.mjs", import.meta.url));

const child = spawn(process.execPath, [launcher, ...process.argv.slice(2)], { stdio: "inherit", env });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
