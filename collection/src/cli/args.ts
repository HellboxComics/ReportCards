/** Minimal argv parsing for the collection CLIs. */
export interface Args {
  flags: Map<string, string[]>;
  positional: string[];
}

export function parseArgs(argv: readonly string[] = process.argv.slice(2)): Args {
  const flags = new Map<string, string[]>();
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const eq = a.indexOf("=");
      const key = eq > 0 ? a.slice(2, eq) : a.slice(2);
      let val: string;
      if (eq > 0) val = a.slice(eq + 1);
      else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) val = argv[++i];
      else val = "true";
      flags.set(key, [...(flags.get(key) ?? []), val]);
    } else positional.push(a);
  }
  return { flags, positional };
}

export const flag = (a: Args, k: string): string | undefined => a.flags.get(k)?.at(-1);
export const flags = (a: Args, k: string): string[] => a.flags.get(k) ?? [];
export const has = (a: Args, k: string): boolean => a.flags.has(k);

export function intFlag(a: Args, k: string, dflt: number): number {
  const v = flag(a, k);
  if (v === undefined) return dflt;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error(`--${k} must be an integer, got "${v}"`);
  return n;
}

export function fail(msg: string): never {
  console.error(`error: ${msg}`);
  process.exit(1);
}
