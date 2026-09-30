import { SUBJECTS } from "./grading";
import { shortAddress } from "./reportCard";
import type { Incident, LetterGrade, ReportCard, Status, SubjectGrade } from "./types";

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

/** "an F", "an A+", "a B-", "a D". */
export function withArticle(grade: LetterGrade): string {
  return `${/^[AFI]/.test(grade) ? "an" : "a"} ${grade}`;
}

/** True for an A-range grade in a subject you should be bad at. */
export function isBackhanded(s: SubjectGrade): boolean {
  return isVice(s) && (gradeRank(s.grade) ?? 0) >= gradeRank("A-")!;
}

const STATUS_LINE: Record<Status, string> = {
  "HONOR ROLL": "Somehow made HONOR ROLL. The teacher is suspicious.",
  "NEEDS IMPROVEMENT": "Status: NEEDS IMPROVEMENT.",
  "ACADEMIC PROBATION": "Now on ACADEMIC PROBATION.",
  "HELD BACK": "Got HELD BACK a semester.",
  SUSPENDED: "Got SUSPENDED.",
  EXPELLED: "Got EXPELLED.",
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": "Voted MOST LIKELY TO BECOME EXIT LIQUIDITY.",
};

const INCIDENT_LINE: Record<Incident, string> = {
  WHALE: "Also got put in the gifted program (whale).",
  RUGGED: "Also got sent to the nurse after a rug.",
  LIQUIDATED: "Withdrawn from school. Reason: liquidated.",
  FIGHT_IN_CAFETERIA: "Also got written up for a fight in the cafeteria.",
};

/** Short labels for chips and tickers. */
export const INCIDENT_LABEL: Record<Incident, string> = {
  WHALE: "GIFTED & TALENTED (WHALE)",
  RUGGED: "SENT TO THE NURSE (RUGGED)",
  LIQUIDATED: "WITHDRAWN (LIQUIDATED)",
  FIGHT_IN_CAFETERIA: "FIGHT IN CAFETERIA",
};

/**
 * The prefilled post, written the way people actually post it:
 * "My wallet got an F in Taking Profit and an A+ in Holding Bags." The card
 * link is passed to the intent separately.
 */
export function shareText(card: Pick<ReportCard, "subjects" | "status" | "incidents">): string {
  const worst = worstSubject(card.subjects);
  const vice = bestVice(card.subjects);
  let lead: string;
  if (!worst) lead = "My wallet's report card came back all Incompletes.";
  else if (isBackhanded(worst)) {
    lead = `My wallet got ${withArticle(worst.grade)} in ${worst.name}. Not a compliment.`;
  } else if (vice && vice !== worst) {
    lead =
      `My wallet got ${withArticle(worst.grade)} in ${worst.name}` +
      ` and ${withArticle(vice.grade)} in ${vice.name}.`;
  } else lead = `My wallet got ${withArticle(worst.grade)} in ${worst.name}.`;

  // Liquidation already explains an EXPELLED; otherwise brag about the rarest thing.
  const incident =
    card.incidents.find((i) => i === "WHALE" || i === "FIGHT_IN_CAFETERIA") ??
    card.incidents.find((i) => i === "RUGGED") ??
    card.incidents.find((i) => i === "LIQUIDATED");
  return [lead, STATUS_LINE[card.status], incident && INCIDENT_LINE[incident], "", "Show me your grades \u{1F447}"]
    .filter((l): l is string => l !== undefined)
    .join("\n");
}

/** X post intent with the text and the card link, both encoded. */
export function xIntentUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function cardQuery(term: number, name?: string): string {
  const q = new URLSearchParams({ term: String(term) });
  if (name?.trim()) q.set("name", name.trim());
  return q.toString();
}

/**
 * The shareable card path. Always carries the term, so a posted link keeps
 * showing the same card after the semester rolls over.
 */
export function cardPath(address: string, term: number, name?: string): string {
  return `/card/${address}?${cardQuery(term, name)}`;
}

/** The share image for that exact card (same term and name). */
export function cardImagePath(address: string, term: number, name?: string): string {
  return `/card/${address}/opengraph-image?${cardQuery(term, name)}`;
}

/** The name the viewer typed, if the card has one (not the short address). */
export function customName(card: Pick<ReportCard, "studentName" | "address">): string | undefined {
  return card.studentName === shortAddress(card.address) ? undefined : card.studentName;
}

/** Tape items for the card page ticker: this card's verdict, over and over. */
export function tickerItems(card: ReportCard): string[] {
  const worst = worstSubject(card.subjects);
  const vice = bestVice(card.subjects);
  const items: string[] = [card.status];
  if (worst) {
    items.push(
      `${withArticle(worst.grade).toUpperCase()} IN ${worst.name.toUpperCase()}${isBackhanded(worst) ? " (NOT A COMPLIMENT)" : ""}`,
    );
  }
  items.push("SHOW ME YOUR GRADES");
  if (vice && vice !== worst) items.push(`${withArticle(vice.grade).toUpperCase()} IN ${vice.name.toUpperCase()} (NOT A COMPLIMENT)`);
  for (const i of card.incidents) items.push(INCIDENT_LABEL[i]);
  items.push(`${card.semester.label} · TERM ${card.semester.term}`, "PARENTS HAVE BEEN NOTIFIED");
  return items;
}
