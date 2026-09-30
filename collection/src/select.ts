/**
 * Selection: decides every trait of every token for a seed, with no
 * rendering. Pipeline (all seeded, all exact):
 *   1. 33 one-of-ones -> seeded-random ids.
 *   2. Status -> exact quotas, shuffled over the 3,300 generated ids.
 *   3. Liquidations -> a fixed number of EXPELLED cards (withdrawal notice).
 *   4. Grades -> six scores per card that the app's grading code maps back to
 *      exactly that status (a few subjects left Incomplete).
 *   5. Incident, School, Semester, Paper, Background, Attendance, Pen Marks,
 *      Doodle, Stain, Parent Signature, Teacher Comment -> quota allocator,
 *      each only onto cards its rules allow.
 *   6. DNA uniqueness, cosmetic details (rotation, remarks), GPA.
 * Computed once per seed and cached; per-token lookups are O(1).
 */
import { createHash } from "node:crypto";
import { ONE_OF_ONES, type OneOfOne } from "../copy/oneOfOnes";
import { ATTENDANCE, INCIDENTS, SEASONS, STATUSES } from "../copy/traits";
import type {
  AttendanceKey,
  EraKey,
  IncidentKey,
  SeasonKey,
  StatusKey,
  SubjectKey,
} from "../copy/types";
import { allocate } from "./allocate";
import {
  LAYERS,
  PEN_MARK_ANCHORS,
  SUBJECT_KEYS,
  type LayerDef,
  type LayerKey,
} from "./catalog";
import { assertTokenId, DEFAULT_SEED, GENERATIVE_COUNT, MAX_SUPPLY, ONE_OF_ONE_COUNT } from "./constants";
import {
  generateScores,
  gpaOf,
  gradesOf,
  remarkFor,
  worstSubject,
  type Grades,
  type Scores,
} from "./grades";
import { CARD_ROTATION } from "./layout";
import { rng } from "./prng";
import { apportion, designTargets, feasibleQuotas } from "./quotas";
import { allowed, type CardView } from "./rules";

/** Layers the allocator fills (everything except status, which is step 2). */
export type TraitLayer = Exclude<LayerKey, "status">;

export interface GenerativeToken {
  readonly kind: "generative";
  readonly id: number;
  readonly status: StatusKey;
  readonly scores: Scores;
  readonly grades: Grades;
  readonly gpa: number;
  /** Value ids per layer (the file slug). */
  readonly traits: Readonly<Record<TraitLayer, string>>;
  /** REMARKS line per subject (flavor text on the card, not an attribute). */
  readonly remarks: Readonly<Record<SubjectKey, string>>;
  /** Card rotation in degrees. */
  readonly rotation: number;
  /** Grade slot (0..5) an anchored pen mark sits on, or null. */
  readonly penAnchor: number | null;
  readonly dna: string;
}

export interface OneOfOneToken {
  readonly kind: "oneOfOne";
  readonly id: number;
  /** 1-based position in ONE_OF_ONES (the comedy bible's numbering). */
  readonly number: number;
  readonly piece: OneOfOne;
  readonly dna: string;
}

export type Token = GenerativeToken | OneOfOneToken;

export interface LayerQuota {
  readonly valueId: string;
  /** Designed target (tier curve). */
  readonly target: number;
  /** Exact count allocated in this run (target after feasibility caps). */
  readonly count: number;
}

export interface Selection {
  readonly seed: string;
  /** tokens[id - 1]. */
  readonly tokens: readonly Token[];
  readonly oneOfOneIds: readonly number[];
  readonly quotas: Readonly<Record<LayerKey, readonly LayerQuota[]>>;
}

// Key <-> id maps (the copy uses app keys for rules and slugs for files).
export const INCIDENT_KEY: Readonly<Record<string, IncidentKey>> = Object.fromEntries(INCIDENTS.map((i) => [i.id, i.key]));
export const INCIDENT_ID: Readonly<Record<IncidentKey, string>> = Object.fromEntries(INCIDENTS.map((i) => [i.key, i.id])) as Record<IncidentKey, string>;
export const ATTENDANCE_KEY: Readonly<Record<string, AttendanceKey>> = Object.fromEntries(ATTENDANCE.map((a) => [a.id, a.key]));
export const SEASON_KEY: Readonly<Record<string, SeasonKey>> = Object.fromEntries(SEASONS.map((s) => [s.id, s.key]));
export const STATUS_ID: Readonly<Record<StatusKey, string>> = Object.fromEntries(STATUSES.map((s) => [s.key, s.id])) as Record<StatusKey, string>;
export const STATUS_KEY: Readonly<Record<string, StatusKey>> = Object.fromEntries(STATUSES.map((s) => [s.id, s.key]));

