import type {
  Incident,
  LetterGrade,
  Status,
  SubjectGrade,
  SubjectKey,
  Trade,
  WalletActivity,
} from "./types";

/**
 * Every subject scores 0-100 for *how much the wallet does the thing named*.
 * "A+ in Buying the Top" means you are extremely good at buying the top.
 * `vice` marks subjects where a high score is bad for academic standing.
 */
export const SUBJECTS: { key: SubjectKey; name: string; vice: boolean }[] = [
  { key: "buyingTheTop", name: "Buying the Top", vice: true },
  { key: "takingProfit", name: "Taking Profit", vice: false },
  { key: "riskManagement", name: "Risk Management", vice: false },
  { key: "holdingBags", name: "Holding Bags", vice: true },
  { key: "chasingMemes", name: "Chasing Memes", vice: true },
  { key: "sellingTooEarly", name: "Selling Too Early", vice: true },
];

/** Minimum sample before a subject gets a real grade instead of Incomplete. */
const MIN_SAMPLE = 3;

const CUTOFFS: [number, LetterGrade][] = [
  [97, "A+"], [93, "A"], [90, "A-"],
  [87, "B+"], [83, "B"], [80, "B-"],
  [77, "C+"], [73, "C"], [70, "C-"],
  [67, "D+"], [63, "D"], [60, "D-"],
];

