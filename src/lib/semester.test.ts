import { describe, expect, it } from "vitest";
import { GENESIS, SEMESTER_DAYS, daysInSession, isLocked, semesterAt, semesterByIndex } from "./semester";

const DAY = 86_400_000;

describe("semesters", () => {
  it("are 44 days long and contiguous", () => {
    const a = semesterByIndex(0);
    const b = semesterByIndex(1);
    expect(a.end - a.start).toBe(SEMESTER_DAYS * DAY);
    expect(b.start).toBe(a.end);
  });

  it("finds the semester containing a timestamp", () => {
    expect(semesterAt(GENESIS).index).toBe(0);
    expect(semesterAt(GENESIS + 44 * DAY - 1).index).toBe(0);
    expect(semesterAt(GENESIS + 44 * DAY).index).toBe(1);
  });

  it("labels semesters by season", () => {
    expect(semesterByIndex(0).label).toBe("WINTER 2026");
    expect(semesterAt(Date.UTC(2026, 8, 30)).label).toBe("FALL 2026");
  });

  it("locks after the last bell", () => {
    const s = semesterByIndex(2);
    expect(isLocked(s, s.end - 1)).toBe(false);
    expect(isLocked(s, s.end)).toBe(true);
    expect(daysInSession(s, s.start + 3.5 * DAY)).toBe(4);
    expect(daysInSession(s, s.end + 100 * DAY)).toBe(44);
  });
});
