import type { ReportCard } from "./types";

/** What's printed at the top of the form, per school. No real people. */
export const SCHOOL_NAMES: Record<ReportCard["school"], string> = {
  public: "ROBINHOOD CHAIN PUBLIC SCHOOL NO. 46",
  catholic: "SACRED HEART OF THE PERPETUAL DIP",
  summer: "SUMMER SCHOOL — REMEDIAL FINANCE",
  detention: "OFFICE OF STUDENT DISCIPLINE",
};

export const FORM_TITLES: Record<ReportCard["school"], string> = {
  public: "STUDENT PROGRESS REPORT",
  catholic: "REPORT OF CONDUCT & PROGRESS",
  summer: "SUMMER SESSION PROGRESS REPORT",
  detention: "DETENTION FORM & PROGRESS REPORT",
};

/** The Harrow line that fits a thumbnail best: the first one, unless it rambles. */
export function headlineComment(comments: string[]): string {
  const [a = "", b] = comments;
  return b && a.length > 80 && b.length < a.length ? b : a;
}
