import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { academicStanding, determineStatus } from "../../src/lib/grading";
import { ONE_OF_ONES } from "../copy/oneOfOnes";
import { allocate, AllocationError } from "./allocate";
import {
  checkCurve,
  checkDescriptions,
  checkDna,
  checkMetadata,
  checkOneOfOnePlacement,
  checkQuotas,
  checkRules,
  checkSupply,
  descriptionUniqueness,
  runAllChecks,
} from "./checks";
import { assertSupply, assertTokenId, DEFAULT_SEED, GENERATIVE_COUNT, MAX_SUPPLY, ONE_OF_ONE_COUNT } from "./constants";
import { toSubjectGrades } from "./grades";
import { allMetadata, tokenMetadata } from "./metadata";
import { rng } from "./prng";
import { rarityTable, TOKEN_TIER_COUNTS } from "./rarity";
import { buildSelection, selectCollection, statusQuotas, type GenerativeToken } from "./select";
import { GET as metadataRoute } from "../../src/app/api/metadata/[id]/route";

const sel = selectCollection();
const meta = allMetadata();
const gens = sel.tokens.filter((t): t is GenerativeToken => t.kind === "generative");
const ok = (r: { name: string; problems: string[] }) => expect(r.problems, r.name).toEqual([]);

describe("supply cap: 3,333 and not one more", () => {
  it("has exactly 3,333 tokens with ids 1..3333", () => {
    expect(MAX_SUPPLY).toBe(3333);
    expect(sel.tokens).toHaveLength(3333);
    expect(sel.tokens.map((t) => t.id)).toEqual(Array.from({ length: 3333 }, (_, i) => i + 1));
    expect(meta.map((m) => m.edition)).toEqual(Array.from({ length: 3333 }, (_, i) => i + 1));
    ok(checkSupply(sel));
  });

  it("refuses more than 3,333 and ids outside 1..3333", () => {
    expect(() => assertSupply(3334)).toThrow(/max supply is 3333/);
    expect(() => assertSupply(10_000)).toThrow();
    expect(() => assertSupply(3333)).not.toThrow();
    for (const bad of [0, -1, 3334, 1.5, NaN]) {
      expect(() => assertTokenId(bad)).toThrow();
      expect(() => tokenMetadata(bad)).toThrow();
    }
  });

  it("the generator CLI refuses --count above 3,333", () => {
    const tsx = path.resolve(import.meta.dirname, "../../node_modules/.bin/tsx");
    const cli = path.resolve(import.meta.dirname, "cli/generate.ts");
    const out = fs.mkdtempSync(path.join(os.tmpdir(), "rc-gen-"));
    const r = spawnSync(tsx, [cli, "--count", "3334", "--no-images", "--out", out], { encoding: "utf8" });
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/max supply is 3333/);
    expect(fs.existsSync(path.join(out, "metadata"))).toBe(false);
    fs.rmSync(out, { recursive: true, force: true });
  });

  it("the live endpoint 404s outside 1..3333 and serves the same JSON inside", async () => {
    const call = (id: string) => metadataRoute(new Request(`http://x/api/metadata/${id}`), { params: Promise.resolve({ id }) });
    for (const bad of ["0", "3334", "9999", "abc", "-1", "1.5", "12345"]) expect((await call(bad)).status, bad).toBe(404);
    for (const id of [1, 417, 3333]) {
      const res = await call(String(id));
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual(tokenMetadata(id));
    }
    expect((await call("417.json")).status).toBe(200);
  });
});

describe("determinism", () => {
  it("same seed -> identical selection and metadata", () => {
    const again = buildSelection(DEFAULT_SEED);
    expect(JSON.stringify(again)).toBe(JSON.stringify(sel));
    expect(JSON.stringify(tokenMetadata(1234))).toBe(JSON.stringify(meta[1233]));
  });

  it("a different seed -> a different collection", () => {
    const other = buildSelection("some-other-seed");
    expect(other.oneOfOneIds).not.toEqual(sel.oneOfOneIds);
    const diff = other.tokens.filter((t, i) => t.dna !== sel.tokens[i].dna).length;
    expect(diff).toBeGreaterThan(3000);
  });

  it("the PRNG is stable across runs", () => {
    const r = rng("fixed");
    expect([r.next(), r.next(), r.int(1, 100)]).toEqual([
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    ]);
    const a = rng("x", 1);
    const b = rng("x", 1);
    expect(Array.from({ length: 20 }, () => a.next())).toEqual(Array.from({ length: 20 }, () => b.next()));
  });
});

describe("uniqueness", () => {
  it("every token has a unique DNA", () => ok(checkDna(sel)));
  it("descriptions are >= 99% unique", () => {
    expect(descriptionUniqueness(meta)).toBeGreaterThanOrEqual(0.99);
    ok(checkDescriptions(meta));
  });
});

