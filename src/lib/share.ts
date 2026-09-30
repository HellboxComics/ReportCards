import { SUBJECTS } from "./grading";
import { cardSeed, seededOrder } from "./notes";
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

/** Two ways to say each status, picked per wallet. */
const STATUS_LINES: Record<Status, [string, string]> = {
  "HONOR ROLL": ["Somehow made HONOR ROLL. The teacher is suspicious.", "Made HONOR ROLL anyway. Harrow is suspicious."],
  "NEEDS IMPROVEMENT": ["Status: NEEDS IMPROVEMENT.", "Official status: NEEDS IMPROVEMENT."],
  "ACADEMIC PROBATION": ["Now on ACADEMIC PROBATION.", "Status: ACADEMIC PROBATION. One more and I'm out."],
  "HELD BACK": ["Got HELD BACK a semester.", "HELD BACK. Repeating the semester."],
  SUSPENDED: ["Got SUSPENDED.", "SUSPENDED. Do not come to school tomorrow."],
  EXPELLED: ["Got EXPELLED.", "EXPELLED. Collect your belongings from the front office."],
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": [
    "Voted MOST LIKELY TO BECOME EXIT LIQUIDITY.",
    "Yearbook superlative: MOST LIKELY TO BECOME EXIT LIQUIDITY.",
  ],
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

/** The last line of every post: the reply bait. */
export const SHARE_HOOKS = [
  "Show me your grades \u{1F447}",
  "Post yours. Cowards. \u{1F447}",
  "Parents have been notified. Show me yours \u{1F447}",
  "Your turn. Show me your grades.",
];

type Seedable = { address?: string; semester?: { index: number } };
type ShareCard = Pick<ReportCard, "subjects" | "status" | "incidents"> & Seedable;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pick one of `options`, stable per wallet + semester + purpose. */
function variant<T>(card: Seedable, salt: string, options: readonly T[]): T {
  return options[cardSeed(card, salt) % options.length];
}

/**
 * The grade a post (and the unfurl headline) leads with. SEE ME stays on the
 * true worst grade, but "F in Taking Profit" is what every wallet that never
 * sold gets, so a backhanded A in a bad habit leads when there is one ("A+ in
 * Buying the Top. Not a compliment."), rotated per wallet between several.
 */
export function leadSubject(
  card: Pick<ReportCard, "subjects"> & Partial<Pick<ReportCard, "status">> & Seedable,
): SubjectGrade | null {
  let backhanded = card.subjects.filter(isBackhanded);
  // EXIT LIQUIDITY is earned by buying tops and chasing memes: lead with the proof.
  if (card.status === "MOST LIKELY TO BECOME EXIT LIQUIDITY") {
    const proof = backhanded.filter((s) => s.key === "buyingTheTop" || s.key === "chasingMemes");
    if (proof.length > 0) backhanded = proof;
  }
  if (backhanded.length > 0) return seededOrder(backhanded, cardSeed(card, "lead"))[0];
  return worstSubject(card.subjects);
}

/** The opening line of the post, one of a few per wallet. */
export function shareLead(card: ShareCard): string {
  const lead = leadSubject(card);
  if (!lead) return "My wallet's report card came back all Incompletes.";
  const g = withArticle(lead.grade);
  const n = lead.name;
  if (isBackhanded(lead)) {
    return variant(card, "lead-line", [
      `My wallet got ${g} in ${n}. Not a compliment.`,
      `${cap(g)} in ${n}. Harrow says that is not a compliment.`,
      `Finally top of the class: ${g} in ${n}.`,
      `Straight ${lead.grade} in ${n}. Mom is not proud.`,
    ]);
  }
  if (card.status === "HONOR ROLL") {
    return variant(card, "lead-line", [
      "My wallet made HONOR ROLL.",
      "HONOR ROLL. Read it and weep.",
      "Made HONOR ROLL. Harrow thinks I cheated.",
    ]);
  }
  return variant(card, "lead-line", [
    `My wallet got ${g} in ${n}.`,
    `${cap(g)} in ${n}. Circled. In red pen.`,
    `Harrow gave my wallet ${g} in ${n} and wrote SEE ME.`,
    `Report card came home. ${cap(g)} in ${n}.`,
  ]);
}

/**
 * The prefilled post, written the way people actually post it: the funniest
 * grade, the circled one, the status, the rarest incident and a hook. Every
 * line has a few wordings picked per wallet, so a reply thread of "show me
 * your grades" posts doesn't read like one template. The card link is passed
 * to the intent separately.
 */
export function shareText(card: ShareCard): string {
  const lead = leadSubject(card);
  const worst = worstSubject(card.subjects);
  const backhandedLead = !!lead && isBackhanded(lead);
  // Honor roll without a backhanded A leads with the status itself.
  const honorLead = card.status === "HONOR ROLL" && !!lead && !backhandedLead;
  const lines = [shareLead(card)];
  if (backhandedLead && worst && worst !== lead && gradeRank(worst.grade)! < gradeRank("C-")!) {
    // A backhanded lead still owns up to the circled failing grade.
    lines.push(
      variant(card, "worst-line", [
        `And ${withArticle(worst.grade)} in ${worst.name}.`,
        `Plus ${withArticle(worst.grade)} in ${worst.name}. Circled.`,
      ]),
    );
  } else if (honorLead && worst) {
    lines.push(`Worst grade: ${withArticle(worst.grade)} in ${worst.name}. Still counts.`);
  }
  if (!honorLead) lines.push(variant(card, "status-line", STATUS_LINES[card.status]));
  // Liquidation already explains an EXPELLED; otherwise brag about the rarest thing.
  const incident =
    card.incidents.find((i) => i === "WHALE" || i === "FIGHT_IN_CAFETERIA") ??
    card.incidents.find((i) => i === "RUGGED") ??
    card.incidents.find((i) => i === "LIQUIDATED");
  if (incident) lines.push(INCIDENT_LINE[incident]);
  lines.push("", variant(card, "hook", SHARE_HOOKS));
  return lines.join("\n");
}

/** "A+ in Holding Bags (not a compliment) · EXPELLED": the unfurl title. */
export function shareTitle(card: Pick<ReportCard, "subjects" | "status"> & Seedable): string {
  const lead = leadSubject(card);
  if (!lead) return card.status;
  if (isBackhanded(lead)) return `${gradeLine(lead)} (not a compliment) · ${card.status}`;
  if (card.status === "HONOR ROLL") return `HONOR ROLL · worst grade: ${gradeLine(lead)}`;
  return `${gradeLine(lead)} · ${card.status}`;
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
  const lead = leadSubject(card);
  const worst = worstSubject(card.subjects);
  const line = (s: SubjectGrade) =>
    `${withArticle(s.grade).toUpperCase()} IN ${s.name.toUpperCase()}${isBackhanded(s) ? " (NOT A COMPLIMENT)" : ""}`;
  const items: string[] = [card.status];
  if (lead) items.push(line(lead));
  items.push("SHOW ME YOUR GRADES");
  if (worst && worst !== lead) items.push(`${line(worst)} — SEE ME`);
  for (const s of card.subjects) if (s !== lead && s !== worst && isBackhanded(s)) items.push(line(s));
  for (const i of card.incidents) items.push(INCIDENT_LABEL[i]);
  items.push(`${card.semester.label} · TERM ${card.semester.term}`, "PARENTS HAVE BEEN NOTIFIED");
  return items;
}