export function letter(score: number | null): LetterGrade {
  if (score === null) return "I";
  for (const [min, g] of CUTOFFS) if (score >= min) return g;
  return "F";
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** USD-weighted share of `trades` matching `pred`, as 0-100. */
function weightedShare(trades: Trade[], pred: (t: Trade) => boolean): number {
  const total = sum(trades.map((t) => t.amountUsd));
  if (total <= 0) return 0;
  return (100 * sum(trades.filter(pred).map((t) => t.amountUsd))) / total;
}

export function scoreSubjects(a: WalletActivity): Record<SubjectKey, number | null> {
  const buys = a.trades.filter((t) => t.side === "buy");
  const sells = a.trades.filter((t) => t.side === "sell");
  const pricedBuys = buys.filter((t) => t.price);
  const pricedSells = sells.filter((t) => t.price);
  const buyVol = sum(buys.map((t) => t.amountUsd));
  const sellVol = sum(sells.map((t) => t.amountUsd));

  const buyingTheTop =
    pricedBuys.length >= MIN_SAMPLE
      ? weightedShare(pricedBuys, (t) => t.price!.atTrade >= 0.9 * t.price!.high7dBefore)
      : null;

  // Never selling is a hard F, not an Incomplete.
  let takingProfit: number | null = null;
  if (buys.length >= MIN_SAMPLE) {
    const known = sells.filter((t) => t.realizedPnlUsd !== undefined);
    if (sells.length === 0) takingProfit = 0;
    else if (known.length > 0) {
      const winShare = known.filter((t) => t.realizedPnlUsd! > 0).length / known.length;
      const exitRatio = buyVol > 0 ? Math.min(1, (2 * sellVol) / buyVol) : 0;
      takingProfit = clamp(100 * winShare * (0.5 + 0.5 * exitRatio));
    }
  }

  let riskManagement: number | null = null;
  if (a.liquidated) riskManagement = 0;
  else if (a.trades.length >= MIN_SAMPLE) {
    const byToken = new Map<string, number>();
    for (const t of a.trades) {
      byToken.set(t.token.address, (byToken.get(t.token.address) ?? 0) + t.amountUsd);
    }
    const vol = buyVol + sellVol;
    const concentration = vol > 0 ? Math.max(...byToken.values()) / vol : 1;
    const memeShare = weightedShare(buys, (t) => t.token.category === "meme") / 100;
    const posValue = sum(a.positions.map((p) => p.valueUsd));
    const stableShare =
      posValue > 0
        ? sum(a.positions.filter((p) => p.token.category === "stable").map((p) => p.valueUsd)) /
          posValue
        : 0;
    riskManagement = clamp(
      100 * (0.4 * (1 - concentration) + 0.35 * (1 - memeShare) + 0.25 * Math.min(1, stableShare * 3)),
    );
  }

  const priced = a.positions.filter(
    (p) => p.unrealizedReturn !== undefined && p.token.category !== "stable",
  );
  const pricedValue = sum(priced.map((p) => p.valueUsd));
  const holdingBags =
    priced.length > 0 && pricedValue > 0
      ? (100 *
          sum(priced.filter((p) => p.unrealizedReturn! <= -0.4).map((p) => p.valueUsd))) /
        pricedValue
      : null;

  const chasingMemes =
    buys.length >= MIN_SAMPLE ? weightedShare(buys, (t) => t.token.category === "meme") : null;

  const sellingTooEarly =
    pricedSells.length >= MIN_SAMPLE
      ? weightedShare(pricedSells, (t) => t.price!.max7dAfter >= 1.3 * t.price!.atTrade)
      : null;

  return {
    buyingTheTop,
    takingProfit,
    riskManagement,
    holdingBags,
    chasingMemes,
    sellingTooEarly,
  };
}

const REMARKS: Record<SubjectKey, [string, string]> = {
  // [remark when score is high, remark when score is low]
  buyingTheTop: ["Natural talent", "Occasionally early"],
  takingProfit: ["Knows when to leave", "Has never left"],
  riskManagement: ["Wears a helmet", "Runs with scissors"],
  holdingBags: ["Strong back", "Travels light"],
  chasingMemes: ["Easily distracted", "Pays attention"],
  sellingTooEarly: ["Leaves before dessert", "Stays for the ending"],
};

export function gradeSubjects(a: WalletActivity): SubjectGrade[] {
  const scores = scoreSubjects(a);
  return SUBJECTS.map(({ key, name }) => {
    const score = scores[key] === null ? null : Math.round(scores[key]!);
    const remark =
      score === null ? "Did not turn in work" : REMARKS[key][score >= 60 ? 0 : 1];
    return { key, name, score, grade: letter(score), remark };
  });
}

/** 0-100, higher is better. Vice subjects count inverted. Null if nothing is graded. */
export function academicStanding(subjects: SubjectGrade[]): number | null {
  const graded = subjects.filter((s) => s.score !== null);
  if (graded.length === 0) return null;
  const virtue = graded.map((s) => {
    const vice = SUBJECTS.find((x) => x.key === s.key)!.vice;
    return vice ? 100 - s.score! : s.score!;
  });
  return Math.round(sum(virtue) / virtue.length);
}

export function attendance(activeDays: number, daysInSession: number) {
  const r = activeDays / daysInSession;
  const label =
    activeDays === 0
      ? "NEVER SHOWED UP"
      : r >= 0.95
        ? "PERFECT"
        : r >= 0.75
          ? "EXCELLENT"
          : r >= 0.5
            ? "SATISFACTORY"
            : r >= 0.2
              ? "SPOTTY"
              : "CHRONICALLY ABSENT";
  return { label, daysPresent: activeDays, daysInSession };
}

const HOUR_MS = 60 * 60 * 1000;
const WHALE_USD = 1_000_000;

export function detectIncidents(a: WalletActivity): Incident[] {
  const out: Incident[] = [];
  const volume = sum(a.trades.map((t) => t.amountUsd));
  const holdings = sum(a.positions.map((p) => p.valueUsd));
  if (volume >= WHALE_USD || holdings >= WHALE_USD) out.push("WHALE");
  if (a.positions.some((p) => p.token.category === "meme" && (p.unrealizedReturn ?? 0) <= -0.9)) {
    out.push("RUGGED");
  }
  if (a.liquidated) out.push("LIQUIDATED");

  // A dozen trades inside any single hour is a fight, not a strategy.
  const ts = a.trades.map((t) => t.timestamp).sort((x, y) => x - y);
  for (let i = 0, j = 0; j < ts.length; j++) {
    while (ts[j] - ts[i] > HOUR_MS) i++;
    if (j - i + 1 >= 12) {
      out.push("FIGHT_IN_CAFETERIA");
      break;
    }
  }
  return out;
}

export function determineStatus(
  subjects: SubjectGrade[],
  standing: number | null,
  incidents: Incident[],
  tradeCount: number,
): Status {
  if (incidents.includes("LIQUIDATED")) return "EXPELLED";
  const score = (k: SubjectKey) => subjects.find((s) => s.key === k)?.score ?? null;
  const top = score("buyingTheTop");
  const memes = score("chasingMemes");
  const profit = score("takingProfit");
  if (top !== null && memes !== null && top >= 90 && memes >= 80 && (profit ?? 0) < 60) {
    return "MOST LIKELY TO BECOME EXIT LIQUIDITY";
  }
  if (tradeCount === 0 || standing === null) return "HELD BACK";
  if (standing >= 80) return "HONOR ROLL";
  if (standing >= 62) return "NEEDS IMPROVEMENT";
  if (standing >= 45) return "ACADEMIC PROBATION";
  if (standing >= 30) return "HELD BACK";
  if (standing >= 18) return "SUSPENDED";
  return "EXPELLED";
}
