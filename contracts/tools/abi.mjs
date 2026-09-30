#!/usr/bin/env node
// Writes abi/ReportCards.json from the regular `forge build` artifact.
// (Deliberately not `forge inspect`: in forge 1.7.1 its partial compile can leave cached test
// artifacts without bytecode, and the next `forge test` then silently skips those suites.)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const artifact = new URL("../out/ReportCards.sol/ReportCards.json", import.meta.url);
const { abi } = JSON.parse(readFileSync(artifact, "utf8"));
if (!Array.isArray(abi) || abi.length === 0) throw new Error("No ABI in out/ReportCards.sol/ReportCards.json");

mkdirSync(new URL("../abi/", import.meta.url), { recursive: true });
writeFileSync(new URL("../abi/ReportCards.json", import.meta.url), JSON.stringify(abi, null, 2) + "\n");
console.log(`abi/ReportCards.json: ${abi.length} entries`);
