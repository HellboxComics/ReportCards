import { describe, expect, it } from "vitest";
import { letter } from "./grading";
import { isGoodFail, marginNotes, seededOrder } from "./notes";
import { DEMO_STUDENTS, mockActivity } from "./providers/mock";
import { buildReportCard } from "./reportCard";
import { semesterByIndex } from "./semester";
import { leadSubject, worstSubject } from "./share";
import type { SubjectGrade, SubjectKey } from "./types";

const KEYS: SubjectKey[] = ["buyingTheTop", "takingProfit", "riskManagement", "holdingBags", "chasingMemes", "sellingTooEarly"];

function subjects(scores: Partial<Record<SubjectKey, number | null>>): SubjectGrade[] {
  return KEYS.map((key) => {
    const score = scores[key] ?? null;
    return { key, name: key, score, grade: letter(score), remark: "" };
  });
}

describe("marginNotes", () => {
  it("writes at most two backhanded notes, never the same one twice", () => {
    const card = { subjects: subjects({ buyingTheTop: 95, holdingBags: 99, chasingMemes: 95, sellingTooEarly: 96, takingProfit: 0 }) };
    for (let i = 0; i < 30; i++) {
      const notes = Object.values(marginNotes({ ...card, address: `0x${i}` }, { skip: "takingProfit" }));
      const red = notes.filter((n) => n.tone === "red");
      expect(red).toHaveLength(2);
      expect(new Set(notes.map((n) => n.text)).size).toBe(notes.length);
    }
  });

  it("varies the backhanded note per wallet instead of repeating one joke", () => {
    const texts = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const card = { subjects: subjects({ buyingTheTop: 95, takingProfit: 0 }), address: `0x${i}` };
      texts.add(marginNotes(card).buyingTheTop!.text);
    }
    expect(texts.size).toBeGreaterThanOrEqual(3);
  });

  it("marks a D or F in a bad habit as the good kind, lowest first, on at most two rows", () => {
    const card = { subjects: subjects({ buyingTheTop: 0, holdingBags: 66, chasingMemes: 10, sellingTooEarly: 20, takingProfit: 90, riskManagement: 90 }) };
    const notes = marginNotes(card);
    const green = Object.entries(notes).filter(([, n]) => n.tone === "green").map(([k]) => k);
    expect(green).toHaveLength(2);
    expect(green).not.toContain("holdingBags"); // the D grades wait behind the Fs
    expect(notes.takingProfit).toBeUndefined(); // virtue subjects never get the good-kind note
    expect(isGoodFail({ key: "buyingTheTop", grade: "F" })).toBe(true);
    expect(isGoodFail({ key: "takingProfit", grade: "F" })).toBe(false);
    expect(isGoodFail({ key: "holdingBags", grade: "C-" })).toBe(false);
  });

  it("skips the circled row and always annotates the grade the post leads with", () => {
    const card = { subjects: subjects({ buyingTheTop: 94, holdingBags: 99, chasingMemes: 94, takingProfit: 0 }), address: "0x1" };
    for (const prefer of ["buyingTheTop", "chasingMemes"] as const) {
      const notes = marginNotes(card, { skip: "takingProfit", prefer });
      expect(notes[prefer]?.tone).toBe("red");
      expect(notes.takingProfit).toBeUndefined();
    }
  });

  it("gives the honor-roll demo green notes so its Fs read as good news", () => {
    const s = semesterByIndex(3);
    const now = s.end + 1;
    const d = DEMO_STUDENTS.find((x) => x.label === "HONOR ROLL")!;
    const card = buildReportCard(mockActivity(d.address, s, now), s, { now });
    const notes = Object.values(
      marginNotes(card, { skip: worstSubject(card.subjects)?.key, prefer: leadSubject(card)?.key }),
    );
    expect(notes.length).toBeGreaterThan(0);
    expect(notes.every((n) => n.tone === "green")).toBe(true);
    // stable per card
    expect(marginNotes(card)).toEqual(marginNotes(card));
  });
});

describe("seededOrder", () => {
  it("is a stable permutation", () => {
    const xs = [1, 2, 3, 4, 5];
    expect(seededOrder(xs, 7)).toEqual(seededOrder(xs, 7));
    expect([...seededOrder(xs, 7)].sort()).toEqual(xs);
  });
});