describe("rarity curve", () => {
  it("status curve is exact (Valedictorian <= 3)", () => {
    const q = statusQuotas();
    expect(Object.values(q).reduce((a, b) => a + b, 0)).toBe(GENERATIVE_COUNT);
    expect(q.VALEDICTORIAN).toBeLessThanOrEqual(3);
    expect(q["NEEDS IMPROVEMENT"]).toBeGreaterThan(q["HONOR ROLL"]);
    expect(q["ACADEMIC PROBATION"]).toBeGreaterThan(q["HONOR ROLL"]);
    ok(checkQuotas(sel));
  });

  it("token tiers hit exact counts and layer tiers stay on the designed curve", () => {
    const table = rarityTable(sel);
    for (const [tier, count] of TOKEN_TIER_COUNTS) expect(table.byId.filter((r) => r.tier === tier)).toHaveLength(count);
    ok(checkCurve(sel));
  });

  it("rarity rank is a permutation of 1..3333 with 1/1s on top", () => {
    const ranks = meta.map((m) => m.attributes.find((a) => a.trait_type === "Rarity Rank")!.value as number);
    expect(new Set(ranks).size).toBe(3333);
    const oneRanks = sel.oneOfOneIds.map((id) => ranks[id - 1]).sort((a, b) => a - b);
    expect(oneRanks).toEqual(Array.from({ length: 33 }, (_, i) => i + 1));
  });
});

describe("one-of-ones", () => {
  it("exactly 33, each piece once, at seeded non-sequential ids", () => {
    const ones = meta.filter((m) => m.attributes.some((a) => a.trait_type === "1 of 1" && a.value === "Yes"));
    expect(ones).toHaveLength(ONE_OF_ONE_COUNT);
    expect(new Set(ones.map((m) => m.name.split(" — ")[1]))).toEqual(new Set(ONE_OF_ONES.map((o) => o.title)));
    for (const m of ones) expect(m.attributes.find((a) => a.trait_type === "Rarity Tier")!.value).toBe("1 of 1");
    expect(sel.oneOfOneIds.some((id) => id > 1000)).toBe(true);
    ok(checkOneOfOnePlacement(sel));
  });
});

describe("rule coherence (src/lib/grading.ts semantics)", () => {
  it("the app's determineStatus prints every card's status from its grades", () => {
    for (const t of gens) {
      const subjects = toSubjectGrades(t.scores);
      const incidents = t.traits.incident === "withdrawal-notice" ? (["LIQUIDATED"] as const) : [];
      const app = determineStatus(subjects, academicStanding(subjects), [...incidents], 1);
      expect(app, `#${t.id}`).toBe(t.status === "VALEDICTORIAN" ? "HONOR ROLL" : t.status);
    }
  });

  it("every trait obeys its conditions and the generator rules", () => ok(checkRules(sel)));

  it("GPA follows standing: honor roll never prints below expelled", () => {
    const gpa = (s: string, liquidated = false) =>
      gens.filter((t) => t.status === s && (t.traits.incident === "withdrawal-notice") === liquidated).map((t) => t.gpa);
    expect(Math.min(...gpa("HONOR ROLL"))).toBeGreaterThan(Math.max(...gpa("EXPELLED")));
    expect(gpa("VALEDICTORIAN").every((g) => g === 4.33)).toBe(true);
  });
});

describe("metadata", () => {
  it("matches the ERC-721 / OpenSea schema", () => {
    ok(checkMetadata(meta));
    const m = meta[0];
    expect(Object.keys(m)).toEqual(["name", "description", "image", "edition", "dna", "attributes"]);
    expect(m.attributes.find((a) => a.trait_type === "GPA")).toMatchObject({ display_type: "number" });
    expect(m.attributes.find((a) => a.trait_type === "Buying the Top")!.value).toMatch(/^(A|B|C|D)[+-]?$|^F$|^I$/);
  });

  it("another seed is also fully valid (quotas are feasible, not tuned to one seed)", () => {
    const other = buildSelection("feasibility-check");
    for (const r of runAllChecks(other, [])) if (!r.name.startsWith("metadata") && !r.name.startsWith("descriptions")) ok(r);
  });
});

describe("allocator", () => {
  it("hits exact quotas under constraints", () => {
    const n = 100;
    const out = allocate({ label: "t", n, quotas: [10, 30, 60], eligible: (t, v) => v !== 0 || t < 20, rng: rng("a") });
    const counts = [0, 0, 0];
    out.forEach((v, t) => {
      counts[v]++;
      if (v === 0) expect(t).toBeLessThan(20);
    });
    expect(counts).toEqual([10, 30, 60]);
  });

  it("fails loudly when no assignment exists", () => {
    expect(() => allocate({ label: "t", n: 10, quotas: [5, 5], eligible: (t, v) => v === 0 || t < 2, rng: rng("b") })).toThrow(AllocationError);
  });
});
