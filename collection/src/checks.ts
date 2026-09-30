/**
 * Integrity, rules and rarity-curve checks shared by `collection:validate`
 * and the test suite. Each check returns problems (empty = pass).
 */
import { letter } from "../../src/lib/grading";
import { GRADE_BAND } from "../copy/traits";
import type { Tier } from "../copy/types";
import { LAYERS, PEN_MARK_ANCHORS, SUBJECT_KEYS, TIERS } from "./catalog";
import { GENERATIVE_COUNT, MAX_SUPPLY, ONE_OF_ONE_COUNT } from "./constants";
import { gpaOf, gradesMatchStatus, worstSubject } from "./grades";
import type { TokenMetadata } from "./metadata";
import { designTargets } from "./quotas";
import { rarityTable, TOKEN_TIER_COUNTS } from "./rarity";
import { matchesWhen, tokenAllows } from "./rules";
import { ALLOCATION_ORDER, cardView, STATUS_ID, statusQuotas, type GenerativeToken, type Selection } from "./select";
import { TRAIT_TYPES } from "./traits";

export interface CheckResult {
  name: string;
  problems: string[];
}

const gens = (sel: Selection) => sel.tokens.filter((t): t is GenerativeToken => t.kind === "generative");

export function checkSupply(sel: Selection): CheckResult {
  const p: string[] = [];
  if (sel.tokens.length !== MAX_SUPPLY) p.push(`${sel.tokens.length} tokens, expected ${MAX_SUPPLY}`);
  sel.tokens.forEach((t, i) => {
    if (!t || t.id !== i + 1) p.push(`slot ${i + 1} holds token ${t?.id}`);
  });
  const ones = sel.tokens.filter((t) => t.kind === "oneOfOne");
  if (ones.length !== ONE_OF_ONE_COUNT) p.push(`${ones.length} one-of-ones, expected ${ONE_OF_ONE_COUNT}`);
  if (gens(sel).length !== GENERATIVE_COUNT) p.push(`${gens(sel).length} generated, expected ${GENERATIVE_COUNT}`);
  return { name: "supply: exactly 3,333 tokens, ids 1..3333, 33 one-of-ones", problems: p };
}

export function checkOneOfOnePlacement(sel: Selection): CheckResult {
  const p: string[] = [];
  const ids = sel.oneOfOneIds;
  const slugs = new Set(sel.tokens.flatMap((t) => (t.kind === "oneOfOne" ? [t.piece.slug] : [])));
  if (slugs.size !== ONE_OF_ONE_COUNT) p.push(`${slugs.size} distinct one-of-one pieces`);
  if (ids.every((id) => id <= ONE_OF_ONE_COUNT)) p.push("one-of-ones are all at the start");
  let run = 1;
  for (let i = 1; i < ids.length; i++) {
    run = ids[i] === ids[i - 1] + 1 ? run + 1 : 1;
    if (run > 3) p.push(`more than 3 consecutive one-of-one ids ending at ${ids[i]}`);
  }
  const spread = ids[ids.length - 1] - ids[0];
  if (spread < MAX_SUPPLY / 2) p.push(`one-of-ones clustered: ids span only ${spread}`);
  return { name: "one-of-ones at seeded, non-sequential ids", problems: p };
}

/** Every generated card obeys the rules (app grading semantics + copy `when`s + generator rules). */
export function checkRules(sel: Selection): CheckResult {
  const p: string[] = [];
  for (const t of gens(sel)) {
    const c = cardView(t);
    const liquidated = c.incident === "LIQUIDATED";
    for (const k of SUBJECT_KEYS) if (letter(t.scores[k]) !== t.grades[k]) p.push(`#${t.id} ${k}: letter(${t.scores[k]}) != ${t.grades[k]}`);
    if (!gradesMatchStatus(t.status, t.scores, liquidated)) p.push(`#${t.id} grades don't produce ${t.status} under src/lib/grading.ts`);
    if (liquidated && (t.status !== "EXPELLED" || t.grades.riskManagement !== "F")) p.push(`#${t.id} LIQUIDATED but ${t.status} / RM ${t.grades.riskManagement}`);
    if ((c.season === "SUMMER") !== (c.school === "summer-school")) p.push(`#${t.id} summer/summer-school mismatch`);
    if (Math.abs(gpaOf(t.scores) - t.gpa) > 1e-9) p.push(`#${t.id} GPA ${t.gpa} != ${gpaOf(t.scores)}`);
    for (const key of ALLOCATION_ORDER) {
      const id = t.traits[key];
      const v = LAYERS[key].values.find((x) => x.id === id);
      if (!v) {
        p.push(`#${t.id} unknown ${key} ${id}`);
        continue;
      }
      if (!matchesWhen(v.when, c)) p.push(`#${t.id} ${key}=${id} violates its when`);
      if (!tokenAllows(key, id, c)) p.push(`#${t.id} ${key}=${id} violates a generator rule`);
    }
    const sv = LAYERS.status.values.find((x) => x.id === STATUS_ID[t.status])!;
    if (!matchesWhen(sv.when, c)) p.push(`#${t.id} status when`);
    const anchor = PEN_MARK_ANCHORS[t.traits.penMarks];
    if (anchor === "firstF" && (t.penAnchor === null || t.grades[SUBJECT_KEYS[t.penAnchor]] !== "F")) p.push(`#${t.id} ${t.traits.penMarks} not on an F`);
    if (anchor === "worst" && t.penAnchor !== SUBJECT_KEYS.indexOf(worstSubject(t.scores)!)) p.push(`#${t.id} underline not on worst subject`);
    if (!anchor && t.penAnchor !== null) p.push(`#${t.id} unexpected pen anchor`);
    if (p.length > 50) break;
  }
  return { name: "rules: grades match status (app grading), trait conditions, coherence", problems: p };
}

