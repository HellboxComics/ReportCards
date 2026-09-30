import { describe, expect, it } from "vitest";
import { buildReportCard } from "../reportCard";
import { semesterByIndex } from "../semester";
import { DEMO_STUDENTS, mockActivity } from "./mock";

describe("pinned demo students", () => {
  it("land their promised status and incidents in every semester", () => {
    for (let idx = 0; idx < 10; idx++) {
      const s = semesterByIndex(idx);
      for (const now of [s.start + 12 * 86_400_000, s.end + 1]) {
        for (const d of DEMO_STUDENTS) {
          const card = buildReportCard(mockActivity(d.address, s, now), s, { now });
          if (d.wants.status) expect(card.status, `${d.label} term ${s.term}`).toBe(d.wants.status);
          for (const i of d.wants.incidents ?? []) expect(card.incidents, `${d.label} term ${s.term}`).toContain(i);
        }
      }
    }
  });

  it("hand in every subject when the archetype can (the showcase cards)", () => {
    const s = semesterByIndex(6);
    const now = s.start + 20 * 86_400_000;
    for (const d of DEMO_STUDENTS.filter((x) => ["HONOR ROLL", "EXIT LIQUIDITY", "EXPELLED", "WHALE"].includes(x.label))) {
      const card = buildReportCard(mockActivity(d.address, s, now), s, { now });
      expect(card.subjects.map((x) => x.grade), d.label).not.toContain("I");
    }
  });

  it("cover every status", () => {
    const statuses = new Set(DEMO_STUDENTS.map((d) => d.wants.status).filter(Boolean));
    expect(statuses.size).toBe(7);
  });

  it("are deterministic and keep the caller's address casing", () => {
    const s = semesterByIndex(4);
    const now = s.end + 1;
    const a = mockActivity(DEMO_STUDENTS[2].address.toUpperCase().replace("0X", "0x"), s, now);
    const b = mockActivity(DEMO_STUDENTS[2].address, s, now);
    expect(a.trades).toEqual(b.trades);
    expect(a.address).toBe(DEMO_STUDENTS[2].address.toUpperCase().replace("0X", "0x"));
  });
});
