import { writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DEMO_STUDENTS, mockActivity } from "@/lib/providers/mock";
import { buildReportCard } from "@/lib/reportCard";
import { semesterByIndex } from "@/lib/semester";
import { OG_SIZE, renderCardImage } from "./CardImage";

/** Satori layout mistakes only show up at render time, so render every archetype. */
describe("renderCardImage", () => {
  it("renders every pinned demo student to a 1200x630 PNG", async () => {
    const s = semesterByIndex(3);
    const now = s.end + 1;
    for (const [n, d] of DEMO_STUDENTS.entries()) {
      const card = buildReportCard(mockActivity(d.address, s, now), s, {
        now,
        studentName: n % 2 ? "Jamie Doe" : undefined,
      });
      const png = Buffer.from(await (await renderCardImage(card)).arrayBuffer());
      expect(png.subarray(1, 4).toString()).toBe("PNG");
      expect(png.readUInt32BE(16)).toBe(OG_SIZE.width);
      expect(png.readUInt32BE(20)).toBe(OG_SIZE.height);
      // OG_DUMP=dir writes the renders out for eyeballing.
      if (process.env.OG_DUMP) writeFileSync(path.join(process.env.OG_DUMP, `og-${d.label.replace(/\W+/g, "-")}.png`), png);
    }
  }, 60000);
});
