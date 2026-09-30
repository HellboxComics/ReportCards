import { describe, expect, it } from "vitest";
import { letter } from "./grading";
import { DEMO_STUDENTS, mockActivity } from "./providers/mock";
import { buildReportCard } from "./reportCard";
import { semesterByIndex } from "./semester";
import {
  bestVice,
  cardImagePath,
  cardPath,
  customName,
  gradeRank,
  isBackhanded,
  leadSubject,
  SHARE_HOOKS,
  shareLead,
  shareText,
  shareTitle,
  statusLines,
  statusTone,
  tickerItems,
  textWidth,
  widestWord,
  worstSubject,
  withArticle,
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

  it("reads like a post: the funniest grade, the circled one, the status and a hook", () => {
    const text = shareText(card);
    const lines = text.split("\n");
    const lead = leadSubject(card)!;
    const worst = worstSubject(card.subjects)!;
    // EXIT LIQUIDITY leads with the backhanded grade that earned it...
    expect(isBackhanded(lead)).toBe(true);
    expect(["buyingTheTop", "chasingMemes"]).toContain(lead.key);
    expect(lines[0]).toContain(`${lead.grade} in ${lead.name}`);
    // ...and still owns up to the circled F.
    expect(lines[1]).toContain(`${withArticle(worst.grade)} in ${worst.name}`);
    expect(text).toContain("MOST LIKELY TO BECOME EXIT LIQUIDITY");
    expect(SHARE_HOOKS).toContain(lines.at(-1));
    expect(text.length).toBeLessThan(250);
  });

  it("leads with the backhanded A, then the failing virtue grade", () => {
    const text = shareText({
      subjects: subjects({ takingProfit: 5, holdingBags: 99, riskManagement: 70 }),
      status: "HELD BACK",
      incidents: [],
      address: "0xabc",
    });
    const [first, second] = text.split("\n");
    expect(first).toMatch(/A\+ in Holding Bags/);
    expect(second).toMatch(/^(And|Plus) an F in Taking Profit/);
    expect(text).toContain("HELD BACK");
  });

  it("brags about incidents", () => {
    const text = shareText({
      subjects: subjects({ takingProfit: 90, riskManagement: 85, buyingTheTop: 98 }),
      status: "NEEDS IMPROVEMENT",
      incidents: ["WHALE", "FIGHT_IN_CAFETERIA"],
    });
    expect(text.split("\n")[0]).toContain("A+ in Buying the Top");
    expect(text).toContain("gifted program");
  });

  it("leads an honor-roll post with the honor roll, not a D", () => {
    const honor = shareText({
      subjects: subjects({ takingProfit: 68, riskManagement: 85, buyingTheTop: 5, holdingBags: 0 }),
      status: "HONOR ROLL",
      incidents: [],
    });
    expect(honor.split("\n")[0]).toMatch(/HONOR ROLL/);
    expect(honor).toContain("a D+ in Taking Profit");
    expect(honor.match(/HONOR ROLL/g)).toHaveLength(1);
  });

  it("gives different demo wallets different opening lines, hooks and headlines", () => {
    const cards = DEMO_STUDENTS.map((d) => buildReportCard(mockActivity(d.address, s, now), s, { now }));
    const leads = cards.map(shareLead);
    // the four screenshot demos (expelled, exit liquidity, honor roll, whale) never share a lead
    expect(new Set([0, 1, 2, 5].map((i) => leads[i])).size).toBe(4);
    expect(new Set(leads).size).toBeGreaterThanOrEqual(6);
    // and they don't all lead with the same subject
    expect(new Set(cards.map((c) => leadSubject(c)?.key)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(cards.map((c) => shareText(c).split("\n").at(-1))).size).toBeGreaterThanOrEqual(3);
    expect(new Set(cards.map(shareTitle)).size).toBeGreaterThanOrEqual(6);
    for (const c of cards) expect(shareText(c).length).toBeLessThan(250);
  });

  it("rotates between tied backhanded grades by wallet, and is stable per wallet", () => {
    const sub = subjects({ buyingTheTop: 95, holdingBags: 95, chasingMemes: 95, takingProfit: 0 });
    const picks = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const c = { subjects: sub, status: "HELD BACK" as const, incidents: [], address: `0x${i}` };
      picks.add(leadSubject(c)!.key);
      expect(shareText(c)).toBe(shareText({ ...c }));
    }
    expect(picks.size).toBe(3);
    // SEE ME stays on the true worst grade
    expect(worstSubject(sub)?.key).toBe("takingProfit");
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

  it("builds ticker items that lead with the verdict, the lead grade and the circled one", () => {
    const items = tickerItems(card);
    const lead = leadSubject(card)!;
    expect(items[0]).toBe(card.status);
    expect(items[1]).toContain(`IN ${lead.name.toUpperCase()} (NOT A COMPLIMENT)`);
    expect(items).toContain("SHOW ME YOUR GRADES");
    expect(items.some((i) => i.includes("IN TAKING PROFIT") && i.includes("SEE ME"))).toBe(true);
  });
});

describe("share links", () => {
  it("always pins the term, and carries the name for both the page and its image", () => {
    expect(cardPath("0xabc", 7)).toBe("/card/0xabc?term=7");
    expect(cardPath("0xabc", 7, "Jamie Doe")).toBe("/card/0xabc?term=7&name=Jamie+Doe");
    expect(cardImagePath("0xabc", 6, "  ")).toBe("/card/0xabc/opengraph-image?term=6");
    const u = new URL(cardImagePath("0xabc", 6, "Jamie & Co"), "https://x.test");
    expect(u.searchParams.get("name")).toBe("Jamie & Co");
  });

  it("knows when the student name is just the short address", () => {
    const s = semesterByIndex(3);
    const now = s.end + 1;
    const addr = "0x0000000000000000000000000000000000000002";
    expect(customName(buildReportCard(mockActivity(addr, s, now), s, { now }))).toBeUndefined();
    expect(
      customName(buildReportCard(mockActivity(addr, s, now), s, { now, studentName: "Jamie Doe" })),
    ).toBe("Jamie Doe");
  });

  it("marks A-range vice grades as backhanded", () => {
    const s = subjects({ buyingTheTop: 97, takingProfit: 99, holdingBags: 70 });
    expect(isBackhanded(s[0])).toBe(true);
    expect(isBackhanded(s[1])).toBe(false);
    expect(isBackhanded(s[3])).toBe(false);
  });
});