/** Allocated counts equal the quotas; status curve exact. */
export function checkQuotas(sel: Selection): CheckResult {
  const p: string[] = [];
  const g = gens(sel);
  for (const key of ALLOCATION_ORDER) {
    const counts = new Map<string, number>();
    for (const t of g) counts.set(t.traits[key], (counts.get(t.traits[key]) ?? 0) + 1);
    for (const q of sel.quotas[key]) if ((counts.get(q.valueId) ?? 0) !== q.count) p.push(`${key}:${q.valueId} has ${counts.get(q.valueId) ?? 0}, quota ${q.count}`);
    const total = sel.quotas[key].reduce((a, q) => a + q.count, 0);
    if (total !== GENERATIVE_COUNT) p.push(`${key} quotas sum to ${total}`);
  }
  const sq = statusQuotas();
  const sc = new Map<string, number>();
  for (const t of g) sc.set(t.status, (sc.get(t.status) ?? 0) + 1);
  for (const [k, v] of Object.entries(sq)) if ((sc.get(k) ?? 0) !== v) p.push(`status ${k}: ${sc.get(k) ?? 0} != ${v}`);
  if (sq.VALEDICTORIAN > 3) p.push("more than 3 valedictorians");
  return { name: "quotas: every value used exactly its quota; status curve exact", problems: p };
}

/** Token tiers exact; each layer's tier shares near its design; tiers monotone in frequency. */
export function checkCurve(sel: Selection, tolerance = 0.02): CheckResult {
  const p: string[] = [];
  const table = rarityTable(sel);
  for (const [tier, count] of TOKEN_TIER_COUNTS) {
    const n = table.byId.filter((r) => r.tier === tier).length;
    if (n !== count) p.push(`token tier ${tier}: ${n} != ${count}`);
  }
  if (table.byId.filter((r) => r.tier === "1 of 1").length !== ONE_OF_ONE_COUNT) p.push("1 of 1 tier count");
  const ranks = new Set(table.byId.map((r) => r.rank));
  if (ranks.size !== MAX_SUPPLY || Math.min(...ranks) !== 1 || Math.max(...ranks) !== MAX_SUPPLY) p.push("ranks are not a permutation of 1..3333");
  for (const key of ALLOCATION_ORDER) {
    const def = LAYERS[key];
    if (!def.tierShares) continue;
    const actual: Partial<Record<Tier, number>> = {};
    const design: Partial<Record<Tier, number>> = {};
    const targets = designTargets(def, GENERATIVE_COUNT);
    sel.quotas[key].forEach((q, i) => {
      const tier = def.values[i].tier;
      actual[tier] = (actual[tier] ?? 0) + q.count / GENERATIVE_COUNT;
      design[tier] = (design[tier] ?? 0) + targets[i] / GENERATIVE_COUNT;
    });
    const tol = key === "comment" ? 0.06 : tolerance;
    for (const tier of TIERS) {
      const d = design[tier] ?? 0;
      const a = actual[tier] ?? 0;
      if (Math.abs(d - a) > tol) p.push(`${key} ${tier}: ${(a * 100).toFixed(1)}% vs design ${(d * 100).toFixed(1)}%`);
    }
    if ((actual.Legendary ?? 0) > 0.0101) p.push(`${key} Legendary share ${(actual.Legendary! * 100).toFixed(2)}% > 1%`);
    // Monotone design: a rarer tier's values are never designed more common than a commoner tier's.
    if (key !== "comment") {
      for (let i = 0; i < TIERS.length; i++) {
        for (let j = i + 1; j < TIERS.length; j++) {
          const common = targets.filter((_, k) => def.values[k].tier === TIERS[i]);
          const rarer = targets.filter((_, k) => def.values[k].tier === TIERS[j]);
          if (common.length && rarer.length && Math.max(...rarer) > Math.min(...common)) p.push(`${key}: a ${TIERS[j]} value is designed more common than a ${TIERS[i]} value`);
        }
      }
    }
  }
  return { name: "rarity curve: exact token tiers, layer tier shares, monotone tiers", problems: p };
}

