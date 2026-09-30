import { describe, expect, it } from "vitest";
import { letter } from "./grading";
import { mockActivity } from "./providers/mock";
import { buildReportCard } from "./reportCard";
import { semesterByIndex } from "./semester";
import {
  bestVice,
  gradeRank,
  shareText,
  statusLines,
  statusTone,
  tickerItems,
  textWidth,
  widestWord,
  worstSubject,
  xIntentUrl,
} from "./share";
import type { SubjectGrade, SubjectKey } from "./types";

const NAMES: Record<SubjectKey, string> = {
  buyingTheTop: "Buying the Top",
  takingProfit: "Taking Profit",
  riskManagement: "Risk Management",
  holdingBags: "Holding Bags",
  chasingMemes: "Chasing Memes",
  sellingTooEarly: "Selling Too Early",
};

function subjects(scores: Partial<Record<SubjectKey, number | null>>): SubjectGrade[] {
  return (Object.keys(NAMES) as SubjectKey[]).map((key) => {
    const score = scores[key] ?? null;
    return { key, name: NAMES[key], score, grade: letter(score), remark: "" };
  });
}

describe("gradeRank", () => {
  it("orders F below A+ and leaves Incomplete unranked", () => {
    expect(gradeRank("F")).toBe(0);
    expect(gradeRank("A+")).toBeGreaterThan(gradeRank("B")!);
    expect(gradeRank("I")).toBeNull();
  });
});

describe("worstSubject", () => {
  it("circles a failing grade in a subject you should be good at", () => {
    const s = subjects({ buyingTheTop: 95, takingProfit: 72, riskManagement: 40, chasingMemes: 88 });
    expect(worstSubject(s)?.key).toBe("riskManagement");
  });

  it("prefers Taking Profit when both virtue subjects fail, and ignores vice Fs", () => {
    const s = subjects({ sellingTooEarly: 10, takingProfit: 30, riskManagement: 20 });
    expect(worstSubject(s)?.key).toBe("takingProfit");
  });

  it("circles an A in a vice subject when nothing is failing", () => {
    const s = subjects({ takingProfit: 85, riskManagement: 90, buyingTheTop: 98, holdingBags: 10 });
    expect(worstSubject(s)?.key).toBe("buyingTheTop");
  });

  it("never circles a vice F (that is good behavior) over a weak virtue grade", () => {
    const s = subjects({ buyingTheTop: 20, holdingBags: 0, takingProfit: 67, riskManagement: 70 });
    expect(worstSubject(s)?.key).toBe("takingProfit");
  });

  it("ignores Incomplete and returns null when nothing is graded", () => {
    expect(worstSubject(subjects({}))).toBeNull();
    expect(worstSubject(subjects({ holdingBags: 85 }))?.key).toBe("holdingBags");
  });
});

describe("bestVice", () => {
  it("finds the A-range grade in a subject you should be bad at", () => {
    const s = subjects({ buyingTheTop: 95, holdingBags: 100, takingProfit: 99 });
    expect(bestVice(s)?.key).toBe("holdingBags");
  });

  it("returns null without an A in a vice subject", () => {
    expect(bestVice(subjects({ buyingTheTop: 85, takingProfit: 100 }))).toBeNull();
  });
});

describe("status helpers", () => {
  it("splits long statuses into a kicker and a main line", () => {
    expect(statusLines("MOST LIKELY TO BECOME EXIT LIQUIDITY")).toEqual({
      kicker: "MOST LIKELY TO BECOME",
      main: "EXIT LIQUIDITY",
    });
    expect(statusLines("EXPELLED")).toEqual({ main: "EXPELLED" });
  });

  it("colors only honor roll as good", () => {
    expect(statusTone("HONOR ROLL")).toBe("good");
    expect(statusTone("NEEDS IMPROVEMENT")).toBe("meh");
    expect(statusTone("EXPELLED")).toBe("bad");
  });
});

describe("widestWord", () => {
  it("measures the widest word with narrow and wide letters", () => {
    expect(widestWord("EXIT LIQUIDITY")).toBe(7.5);
    expect(widestWord("IMPROVEMENT")).toBeCloseTo(11.1);
    expect(widestWord("")).toBe(1);
  });

  it("measures a whole line with half-width spaces", () => {
    expect(textWidth("EXIT LIQUIDITY")).toBe(11.5);
    expect(textWidth("HELD BACK")).toBe(8.5);
  });
});

describe("shareText / xIntentUrl", () => {
  const s = semesterByIndex(3);
  const now = s.end + 1;
  const addr = "0x0000000000000000000000000000000000000001";
  const card = buildReportCard(mockActivity(addr, s, now), s, { now });

  it("names the worst grade, the status and the hook", () => {
    const text = shareText(card);
    const worst = worstSubject(card.subjects)!;
    expect(text).toContain(`${worst.grade} in ${worst.name}`);
    expect(text).toContain(`status: ${card.status}`);
    expect(text).toContain("show me your grades");
    expect(text.length).toBeLessThan(250);
  });

  it("encodes text and url for the X intent", () => {
    const url = xIntentUrl("F in Taking Profit & A+ in #bags\nlol", "https://x.test/card/0x1?name=Jamie Doe");
    expect(url.startsWith("https://x.com/intent/post?text=")).toBe(true);
    const parsed = new URL(url);
    expect(parsed.searchParams.get("text")).toBe("F in Taking Profit & A+ in #bags\nlol");
    expect(parsed.searchParams.get("url")).toBe("https://x.test/card/0x1?name=Jamie Doe");
    expect(url).not.toContain(" ");
    expect(url).not.toContain("#");
  });

  it("builds ticker items that lead with the worst grade", () => {
    const items = tickerItems(card);
    expect(items[0]).toContain(card.status);
    expect(items).toContain("SHOW ME YOUR GRADES");
  });
});
