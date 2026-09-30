import { DEMO_STUDENTS, mockActivity } from "./providers/mock";
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
 * A sample card for the landing page, always mock data (and stamped as such).
 * It borrows a pinned demo student's semester, so it lands the wanted status
 * every time, and prints under a plausible-looking address.
 */
export function sampleCard(
  now: number,
  want: Status = "MOST LIKELY TO BECOME EXIT LIQUIDITY",
): ReportCard {
  const semester = semesterAt(now);
  const i = Math.max(0, DEMO_STUDENTS.findIndex((d) => d.wants.status === want));
  const activity = { ...mockActivity(DEMO_STUDENTS[i].address, semester, now), address: demoAddress(i) };
  return buildReportCard(activity, semester, { now, studentName: SAMPLE_NAME });
}
