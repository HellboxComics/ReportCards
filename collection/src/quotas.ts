/**
 * Turns a layer's designed rarity curve (tier shares) into exact per-value
 * quotas that sum to the token count, then makes them feasible:
 *   1. target = tierShare * N / (#values in tier)   (largest-remainder rounding)
 *   2. fixedCounts replace the target for specific values
 *   3. a conditional value never exceeds maxFill * (#tokens it is allowed on);
 *      nested pools (value A only allowed where B is) are capped together
 *   4. whatever is cut goes to the unconditional values of the same tier
 *      (or of the most common tier that has some), proportionally.
 */
import type { Tier } from "../copy/types";
import { TIERS, type LayerDef } from "./catalog";

/** Largest-remainder rounding of `weights` to integers summing to `total`. */
export function apportion(weights: readonly number[], total: number): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0) return weights.map(() => 0);
  const exact = weights.map((w) => (w / sum) * total);
  const out = exact.map((x) => Math.floor(x));
  let left = total - out.reduce((a, b) => a + b, 0);
  const order = exact
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (let k = 0; left > 0; k = (k + 1) % order.length, left--) out[order[k].i]++;
  return out;
}

/**
 * Design targets before feasibility (what SPEC.md tabulates): each tier's
 * share split evenly between its values, then fixedCounts override specific
 * values and the difference is spread over the others proportionally.
 */
export function designTargets(layer: LayerDef, n: number): number[] {
  const shares = layer.tierShares;
  if (!shares) throw new Error(`layer ${layer.key} has no tier shares`);
  const fixed = layer.fixedCounts ?? {};
  const weights = layer.values.map((v) => {
    const inTier = layer.values.filter((x) => x.tier === v.tier).length;
    return (shares[v.tier] ?? 0) / inTier;
  });
  const out = apportion(weights, n);
  const free = layer.values.map((v, i) => (v.id in fixed ? -1 : i)).filter((i) => i >= 0);
  const fixedTotal = Object.values(fixed).reduce((a, b) => a + b, 0);
  const rebalanced = apportion(free.map((i) => weights[i]), n - fixedTotal);
  free.forEach((i, k) => (out[i] = rebalanced[k]));
  layer.values.forEach((v, i) => {
    if (v.id in fixed) out[i] = fixed[v.id];
  });
  return out;
}

/**
 * Feasible quotas for this run. `eligibleSets[v]` is the list of token indexes
 * value v is allowed on (after `when` and token-side rules).
 */
export function feasibleQuotas(layer: LayerDef, n: number, eligibleSets: readonly Uint8Array[]): number[] {
  const q = designTargets(layer, n);
  const maxFill = layer.maxFill ?? 0.6;
  const V = layer.values.length;
  const size = eligibleSets.map((s) => s.reduce((a, b) => a + b, 0));
  // Values without a `when` are the layer's generic values: they absorb cuts and never pool.
  const unconditional = layer.values.map((v) => !v.when);

  // Pools: for each conditional value p, every value whose eligible set is a
  // subset of p's shares p's pool; the pool's total can't exceed maxFill*|p|.
  // Values with fixedCounts keep their count; the rest of the pool scales.
  const fixed = layer.fixedCounts ?? {};
  const isFixed = layer.values.map((v) => v.id in fixed);
  const words = Math.ceil(n / 32);
  const bits = eligibleSets.map((set) => {
    const b = new Uint32Array(words);
    for (let t = 0; t < n; t++) if (set[t]) b[t >>> 5] |= 1 << (t & 31);
    return b;
  });
  const subsetOf = (a: number, b: number) => {
    const A = bits[a];
    const B = bits[b];
    for (let w = 0; w < words; w++) if ((A[w] & ~B[w]) !== 0) return false;
    return true;
  };
  const members: number[][] = [];
  for (let p = 0; p < V; p++) {
    members.push([]);
    if (unconditional[p]) continue;
    for (let v = 0; v < V; v++) if (!unconditional[v] && subsetOf(v, p)) members[p].push(v);
  }
  for (let iter = 0; iter < 20; iter++) {
    let changed = false;
    for (let p = 0; p < V; p++) {
      if (unconditional[p]) continue;
      const fixedUsed = members[p].filter((v) => isFixed[v]).reduce((a, v) => a + q[v], 0);
      const scalable = members[p].filter((v) => !isFixed[v]);
      if (fixedUsed > size[p]) throw new Error(`layer ${layer.key}: fixed counts exceed the ${size[p]} eligible tokens`);
      // Tiny pools (e.g. the 3 valedictorians) may fill completely, one each.
      const base = Math.max(Math.floor(size[p] * maxFill), Math.min(size[p], scalable.length));
      const limit = Math.max(base - fixedUsed, 0);
      const used = scalable.reduce((a, v) => a + q[v], 0);
      if (used <= limit) continue;
      const scaled = apportion(scalable.map((v) => q[v]), limit);
      scalable.forEach((v, i) => {
        if (scaled[i] !== q[v]) changed = true;
        q[v] = scaled[i];
      });
    }
    if (!changed) break;
  }

  // Hand the cut back to unconditional values.
  const design = designTargets(layer, n);
  const cut = design.reduce((a, b) => a + b, 0) - q.reduce((a, b) => a + b, 0);
  if (cut > 0) {
    const byTier = new Map<Tier, number>();
    layer.values.forEach((v, i) => byTier.set(v.tier, (byTier.get(v.tier) ?? 0) + (design[i] - q[i])));
    const receivers = (tier: Tier) => layer.values.map((v, i) => (unconditional[i] && v.tier === tier ? i : -1)).filter((i) => i >= 0);
    let leftover = 0;
    for (const tier of TIERS) {
      const amount = byTier.get(tier) ?? 0;
      if (amount === 0) continue;
      const r = receivers(tier);
      if (r.length === 0) {
        leftover += amount;
        continue;
      }
      const extra = apportion(r.map((i) => q[i] || 1), amount);
      r.forEach((i, k) => (q[i] += extra[k]));
    }
    if (leftover > 0) {
      const tier = TIERS.find((t) => receivers(t).length > 0);
      if (!tier) throw new Error(`layer ${layer.key}: no unconditional value to absorb ${leftover} tokens`);
      const r = receivers(tier);
      const extra = apportion(r.map((i) => q[i] || 1), leftover);
      r.forEach((i, k) => (q[i] += extra[k]));
    }
  }
  return q;
}
