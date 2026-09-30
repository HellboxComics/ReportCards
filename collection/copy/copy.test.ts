import { describe, expect, it } from "vitest";
import { COMMENTS } from "./comments";
import {
  aGrade,
  BEST_SUBJECT_LINES,
  DETAIL_LINES,
  fill,
  GPA_LINES,
  INCIDENT_LINES,
  INCOMPLETE_LINES,
  OPENERS,
  PRINCIPAL_ONE_LINERS,
  STATUS_CLOSERS,
  UNREVEALED,
  WORST_SUBJECT_LINES,
  type BlurbVars,
} from "./descriptions";
import { ONE_OF_ONES } from "./oneOfOnes";
import {
  ATTENDANCE,
  BACKGROUNDS,
  DOODLES,
  INCIDENTS,
  MAX_SUPPLY,
  PAPERS,
  PEN_MARKS,
  SCHOOLS,
  SEASONS,
  SIGNATURES,
  STAINS,
  STATUSES,
  studentId,
  SUBJECT_COPY,
} from "./traits";
import type { StatusKey, TraitValue } from "./types";

const LAYERS: Record<string, readonly TraitValue[]> = {
  BACKGROUNDS,
  PAPERS,
  SCHOOLS,
  ATTENDANCE,
  PEN_MARKS,
  DOODLES,
  STAINS,
  SIGNATURES,
  INCIDENTS,
  STATUSES,
};

const ALL_STATUSES: StatusKey[] = [
  "HONOR ROLL",
  "NEEDS IMPROVEMENT",
  "ACADEMIC PROBATION",
  "HELD BACK",
  "SUSPENDED",
  "EXPELLED",
  "MOST LIKELY TO BECOME EXIT LIQUIDITY",
  "VALEDICTORIAN",
];

/** Real brands, people, platforms and meme likenesses the hard rules forbid. */
const BANNED =
  /\b(pepe|wojak|doge|shiba|discord|telegram|twitter|coinbase|binance|lambo|lamborghini|scantron|trapper keeper|lunchables|capri sun|oregon trail|tamagotchi|game ?boy|nintendo|pokemon|sharpie|white-out|liquid paper|crayola|xerox|post-it|band-aid|kleenex|jell-?o|velcro|polaroid|beanie bab|ethereum|solana|bitcoin|metamask|uniswap|dexscreener|bankrbot|elon|cramer|harvard|yale|wi-fi|styrofoam|tater tots?|popsicle|frisbee|bubble wrap)\b/i;

function allStrings(v: unknown, out: string[] = []): string[] {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => allStrings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => allStrings(x, out));
  return out;
}

const FULL_VARS: BlurbVars = {
  student: "Student #0417",
  studentId: "STUDENT ID #0417",
  school: "Mt. Rugmore Junior High",
  semester: "Fall 1994",
  paper: "tractor-feed dot-matrix paper",
  background: "the gym floor",
  status: "HELD BACK",
  subject: "Taking Profit",
  grade: "F",
  aGrade: "an F",
  gpa: "1.37",
  stain: "a coffee ring",
  doodle: "a rocket",
  signature: "Mom's cursive",
  penMarks: "a SEE ME",
  comment: "Mother requested conference.",
};

