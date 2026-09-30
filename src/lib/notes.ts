import { SUBJECTS } from "./grading";
import { hashString, mulberry32 } from "./random";
import type { LetterGrade, ReportCard, SubjectGrade, SubjectKey } from "./types";

/**
 * Harrow's margin notes next to the grades. Two kinds:
 *   red   — backhanded, on an A-range grade in a bad habit ("A+ in Buying the
 *           Top": impressive. bad.)
 *   green — the good kind of F: a D or F in a bad habit is good behavior, and
 *           the paper says so, so an honor-roll card full of Fs doesn't read
 *           as a fail sheet.
 * Picked by a seed per wallet + semester, so a card always prints the same
 * notes, and a string never appears twice on one card.
 */

const RANK: LetterGrade[] = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
const rank = (g: LetterGrade) => RANK.indexOf(g); // -1 for Incomplete

const isVice = (k: SubjectKey) => SUBJECTS.find((s) => s.key === k)?.vice ?? false;

/** Red pen, backhanded. Short enough to sit between the subject and the grade. */
const BACKHANDED: Partial<Record<SubjectKey, string[]>> = {
  buyingTheTop: ["impressive. bad.", "every single top", "a natural. sadly.", "how?? every time"],
  holdingBags: ["put them down", "let them go, hon", "they're gone, hon", "not a compliment"],
  chasingMemes: ["it had a dog on it", "not the frog again", "focus!!", "saw dog. bought."],
  sellingTooEarly: ["sit down.", "patience!!", "wait for it...", "not a compliment"],
};

/** Green pen, sincere (for once). `{g}` is the letter. */
const GOOD_GENERIC = ["good.", "the good kind of {g}", "proud of you", "correct.", "keep it up"];
const GOOD: Partial<Record<SubjectKey, string[]>> = {
  buyingTheTop: ["no chasing. good."],
  holdingBags: ["no bags. good."],
  chasingMemes: ["ignored the dog."],
  sellingTooEarly: ["stayed seated."],
};

export type NoteTone = "red" | "green";

export interface MarginNote {
  text: string;
  tone: NoteTone;
}

/** One seed per wallet + semester (+ what it's for), shared by the paper and the share image. */
export function cardSeed(card: { address?: string; semester?: { index: number } }, salt: string): number {
  return hashString(`${(card.address ?? "").toLowerCase()}:${card.semester?.index ?? 0}:${salt}`);
}

/** A deterministic shuffle. */
export function seededOrder<T>(items: readonly T[], seed: number): T[] {
  const rand = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** True for a D-or-lower grade in a bad habit: the good kind of F. */
export function isGoodFail(s: Pick<SubjectGrade, "key" | "grade">): boolean {
  const r = rank(s.grade);
  return isVice(s.key) && r >= 0 && r <= rank("D+");
}

const MAX_RED = 2;
const MAX_GREEN = 2;
const MAX_NOTES = 3;

/**
 * The margin notes for one card, by subject. `skip` is the circled SEE ME row,
 * which already has its note. Red goes on the highest vice grades, green on
 * the lowest; ties are broken by the card's seed.
 */
export function marginNotes(
  card: Pick<ReportCard, "subjects"> & { address?: string; semester?: { index: number } },
  opts: { skip?: SubjectKey; prefer?: SubjectKey } = {},
): Partial<Record<SubjectKey, MarginNote>> {
  const seed = cardSeed(card, "notes");
  const order = seededOrder(card.subjects.map((s) => s.key), seed);
  const tieBreak = (a: SubjectGrade, b: SubjectGrade) => order.indexOf(a.key) - order.indexOf(b.key);
  const preferred = (s: SubjectGrade) => (s.key === opts.prefer ? 0 : 1);
  const open = card.subjects.filter((s) => s.key !== opts.skip && isVice(s.key));

  // `prefer` (the grade the share post leads with) always gets its note.
  const red = open
    .filter((s) => rank(s.grade) >= rank("A-"))
    .sort((a, b) => preferred(a) - preferred(b) || rank(b.grade) - rank(a.grade) || tieBreak(a, b))
    .slice(0, MAX_RED);
  const green = open
    .filter(isGoodFail)
    .sort((a, b) => rank(a.grade) - rank(b.grade) || tieBreak(a, b))
    .slice(0, Math.min(MAX_GREEN, MAX_NOTES - red.length));

  const used = new Set<string>();
  const choose = (pool: string[], salt: string) => {
    const text = seededOrder(pool, cardSeed(card, salt)).find((t) => !used.has(t)) ?? pool[0];
    used.add(text);
    return text;
  };

  const out: Partial<Record<SubjectKey, MarginNote>> = {};
  for (const s of red) {
    out[s.key] = { tone: "red", text: choose(BACKHANDED[s.key] ?? ["not a compliment"], `red:${s.key}`) };
  }
  for (const s of green) {
    const pool = [...(GOOD[s.key] ?? []), ...GOOD_GENERIC].map((t) => t.replace("{g}", s.grade));
    out[s.key] = { tone: "green", text: choose(pool, `green:${s.key}`) };
  }
  return out;
}
