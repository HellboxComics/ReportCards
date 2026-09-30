import { describe, expect, it } from "vitest";
import {
  academicStanding,
  detectIncidents,
  determineStatus,
  gradeSubjects,
  letter,
} from "./grading";
import type { Trade, WalletActivity } from "./types";

const meme = { address: "0xmeme", symbol: "MEME", category: "meme" as const };
const stock = { address: "0xtsla", symbol: "TSLA", category: "stock" as const };

function trade(p: Partial<Trade>): Trade {
  return {
    txHash: "0x",
    timestamp: 0,
    side: "buy",
    token: meme,
    amountUsd: 100,
    ...p,
  };
}

function wallet(p: Partial<WalletActivity>): WalletActivity {
  return {
    address: "0x0000000000000000000000000000000000000001",
    activeDays: [],
    trades: [],
    positions: [],
    transfersOut: 0,
    liquidated: false,
    source: "mock",
    ...p,
  };
}

const grade = (w: WalletActivity, key: string) => gradeSubjects(w).find((s) => s.key === key)!;

describe("letter", () => {
  it("maps scores to letters", () => {
    expect(letter(100)).toBe("A+");
    expect(letter(93)).toBe("A");
    expect(letter(60)).toBe("D-");
    expect(letter(59.9)).toBe("F");
    expect(letter(null)).toBe("I");
  });
});

describe("subjects", () => {
  it("gives an A+ in Buying the Top to someone who always buys the top", () => {
    const top = { atTrade: 10, high7dBefore: 10, max7dAfter: 10 };
    const w = wallet({ trades: [1, 2, 3].map(() => trade({ price: top })) });
    expect(grade(w, "buyingTheTop").grade).toBe("A+");
  });

  it("marks price-dependent subjects Incomplete without price data", () => {
    const w = wallet({ trades: [1, 2, 3].map(() => trade({})) });
    expect(grade(w, "buyingTheTop").grade).toBe("I");
    expect(grade(w, "sellingTooEarly").grade).toBe("I");
  });

  it("fails Taking Profit when the wallet never sells", () => {
    const w = wallet({ trades: [1, 2, 3].map(() => trade({})) });
    expect(grade(w, "takingProfit").grade).toBe("F");
  });

  it("grades Chasing Memes by meme share of buy volume", () => {
    const w = wallet({
      trades: [trade({}), trade({}), trade({}), trade({ token: stock, amountUsd: 300 })],
    });
    expect(grade(w, "chasingMemes").score).toBe(50);
  });

  it("zeroes Risk Management when liquidated", () => {
    expect(grade(wallet({ liquidated: true }), "riskManagement").grade).toBe("F");
  });
});

describe("incidents and status", () => {
  it("detects a fight in the cafeteria", () => {
    const trades = Array.from({ length: 12 }, (_, i) => trade({ timestamp: i * 60_000 }));
    expect(detectIncidents(wallet({ trades }))).toContain("FIGHT_IN_CAFETERIA");
  });

  it("expels liquidated wallets", () => {
    const w = wallet({ liquidated: true });
    const subjects = gradeSubjects(w);
    expect(determineStatus(subjects, academicStanding(subjects), detectIncidents(w), 0)).toBe(
      "EXPELLED",
    );
  });

  it("flags future exit liquidity", () => {
    const top = { atTrade: 10, high7dBefore: 10, max7dAfter: 10 };
    const w = wallet({ trades: [1, 2, 3].map(() => trade({ price: top })) });
    const subjects = gradeSubjects(w);
    expect(determineStatus(subjects, academicStanding(subjects), [], 3)).toBe(
      "MOST LIKELY TO BECOME EXIT LIQUIDITY",
    );
  });

  it("holds back wallets that never traded", () => {
    const subjects = gradeSubjects(wallet({}));
    expect(determineStatus(subjects, academicStanding(subjects), [], 0)).toBe("HELD BACK");
  });
});
