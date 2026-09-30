import { mockActivity } from "./providers/mock";
import { hashString } from "./random";
import { buildReportCard } from "./reportCard";
import { semesterAt } from "./semester";
import type { ReportCard, Status } from "./types";

export const SAMPLE_NAME = "Jamie Doe";

/** A plausible-looking demo wallet address, deterministic per index. */
export function demoAddress(i: number): string {
  let hex = "";
  for (let k = 0; hex.length < 40; k++) hex += hashString(`demo:${i}:${k}`).toString(16).padStart(8, "0");
  return `0x${hex.slice(0, 40)}`;
}

/**
 * The landing page's sample card. Always mock data (and stamped as such), and
 * picks the first demo wallet that lands the wanted status this semester.
 */
export function sampleCard(
  now: number,
  want: Status = "MOST LIKELY TO BECOME EXIT LIQUIDITY",
): ReportCard {
  const semester = semesterAt(now);
  let first: ReportCard | null = null;
  for (let i = 0; i < 48; i++) {
    const address = demoAddress(i);
    const card = buildReportCard(mockActivity(address, semester, now), semester, {
      now,
      studentName: SAMPLE_NAME,
    });
    if (card.status === want) return card;
    first ??= card;
  }
  return first!;
}
