/** Render worker: receives RenderTask messages, writes PNGs, replies with hashes. */
import { createHash } from "node:crypto";
import fs from "node:fs";
import { parentPort } from "node:worker_threads";
import { applyForce, type Force } from "../force";
import { selectCollection } from "../select";
import { composeTokenSvg } from "./compose";
import { renderSvg } from "./render";

export interface RenderTask {
  id: number;
  seed: string;
  out?: string;
  thumb?: string;
  thumbWidth?: number;
  force?: Force[];
  lenient?: boolean;
  /** Free-form tag echoed back (layer sheets render one id many times). */
  tag?: number;
}
export interface RenderResult {
  id: number;
  tag?: number;
  ms: number;
  bytes: number;
  sha256: string;
}

export function runTask(task: RenderTask): RenderResult {
  const t0 = performance.now();
  let token = selectCollection(task.seed).tokens[task.id - 1];
  if (task.force?.length && token.kind === "generative") token = applyForce(token, task.force);
  const svg = composeTokenSvg(token, { lenient: task.lenient });
  const png = renderSvg(svg);
  const ms = performance.now() - t0;
  if (task.out) fs.writeFileSync(task.out, png);
  if (task.thumb) fs.writeFileSync(task.thumb, renderSvg(svg, { width: task.thumbWidth ?? 300 }));
  return { id: task.id, tag: task.tag, ms, bytes: png.length, sha256: createHash("sha256").update(png).digest("hex") };
}

if (parentPort) {
  const port = parentPort;
  port.on("message", (task: RenderTask) => {
    try {
      port.postMessage({ ok: true, result: runTask(task) });
    } catch (e) {
      port.postMessage({ ok: false, id: task.id, error: e instanceof Error ? e.stack ?? e.message : String(e) });
    }
  });
}