/** Exact status counts over the 3,300 generated cards (largest remainder of the copy's shares). */
export function statusQuotas(n = GENERATIVE_COUNT): Record<StatusKey, number> {
  const counts = apportion(STATUSES.map((s) => s.share), n);
  return Object.fromEntries(STATUSES.map((s, i) => [s.key, counts[i]])) as Record<StatusKey, number>;
}

/** The layer order the allocator runs in (dependencies first). */
export const ALLOCATION_ORDER: readonly TraitLayer[] = [
  "incident",
  "school",
  "season",
  "paper",
  "background",
  "attendance",
  "penMarks",
  "doodle",
  "stain",
  "signature",
  "comment",
];

const cache = new Map<string, Selection>();

/** The whole collection for a seed (cached). */
export function selectCollection(seed: string = DEFAULT_SEED): Selection {
  const hit = cache.get(seed);
  if (hit) return hit;
  const sel = buildSelection(seed);
  cache.set(seed, sel);
  return sel;
}

export function getToken(id: number, seed: string = DEFAULT_SEED): Token {
  assertTokenId(id);
  return selectCollection(seed).tokens[id - 1];
}

/** CardView of a finished generative token (for rule checks). */
export function cardView(t: GenerativeToken): Required<CardView> {
  return {
    status: t.status,
    grades: t.grades,
    incident: INCIDENT_KEY[t.traits.incident],
    attendance: ATTENDANCE_KEY[t.traits.attendance],
    era: t.traits.paper as EraKey,
    season: SEASON_KEY[t.traits.season],
    school: t.traits.school,
  };
}

