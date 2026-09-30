import { describe, expect, it } from "vitest";
import { isAddress } from "./providers";
import { SAMPLE_NAME, demoAddress, sampleCard } from "./sample";
import { GENESIS } from "./semester";

describe("sampleCard", () => {
  const now = GENESIS + 300 * 86_400_000;

  it("uses valid, distinct demo addresses", () => {
    expect(isAddress(demoAddress(0))).toBe(true);
    expect(demoAddress(0)).not.toBe(demoAddress(1));
  });

  it("is always labelled demo data and finds the wanted status", () => {
    const card = sampleCard(now);
    expect(card.source).toBe("mock");
    expect(card.studentName).toBe(SAMPLE_NAME);
    expect(card.status).toBe("MOST LIKELY TO BECOME EXIT LIQUIDITY");
  });

  it("lands every status it is asked for", () => {
    for (const want of ["HONOR ROLL", "EXPELLED", "HELD BACK"] as const) {
      expect(sampleCard(now, want).status).toBe(want);
    }
  });

  it("is deterministic", () => {
    expect(sampleCard(now)).toEqual(sampleCard(now));
  });
});
