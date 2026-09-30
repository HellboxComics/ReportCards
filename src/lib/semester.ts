import type { Semester } from "./types";

export const SEMESTER_DAYS = 44;
const DAY_MS = 24 * 60 * 60 * 1000;
const SEMESTER_MS = SEMESTER_DAYS * DAY_MS;

/** First day of school. Every semester boundary is counted from here. */
export const GENESIS = Date.UTC(2026, 0, 1);

function season(ms: number): string {
  const d = new Date(ms);
  const m = d.getUTCMonth();
  // December belongs to the following year's winter.
  const year = m === 11 ? d.getUTCFullYear() + 1 : d.getUTCFullYear();
  const name =
    m === 11 || m <= 1 ? "WINTER" : m <= 4 ? "SPRING" : m <= 7 ? "SUMMER" : "FALL";
  return `${name} ${year}`;
}

export function semesterByIndex(index: number): Semester {
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`invalid semester index: ${index}`);
  }
  const start = GENESIS + index * SEMESTER_MS;
  const end = start + SEMESTER_MS;
  return { index, term: index + 1, start, end, label: season(start + SEMESTER_MS / 2) };
}

export function semesterAt(ms: number): Semester {
  if (ms < GENESIS) throw new Error("school was not in session yet");
  return semesterByIndex(Math.floor((ms - GENESIS) / SEMESTER_MS));
}

export function daysInSession(s: Semester, now: number): number {
  const until = Math.min(now, s.end);
  return Math.max(1, Math.ceil((until - s.start) / DAY_MS));
}

export function isLocked(s: Semester, now: number): boolean {
  return now >= s.end;
}

/** Whole days until the semester locks (0 once it has). */
export function daysUntilLock(s: Semester, now: number): number {
  return Math.max(0, Math.ceil((s.end - now) / DAY_MS));
}
