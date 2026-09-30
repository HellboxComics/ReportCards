/**
 * A small worker-thread pool for rendering (one worker per CPU, max 4 by
 * default). Tasks are handed out one at a time, so slow tokens don't stall
 * a whole batch. Results come back in completion order; callers sort.
 */
import os from "node:os";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import type { RenderResult, RenderTask } from "./worker";

export function defaultThreads(): number {
  return Math.max(1, Math.min(4, os.availableParallelism?.() ?? os.cpus().length));
}

export async function renderAll(
  tasks: readonly RenderTask[],
  opts: { threads?: number; onResult?: (r: RenderResult, done: number, total: number) => void } = {},
): Promise<RenderResult[]> {
  const threads = Math.min(opts.threads ?? defaultThreads(), Math.max(1, tasks.length));
  const boot = fileURLToPath(new URL("./worker-boot.mjs", import.meta.url));
  const entry = new URL("./worker.ts", import.meta.url).href;
  const results: RenderResult[] = [];
  let next = 0;
  let failed: Error | null = null;
  await Promise.all(
    Array.from({ length: threads }, () =>
      new Promise<void>((resolve, reject) => {
        const w = new Worker(boot, { workerData: { entry } });
        const feed = () => {
          if (failed || next >= tasks.length) {
            void w.terminate().then(() => resolve());
            return;
          }
          w.postMessage(tasks[next++]);
        };
        w.on("message", (m: { ok: boolean; result?: RenderResult; id?: number; error?: string }) => {
          if (!m.ok) {
            failed = new Error(`token ${m.id} failed:\n${m.error}`);
            void w.terminate();
            reject(failed);
            return;
          }
          results.push(m.result!);
          opts.onResult?.(m.result!, results.length, tasks.length);
          feed();
        });
        w.on("error", (e: Error) => {
          failed = e;
          reject(e);
        });
        w.once("online", feed);
      }),
    ),
  );
  return results.sort((a, b) => a.id - b.id || (a.tag ?? 0) - (b.tag ?? 0));
}