export function dnaOf(status: StatusKey, grades: Grades, traits: Readonly<Record<TraitLayer, string>>): string {
  const parts = [
    status,
    ...SUBJECT_KEYS.map((k) => grades[k]),
    ...ALLOCATION_ORDER.slice().sort().map((l) => `${l}=${traits[l]}`),
  ];
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

/** Uncached build (tests use it to prove determinism). */
export function buildSelection(seed: string): Selection {
  // 1. One-of-ones at seeded-random ids.
  const placeRng = rng(seed, "one-of-ones");
  const allIds = Array.from({ length: MAX_SUPPLY }, (_, i) => i + 1);
  const oneIds = placeRng.shuffle(allIds).slice(0, ONE_OF_ONE_COUNT).sort((a, b) => a - b);
  const pieces = placeRng.shuffle(ONE_OF_ONES.map((p, i) => ({ p, number: i + 1 })));
  const oneSet = new Set(oneIds);
  const genIds = allIds.filter((id) => !oneSet.has(id));
  if (genIds.length !== GENERATIVE_COUNT) throw new Error("generative id count mismatch");
  const n = genIds.length;

  // 2. Status: exact quotas, shuffled.
  const sq = statusQuotas(n);
  const statusList: StatusKey[] = [];
  for (const s of STATUSES) for (let i = 0; i < sq[s.key]; i++) statusList.push(s.key);
  const statuses = rng(seed, "status").shuffle(statusList);

  // 3. Liquidations: the incident layer's LIQUIDATED target, drawn from EXPELLED cards.
  const incidentLayer = LAYERS.incident;
  const liqValue = INCIDENT_ID.LIQUIDATED;
  const liqTarget = designTargets(incidentLayer, n)[incidentLayer.values.findIndex((v) => v.id === liqValue)];
  const expelled = statuses.map((s, i) => (s === "EXPELLED" ? i : -1)).filter((i) => i >= 0);
  const liquidated = new Set(rng(seed, "liquidated").shuffle(expelled).slice(0, liqTarget));

  // 4. Grades. ~5% of cards get one Incomplete, ~0.6% get two.
  const incRng = rng(seed, "incomplete");
  const incompletes: SubjectKey[][] = statuses.map(() => []);
  const incOrder = incRng.shuffle(statuses.map((_, i) => i)).filter((i) => statuses[i] !== "VALEDICTORIAN");
  incOrder.forEach((t, k) => {
    const howMany = k < 165 ? 1 : k < 185 ? 2 : 0;
    if (howMany === 0) return;
    const locked: SubjectKey[] = [];
    if (statuses[t] === "MOST LIKELY TO BECOME EXIT LIQUIDITY") locked.push("buyingTheTop", "chasingMemes");
    if (liquidated.has(t)) locked.push("riskManagement");
    const pool = SUBJECT_KEYS.filter((s) => !locked.includes(s));
    incompletes[t] = incRng.shuffle(pool).slice(0, howMany);
  });
  const scores: Scores[] = statuses.map((s, t) =>
    generateScores(s, liquidated.has(t), incompletes[t], rng(seed, "grades", genIds[t])),
  );
  const grades = scores.map(gradesOf);

  // 5. Allocate trait layers in dependency order.
  const views: CardView[] = statuses.map((status, t) => ({ status, grades: grades[t] }));
  const picks = {} as Record<TraitLayer, string[]>;
  const quotas = {} as Record<LayerKey, LayerQuota[]>;
  for (const key of ALLOCATION_ORDER) {
    const layer: LayerDef = LAYERS[key];
    const eligibleSets = layer.values.map((v) => {
      const set = new Uint8Array(n);
      for (let t = 0; t < n; t++) {
        let ok = allowed(key, v.id, views[t]);
        if (key === "incident") ok = liquidated.has(t) ? v.id === liqValue : ok && v.id !== liqValue;
        set[t] = ok ? 1 : 0;
      }
      return set;
    });
    let targets: number[];
    let q: number[];
    if (key === "season") {
      const summer = views.filter((c) => c.school === "summer-school").length;
      const others = layer.values.filter((v) => v.id !== "summer");
      const split = apportion(others.map(() => 1), n - summer);
      q = layer.values.map((v) => (v.id === "summer" ? summer : split[others.indexOf(v)]));
      targets = q;
    } else {
      const def: LayerDef = key === "incident" ? { ...layer, fixedCounts: { [liqValue]: liqTarget } } : layer;
      targets = designTargets(def, n);
      q = feasibleQuotas(def, n, eligibleSets);
    }
    const assign = allocate({
      label: key,
      n,
      quotas: q,
      eligible: (t, v) => eligibleSets[v][t] === 1,
      rng: rng(seed, "alloc", key),
    });
    picks[key] = Array.from(assign, (v) => layer.values[v].id);
    quotas[key] = layer.values.map((v, i) => ({ valueId: v.id, target: targets[i], count: q[i] }));
    for (let t = 0; t < n; t++) {
      const id = picks[key][t];
      const c = views[t];
      if (key === "incident") c.incident = INCIDENT_KEY[id];
      else if (key === "school") c.school = id;
      else if (key === "season") c.season = SEASON_KEY[id];
      else if (key === "paper") c.era = id as EraKey;
      else if (key === "attendance") c.attendance = ATTENDANCE_KEY[id];
    }
  }
  quotas.status = STATUSES.map((s) => ({ valueId: s.id, target: sq[s.key], count: sq[s.key] }));

  // 6. DNA uniqueness: swap stains between cards until every DNA is unique
  // (swaps keep every quota exact).
  const traitsOf = (t: number) =>
    Object.fromEntries(ALLOCATION_ORDER.map((k) => [k, picks[k][t]])) as Record<TraitLayer, string>;
  const dnas = statuses.map((s, t) => dnaOf(s, grades[t], traitsOf(t)));
  const fixRng = rng(seed, "dna-fix");
  for (let guard = 0; guard < 1000; guard++) {
    const seen = new Map<string, number>();
    let dup = -1;
    for (let t = 0; t < n; t++) {
      if (seen.has(dnas[t])) {
        dup = t;
        break;
      }
      seen.set(dnas[t], t);
    }
    if (dup < 0) break;
    const other = fixRng.int(0, n - 1);
    const a = picks.stain[dup];
    const b = picks.stain[other];
    if (a === b || !allowed("stain", b, views[dup]) || !allowed("stain", a, views[other])) continue;
    picks.stain[dup] = b;
    picks.stain[other] = a;
    dnas[dup] = dnaOf(statuses[dup], grades[dup], traitsOf(dup));
    dnas[other] = dnaOf(statuses[other], grades[other], traitsOf(other));
  }

  // Assemble tokens.
  const tokens: Token[] = new Array(MAX_SUPPLY);
  oneIds.forEach((id, k) => {
    const { p, number } = pieces[k];
    tokens[id - 1] = {
      kind: "oneOfOne",
      id,
      number,
      piece: p,
      dna: createHash("sha256").update(`1of1|${p.slug}`).digest("hex"),
    };
  });
  genIds.forEach((id, t) => {
    const cos = rng(seed, "cosmetic", id);
    const rotation = Math.round(cos.float(CARD_ROTATION.min, CARD_ROTATION.max) * 10) / 10;
    const remarks = {} as Record<SubjectKey, string>;
    for (const k of SUBJECT_KEYS) remarks[k] = remarkFor(k, grades[t][k], cos);
    const traits = traitsOf(t);
    const anchor = PEN_MARK_ANCHORS[traits.penMarks];
    let penAnchor: number | null = null;
    if (anchor === "firstF") penAnchor = SUBJECT_KEYS.findIndex((k) => grades[t][k] === "F");
    else if (anchor === "worst") penAnchor = SUBJECT_KEYS.indexOf(worstSubject(scores[t])!);
    tokens[id - 1] = {
      kind: "generative",
      id,
      status: statuses[t],
      scores: scores[t],
      grades: grades[t],
      gpa: gpaOf(scores[t]),
      traits,
      remarks,
      rotation,
      penAnchor: penAnchor !== null && penAnchor >= 0 ? penAnchor : null,
      dna: dnas[t],
    };
  });

  return { seed, tokens, oneOfOneIds: oneIds, quotas };
}