export function checkDna(sel: Selection): CheckResult {
  const seen = new Map<string, number>();
  const p: string[] = [];
  for (const t of sel.tokens) {
    if (!/^[0-9a-f]{64}$/.test(t.dna)) p.push(`#${t.id} bad dna`);
    const prev = seen.get(t.dna);
    if (prev) p.push(`#${t.id} duplicates the DNA of #${prev}`);
    seen.set(t.dna, t.id);
  }
  return { name: "DNA: every token unique", problems: p };
}

/** OpenSea / ERC-721 metadata shape for a full metadata array (ids 1..n). */
export function checkMetadata(all: readonly TokenMetadata[], baseUri?: string): CheckResult {
  const p: string[] = [];
  const ranks = new Set<number>();
  all.forEach((m, i) => {
    const id = i + 1;
    const where = `#${id}`;
    if (m.edition !== id) p.push(`${where} edition ${m.edition}`);
    if (!new RegExp(`^Report Card #${id}( — .+)?$`).test(m.name)) p.push(`${where} name "${m.name}"`);
    if (typeof m.description !== "string" || m.description.length < 40) p.push(`${where} description too short`);
    if (!m.image.endsWith(`/${id}.png`) || (baseUri && m.image !== `${baseUri.replace(/\/+$/, "")}/${id}.png`)) p.push(`${where} image ${m.image}`);
    if (!/^[0-9a-f]{64}$/.test(m.dna)) p.push(`${where} dna`);
    const types = m.attributes.map((a) => a.trait_type);
    if (new Set(types).size !== types.length) p.push(`${where} duplicate trait types`);
    for (const t of TRAIT_TYPES) if (!types.includes(t)) p.push(`${where} missing ${t}`);
    for (const a of m.attributes) {
      if ("display_type" in a) {
        if (a.display_type !== "number" || typeof a.value !== "number") p.push(`${where} ${a.trait_type} not numeric`);
      } else if (typeof a.value !== "string" || a.value.length === 0) p.push(`${where} ${a.trait_type} empty`);
    }
    const gpa = m.attributes.find((a) => a.trait_type === "GPA");
    if (!gpa || typeof gpa.value !== "number" || gpa.value < 0 || gpa.value > 4.33) p.push(`${where} GPA`);
    const tier = m.attributes.find((a) => a.trait_type === "Rarity Tier");
    if (!tier || !["Common", "Uncommon", "Rare", "Epic", "Legendary", "1 of 1"].includes(String(tier.value))) p.push(`${where} Rarity Tier`);
    const rank = m.attributes.find((a) => a.trait_type === "Rarity Rank");
    if (!rank || typeof rank.value !== "number" || rank.value < 1 || rank.value > MAX_SUPPLY) p.push(`${where} Rarity Rank`);
    else ranks.add(rank.value);
    const one = m.attributes.find((a) => a.trait_type === "1 of 1");
    if ((tier?.value === "1 of 1") !== (one?.value === "Yes")) p.push(`${where} 1 of 1 flags disagree`);
    for (const k of SUBJECT_KEYS) {
      const g = m.attributes.find((a) => a.trait_type === ({ buyingTheTop: "Buying the Top", takingProfit: "Taking Profit", riskManagement: "Risk Management", holdingBags: "Holding Bags", chasingMemes: "Chasing Memes", sellingTooEarly: "Selling Too Early" } as const)[k]);
      if (tier?.value !== "1 of 1" && !(String(g?.value) in GRADE_BAND)) p.push(`${where} grade ${k}=${g?.value}`);
    }
  });
  if (ranks.size !== all.length) p.push(`rarity ranks not unique (${ranks.size}/${all.length})`);
  return { name: "metadata: ERC-721/OpenSea schema", problems: p.slice(0, 60) };
}

export function descriptionUniqueness(all: readonly TokenMetadata[]): number {
  return new Set(all.map((m) => m.description)).size / all.length;
}

export function checkDescriptions(all: readonly TokenMetadata[], min = 0.99): CheckResult {
  const u = descriptionUniqueness(all);
  return { name: `descriptions: >= ${min * 100}% unique`, problems: u >= min ? [] : [`only ${(u * 100).toFixed(2)}% unique`] };
}

export function runAllChecks(sel: Selection, all: readonly TokenMetadata[], baseUri?: string): CheckResult[] {
  return [
    checkSupply(sel),
    checkOneOfOnePlacement(sel),
    checkRules(sel),
    checkQuotas(sel),
    checkCurve(sel),
    checkDna(sel),
    checkMetadata(all, baseUri),
    checkDescriptions(all),
  ];
}
