import { describe, expect, it } from "vitest";
import { fillName } from "./comments";
import { mockActivity } from "./providers/mock";
import { buildReportCard } from "./reportCard";
import { semesterByIndex } from "./semester";

describe("buildReportCard", () => {
  const s = semesterByIndex(3);
  const now = s.end + 1;

  it("prints the same card for the same wallet and semester", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    const a = buildReportCard(mockActivity(addr, s, now), s, { now, studentName: "Jamie Doe" });
    const b = buildReportCard(mockActivity(addr, s, now), s, { now, studentName: "Jamie Doe" });
    expect(a).toEqual(b);
    expect(a.locked).toBe(true);
    expect(a.teacherComments).toHaveLength(2);
    expect(a.teacherComments.join(" ")).not.toContain("{name}");
  });

  it("produces a variety of statuses across wallets", () => {
    const statuses = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const addr = `0x${i.toString(16).padStart(40, "0")}`;
      statuses.add(buildReportCard(mockActivity(addr, s, now), s, { now }).status);
    }
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });
});

describe("Harrow's voice", () => {
  it("says 'this student' (never the wallet address) when the card has no name", () => {
    expect(fillName("{name} was sent to the nurse.", undefined)).toBe("This student was sent to the nurse.");
    expect(fillName("Please collect {name}'s belongings. {name} left.", undefined)).toBe(
      "Please collect this student's belongings. This student left.",
    );
    expect(fillName("Selling to {name} at lunch.", "Jamie")).toBe("Selling to Jamie at lunch.");
    const s = semesterByIndex(3);
    const now = s.end + 1;
    for (let i = 0; i < 12; i++) {
      const addr = `0x${i.toString(16).padStart(40, "0")}`;
      const text = buildReportCard(mockActivity(addr, s, now), s, { now }).teacherComments.join(" ");
      expect(text).not.toContain("0x");
      expect(text).not.toContain("@"); // no real accounts in the comment bank
    }
  });
});
