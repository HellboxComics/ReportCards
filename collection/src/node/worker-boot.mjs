// Worker entry: registers tsx so the TypeScript worker (and everything it
// imports) loads inside a worker thread, then hands over to worker.ts.
import { workerData } from "node:worker_threads";
import { register } from "tsx/esm/api";

register();
await import(workerData.entry);
