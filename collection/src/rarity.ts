/**
 * Statistical rarity: score = sum over visible traits of 1 / frequency
 * (frequency = count / 3,300 generated cards). Generated cards are ranked by
 * score (ties: lower id first) at ranks 34..3333 and cut into exact token
 * tiers; the 33 one-of-ones hold ranks 1..33 in comedy-bible order.
 */
import type { TokenTier } from "../copy/types";
import { GENERATIVE_COUNT, ONE_OF_ONE_COUNT } from "./constants";
import type { GenerativeToken, OneOfOneToken, Selection } from "./select";
import { visibleTraits } from "./traits";

export interface RarityInfo {
  readonly id: number;
  /** Statistical rarity score (sum of 1/frequency), 4 decimals. 1/1s: null. */
  readonly score: number | null;
  /** 1 = rarest. 1..33 are the one-of-ones. */
  readonly rank: number;
  readonly tier: TokenTier;
}

export interface RarityTable {
  readonly byId: readonly RarityInfo[]; // index id-1
  /** trait_type -> value -> count over the 3,300 generated cards. */
  readonly counts: Readonly<Record<string, Readonly<Record<string, number>>>>;
}

/** Exact token-tier counts over the 3,300 generated cards, rarest first. */
export const TOKEN_TIER_COUNTS: readonly [TokenTier, number][] = [
  ["Legendary", 33], // 1%
  ["Epic", 198], // 6%
  ["Rare", 396], // 12%
  ["Uncommon", 825], // 25%
  ["Common", 1848], // 56%
];

const cache = new WeakMap<Selection, RarityTable>();

export function rarityTable(sel: Selection): RarityTable {
  const hit = cache.get(sel);
  if (hit) return hit;
  const gens = sel.tokens.filter((t): t is GenerativeToken => t.kind === "generative");
  const traitsById = new Map<number, [string, string][]>();
  const counts: Record<string, Record<string, number>> = {};
  for (const t of gens) {
    const tr = visibleTraits(t);
    traitsById.set(t.id, tr);
    for (const [type, value] of tr) {
      const m = (counts[type] ??= {});
      m[value] = (m[value] ?? 0) + 1;
    }
  }
  const scored = gens.map((t) => {
    let s = 0;
    for (const [type, value] of traitsById.get(t.id)!) s += GENERATIVE_COUNT / counts[type][value];
    return { id: t.id, score: Math.round(s * 10000) / 10000 };
  });
  scored.sort((a, b) => b.score - a.score || a.id - b.id);

  const byId: RarityInfo[] = new Array(sel.tokens.length);
  const ones = sel.tokens.filter((t): t is OneOfOneToken => t.kind === "oneOfOne").sort((a, b) => a.number - b.number);
  if (ones.length !== ONE_OF_ONE_COUNT) throw new Error("expected 33 one-of-ones");
  ones.forEach((t, i) => (byId[t.id - 1] = { id: t.id, score: null, rank: i + 1, tier: "1 of 1" }));
  let pos = 0;
  for (const [tier, count] of TOKEN_TIER_COUNTS) {
    for (let k = 0; k < count; k++, pos++) {
      const { id, score } = scored[pos];
      byId[id - 1] = { id, score, rank: ONE_OF_ONE_COUNT + pos + 1, tier };
    }
  }
  if (pos !== gens.length) throw new Error("tier counts do not cover the generated cards");
  const table = { byId, counts };
  cache.set(sel, table);
  return table;
}
