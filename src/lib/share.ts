import { SUBJECTS } from "./grading";
import { shortAddress } from "./reportCard";
import type { LetterGrade, ReportCard, Status, SubjectGrade } from "./types";

/**
 * Helpers for the share loop: which grade Harrow circles, how the status stamp
 * breaks across lines, and what the prefilled post says.
 */

const RANK: LetterGrade[] = ["F", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];

/** 0 = F ... 12 = A+. Incomplete has no rank. */
export function gradeRank(g: LetterGrade): number | null {
  const i = RANK.indexOf(g);
  return i === -1 ? null : i;
}

const isVice = (s: SubjectGrade) => SUBJECTS.find((x) => x.key === s.key)?.vice ?? false;

/**
 * The grade that gets circled in red pen with "SEE ME". Letters only mean
 * "bad" in some subjects (an F in Selling Too Early is good behavior), so it is
 * picked in this order:
 *   1. a D or F in a subject you should be good at (Taking Profit, Risk Management)
 *   2. an A in a subject you should be bad at (A+ in Buying the Top)
 *   3. your lowest grade in a subject you should be good at
 *   4. your highest grade in a subject you should be bad at
 * Ties go to the lower letter (or higher, for vices), then to card order.
 */
export function worstSubject(subjects: SubjectGrade[]): SubjectGrade | null {
  const A_MINUS = gradeRank("A-")!;
  const C_MINUS = gradeRank("C-")!;
  let worst: SubjectGrade | null = null;
  let worstKey = [Infinity, Infinity, Infinity];
  for (const [i, s] of subjects.entries()) {
    const rank = gradeRank(s.grade);
    if (rank === null) continue;
    const vice = isVice(s);
    const tier = vice ? (rank >= A_MINUS ? 1 : 3) : rank < C_MINUS ? 0 : 2;
    // lower is worse: virtue grades by letter, vice grades by inverted letter
    const key = [tier, vice ? -rank : rank, i];
    const cmp = key[0] - worstKey[0] || key[1] - worstKey[1] || key[2] - worstKey[2];
    if (cmp < 0) {
      worst = s;
      worstKey = key;
    }
  }
  return worst;
}

/**
 * The "compliment" that isn't: the best grade in a subject you should be bad at
 * (A+ in Buying the Top). Only A-range grades count.
 */
export function bestVice(subjects: SubjectGrade[]): SubjectGrade | null {
  let best: SubjectGrade | null = null;
  for (const s of subjects) {
    if (!isVice(s) || s.score === null) continue;
    const rank = gradeRank(s.grade) ?? 0;
    if (rank < gradeRank("A-")!) continue;
    if (!best || s.score > best.score!) best = s;
  }
  return best;
}

export type StatusTone = "good" | "meh" | "bad";

export function statusTone(status: Status): StatusTone {
  if (status === "HONOR ROLL") return "good";
  if (status === "NEEDS IMPROVEMENT") return "meh";
  return "bad";
}

/** How the stamp breaks: a small kicker line above one huge word or phrase. */
export function statusLines(status: Status): { kicker?: string; main: string } {
  switch (status) {
    case "MOST LIKELY TO BECOME EXIT LIQUIDITY":
      return { kicker: "MOST LIKELY TO BECOME", main: "EXIT LIQUIDITY" };
    case "ACADEMIC PROBATION":
      return { kicker: "ACADEMIC", main: "PROBATION" };
    case "NEEDS IMPROVEMENT":
      return { kicker: "NEEDS", main: "IMPROVEMENT" };
    default:
      return { main: status };
  }
}

/**
 * Rough rendered width of the widest word, in "average capital" units, for
 * sizing giant condensed display type so a single word never overflows.
 */
export function widestWord(text: string): number {
  return Math.max(1, ...text.split(/\s+/).map(textWidth));
}

/** Same units as widestWord, for a whole line (spaces count as half a letter). */
export function textWidth(text: string): number {
  const w = (c: string) => (/[IJ1.,!'\s]/.test(c) ? 0.5 : /[MW]/.test(c) ? 1.3 : 1);
  return [...text].reduce((sum, c) => sum + w(c), 0);
}

/** "F in Taking Profit" */
export function gradeLine(s: SubjectGrade): string {
  return `${s.grade} in ${s.name}`;
}

/** The prefilled post. Short, lowercase, built to make replies post their own. */
export function shareText(card: ReportCard): string {
  const worst = worstSubject(card.subjects);
  const vice = bestVice(card.subjects);
  const lines: string[] = [];
  if (card.status === "HONOR ROLL") {
    lines.push("my wallet made HONOR ROLL. the teacher is \"frankly suspicious\"");
  } else {
    lines.push("my wallet just got its report card");
  }
  lines.push("");
  if (worst) lines.push(gradeLine(worst));
  if (vice && vice !== worst) lines.push(gradeLine(vice));
  if (!worst) lines.push("Incomplete in every subject");
  lines.push(`status: ${card.status}`);
  lines.push("");
  lines.push("show me your grades");
  return lines.join("\n");
}

/** X post intent with the text and the card link, both encoded. */
export function xIntentUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

/** Tape items for the card page ticker. */
export function tickerItems(card: ReportCard): string[] {
  const who = shortAddress(card.address);
  const worst = worstSubject(card.subjects);
  const vice = bestVice(card.subjects);
  const items = [
    worst ? `${who} — ${worst.grade} IN ${worst.name.toUpperCase()} — ${card.status}` : `${who} — ${card.status}`,
    "SHOW ME YOUR GRADES",
  ];
  if (vice && vice !== worst) items.push(`${vice.grade} IN ${vice.name.toUpperCase()} (NOT A COMPLIMENT)`);
  items.push("PARENTS HAVE BEEN NOTIFIED", `${card.semester.label} — TERM ${card.semester.term}`, "RETURN SIGNED BY MONDAY");
  return items;
}
