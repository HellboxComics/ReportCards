import { pick } from "./random";
import type { Incident, Status, SubjectGrade, SubjectKey } from "./types";

/**
 * Harrow's comment bank. `{name}` is replaced with the student's first name.
 * Triggered pools are tried first; the generic pool fills the rest.
 */

const HIGH: Partial<Record<SubjectKey, string[]>> = {
  buyingTheTop: [
    "Has been asked repeatedly to stop buying after 300% candles.",
    "{name} arrives exactly when the party is ending, every time.",
    "Shows remarkable instinct for the worst possible moment.",
  ],
  holdingBags: [
    "{name} refuses to let go of things that have clearly died.",
    "Locker contains several positions that should have been thrown out in September.",
  ],
  chasingMemes: [
    "Would benefit from spending less time with @bankrbot.",
    "Please stop drawing rockets on the desk.",
    "{name} cannot be left alone near anything with a dog on it.",
  ],
  sellingTooEarly: [
    "{name} left the field trip early and missed the good part.",
    "Hands are visibly shaking during tests.",
  ],
};

const LOW: Partial<Record<SubjectKey, string[]>> = {
  takingProfit: [
    "{name} participates enthusiastically but continues to make terrible financial decisions.",
    "Has never once turned in the assignment titled \"sell\".",
  ],
  riskManagement: [
    "Was found running with scissors. Again.",
    "Mother requested conference.",
  ],
};

const STATUS: Partial<Record<Status, string[]>> = {
  "HONOR ROLL": [
    "{name} is a pleasure to have in class. We are frankly suspicious.",
    "We believe {name} may be copying trades from another student.",
  ],
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": [
    "Other students have been observed selling to {name} at lunch.",
    "{name} is always the last one holding the ball when the music stops.",
  ],
  EXPELLED: ["Please collect {name}'s belongings from the front office."],
  "HELD BACK": ["{name} will be repeating this semester. And, statistically, the next one."],
};

const INCIDENT: Partial<Record<Incident, string>> = {
  WHALE: "{name} has been referred to the Gifted & Talented program. Parents are advised to hide their wallets.",
  RUGGED: "{name} was sent to the nurse after a token pulled the rug. Ice pack administered.",
  FIGHT_IN_CAFETERIA: "{name} was involved in an altercation in the cafeteria involving twelve trades in one hour.",
};

const GENERIC = [
  "Bright student. Refuses to learn.",
  "Shows promise when supervised.",
  "{name} talks a lot in class about \"generational wealth\".",
  "Has been seen trading during the fire drill.",
  "{name} insists the test is \"still early\".",
  "Would do better if {name} slept at night.",
];

export function teacherComments(
  rand: () => number,
  name: string,
  subjects: SubjectGrade[],
  status: Status,
  incidents: Incident[],
  count = 2,
): string[] {
  const candidates: string[] = [];
  for (const i of incidents) if (INCIDENT[i]) candidates.push(INCIDENT[i]!);
  const statusPool = STATUS[status];
  if (statusPool) candidates.push(pick(rand, statusPool));
  for (const s of subjects) {
    if (s.score === null) continue;
    const pool = s.score >= 80 ? HIGH[s.key] : s.score < 60 ? LOW[s.key] : undefined;
    if (pool) candidates.push(pick(rand, pool));
  }

  const chosen: string[] = [];
  // Incidents always make the card; the rest compete for remaining slots.
  const incidentLines = candidates.filter((c) => Object.values(INCIDENT).includes(c));
  chosen.push(...incidentLines.slice(0, count));
  const rest = candidates.filter((c) => !chosen.includes(c));
  while (chosen.length < count && rest.length > 0) {
    chosen.push(rest.splice(Math.floor(rand() * rest.length), 1)[0]);
  }
  const generic = [...GENERIC];
  while (chosen.length < count) {
    chosen.push(generic.splice(Math.floor(rand() * generic.length), 1)[0]);
  }
  return chosen.map((c) => c.replaceAll("{name}", name));
}