describe("comedy bible", () => {
  it("keeps supply and ids formatted", () => {
    expect(MAX_SUPPLY).toBe(3333);
    expect(studentId(1)).toBe("STUDENT ID #0001");
    expect(studentId(3333)).toBe("STUDENT ID #3333");
  });

  it("has unique, kebab-case ids and short names in every layer", () => {
    for (const [layer, values] of Object.entries(LAYERS)) {
      const ids = values.map((v) => v.id);
      expect(new Set(ids).size, layer).toBe(ids.length);
      for (const v of values) {
        expect(v.id, `${layer}:${v.id}`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
        expect(v.name.length, `${layer}:${v.name}`).toBeLessThanOrEqual(36);
        expect(v.joke.length, `${layer}:${v.id}`).toBeGreaterThan(0);
      }
      const names = values.map((v) => v.name);
      expect(new Set(names).size, layer).toBe(names.length);
    }
  });

  it("gives every template-facing value a sentence phrase", () => {
    for (const values of [BACKGROUNDS, PAPERS, SCHOOLS, PEN_MARKS, DOODLES, STAINS, SIGNATURES] as const) {
      for (const v of values as readonly TraitValue[]) {
        expect(v.phrase, v.id).toBeTruthy();
        expect(v.phrase!.endsWith("."), v.id).toBe(false);
      }
    }
  });

  it("covers the app's statuses plus Valedictorian with shares summing to 1", () => {
    expect(STATUSES.map((s) => s.key).sort()).toEqual([...ALL_STATUSES].sort());
    const total = STATUSES.reduce((a, s) => a + s.share, 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it("keeps the six subject names from the app", () => {
    expect(Object.values(SUBJECT_COPY).map((s) => s.name)).toEqual([
      "Buying the Top",
      "Taking Profit",
      "Risk Management",
      "Holding Bags",
      "Chasing Memes",
      "Selling Too Early",
    ]);
    for (const s of Object.values(SUBJECT_COPY)) {
      for (const remarks of Object.values(s.remarks)) {
        for (const r of remarks) expect(r.length, r).toBeLessThanOrEqual(26);
      }
    }
  });

  it("has 80+ unique handwritable comments", () => {
    expect(COMMENTS.length).toBeGreaterThanOrEqual(80);
    const ids = COMMENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    const texts = COMMENTS.map((c) => c.text);
    expect(new Set(texts).size).toBe(texts.length);
    for (const c of COMMENTS) {
      expect(c.text.length, c.text).toBeLessThanOrEqual(90);
      expect(c.text, c.id).not.toMatch(/\{/);
    }
    // Every status has at least two dedicated comments.
    for (const s of ALL_STATUSES) {
      const n = COMMENTS.filter((c) => c.when?.status?.includes(s)).length;
      expect(n, s).toBeGreaterThanOrEqual(2);
    }
  });

  it("has exactly 33 distinct one-of-ones", () => {
    expect(ONE_OF_ONES).toHaveLength(33);
    const slugs = ONE_OF_ONES.map((o) => o.slug);
    expect(new Set(slugs).size).toBe(33);
    expect(new Set(ONE_OF_ONES.map((o) => o.title)).size).toBe(33);
    for (const o of ONE_OF_ONES) {
      expect(o.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(o.gpa).toBeGreaterThanOrEqual(0);
      expect(o.gpa).toBeLessThanOrEqual(4.33);
      expect(o.traits["Teacher Comment"].length, o.slug).toBeLessThanOrEqual(90);
      expect(o.visual.palette.length).toBeGreaterThanOrEqual(3);
      for (const p of o.visual.palette) expect(p).toMatch(/^#[0-9A-F]{6} /);
      expect(o.visual.text.length).toBeGreaterThan(0);
    }
  });

  it("fills every template with the documented vars", () => {
    const templates = [
      ...OPENERS,
      ...Object.values(WORST_SUBJECT_LINES).flat(),
      ...Object.values(BEST_SUBJECT_LINES).flat(),
      ...INCOMPLETE_LINES,
      ...Object.values(INCIDENT_LINES).flat(),
      ...DETAIL_LINES,
      ...GPA_LINES.flatMap((b) => b.lines),
      ...Object.values(STATUS_CLOSERS).flat(),
    ];
    for (const t of templates) expect(() => fill(t, FULL_VARS)).not.toThrow();
    for (const s of ALL_STATUSES) expect(STATUS_CLOSERS[s].length).toBeGreaterThanOrEqual(2);
    expect(OPENERS.length).toBeGreaterThanOrEqual(20);
    expect(PRINCIPAL_ONE_LINERS.length).toBeGreaterThanOrEqual(20);
    expect(fill(UNREVEALED.name, { id: "0001" } as BlurbVars)).toBe("Report Card #0001 — Grades Not Posted");
  });

  it("picks the right article for grades", () => {
    expect(aGrade("A+")).toBe("an A+");
    expect(aGrade("F")).toBe("an F");
    expect(aGrade("I")).toBe("an I");
    expect(aGrade("B-")).toBe("a B-");
    expect(aGrade("D")).toBe("a D");
  });

  it("names no real brands, platforms, people or meme characters", () => {
    const strings = allStrings([
      LAYERS,
      SEASONS,
      SUBJECT_COPY,
      COMMENTS,
      OPENERS,
      WORST_SUBJECT_LINES,
      BEST_SUBJECT_LINES,
      INCIDENT_LINES,
      DETAIL_LINES,
      STATUS_CLOSERS,
      PRINCIPAL_ONE_LINERS,
      UNREVEALED,
      ONE_OF_ONES,
    ]);
    for (const s of strings) expect(s, s).not.toMatch(BANNED);
  });

  it("only uses Robinhood as the plain chain name", () => {
    for (const s of allStrings([LAYERS, COMMENTS, ONE_OF_ONES, PRINCIPAL_ONE_LINERS, OPENERS])) {
      if (/robinhood/i.test(s)) expect(s, s).toMatch(/Robinhood Chain|ROBINHOOD CHAIN/);
    }
  });
});
