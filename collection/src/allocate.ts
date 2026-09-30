/**
 * Quota-based allocation: give every token exactly one value so that value v
 * is used EXACTLY quotas[v] times and every token only gets values it is
 * eligible for. This is a bipartite b-matching; we build it with a seeded
 * greedy pass (most constrained values first, random eligible tokens) and
 * then repair leftovers with augmenting paths, so it always succeeds when a
 * valid assignment exists and fails loudly when none does.
 */
import type { Rng } from "./prng";

export interface AllocationInput {
  /** Human label for errors, e.g. "comment". */
  label: string;
  /** Number of tokens (indexed 0..n-1). */
  n: number;
  /** Target count per value; must sum to n. */
  quotas: readonly number[];
  /** eligible(t, v): may token t take value v? */
  eligible: (t: number, v: number) => boolean;
  rng: Rng;
}

export class AllocationError extends Error {}

/** Returns the value index for each token. */
export function allocate({ label, n, quotas, eligible, rng }: AllocationInput): Int32Array {
  const V = quotas.length;
  const total = quotas.reduce((a, b) => a + b, 0);
  if (total !== n) throw new AllocationError(`[${label}] quotas sum to ${total}, expected ${n}`);

  // Eligibility lists both ways.
  const tokensOf: number[][] = Array.from({ length: V }, () => []);
  const valuesOf: number[][] = Array.from({ length: n }, () => []);
  for (let t = 0; t < n; t++) {
    for (let v = 0; v < V; v++) {
      if (quotas[v] > 0 && eligible(t, v)) {
        tokensOf[v].push(t);
        valuesOf[t].push(v);
      }
    }
    if (valuesOf[t].length === 0) throw new AllocationError(`[${label}] token #${t} is eligible for nothing`);
  }
  for (let v = 0; v < V; v++) {
    if (tokensOf[v].length < quotas[v]) {
      throw new AllocationError(`[${label}] value #${v} needs ${quotas[v]} tokens but only ${tokensOf[v].length} are eligible`);
    }
  }

  const assign = new Int32Array(n).fill(-1);
  const members: Set<number>[] = Array.from({ length: V }, () => new Set());
  const cap = quotas.slice();

  // Greedy: scarcest values first (eligible / quota), random eligible tokens.
  const order = Array.from({ length: V }, (_, v) => v)
    .filter((v) => quotas[v] > 0)
    .sort((a, b) => tokensOf[a].length / quotas[a] - tokensOf[b].length / quotas[b] || a - b);
  for (const v of order) {
    for (const t of rng.shuffle(tokensOf[v])) {
      if (cap[v] === 0) break;
      if (assign[t] !== -1) continue;
      assign[t] = v;
      members[v].add(t);
      cap[v]--;
    }
  }

  // Repair: augmenting paths through full values to one with spare capacity.
  for (let u = 0; u < n; u++) {
    if (assign[u] !== -1) continue;
    if (!augment(u, valuesOf, members, cap, assign)) {
      throw new AllocationError(`[${label}] infeasible: no augmenting path for token #${u}`);
    }
  }
  return assign;
}

function augment(
  u: number,
  valuesOf: number[][],
  members: Set<number>[],
  cap: number[],
  assign: Int32Array,
): boolean {
  const V = cap.length;
  // via[w] = token that would move INTO w, and the value it leaves (or -1 = u itself).
  const viaTok = new Int32Array(V).fill(-2);
  const viaFrom = new Int32Array(V).fill(-1);
  const queue: number[] = [];
  for (const v of valuesOf[u]) {
    if (viaTok[v] !== -2) continue;
    viaTok[v] = u;
    viaFrom[v] = -1;
    if (cap[v] > 0) return apply(v, viaTok, viaFrom, members, cap, assign);
    queue.push(v);
  }
  for (let qi = 0; qi < queue.length; qi++) {
    const v = queue[qi];
    for (const t of members[v]) {
      for (const w of valuesOf[t]) {
        if (viaTok[w] !== -2) continue;
        viaTok[w] = t;
        viaFrom[w] = v;
        if (cap[w] > 0) return apply(w, viaTok, viaFrom, members, cap, assign);
        queue.push(w);
      }
    }
  }
  return false;
}

function apply(
  end: number,
  viaTok: Int32Array,
  viaFrom: Int32Array,
  members: Set<number>[],
  cap: number[],
  assign: Int32Array,
): boolean {
  cap[end]--;
  let w = end;
  for (;;) {
    const t = viaTok[w];
    const from = viaFrom[w];
    if (from !== -1) members[from].delete(t);
    members[w].add(t);
    assign[t] = w;
    if (from === -1) return true;
    w = from;
  }
}
