import { teacherComments } from "./comments";
import {
  academicStanding,
  attendance,
  detectIncidents,
  determineStatus,
  gradeSubjects,
} from "./grading";
import { hashString, mulberry32, pick } from "./random";
import { daysInSession, isLocked } from "./semester";
import type { Era, ReportCard, School, Semester, WalletActivity } from "./types";

const ERAS: Era[] = ["1987-carbon", "1994-dot-matrix", "1994-dot-matrix", "1999-school-office", "2004-inkjet"];

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function buildReportCard(
  activity: WalletActivity,
  semester: Semester,
  opts: { now: number; studentName?: string },
): ReportCard {
  // One seed per wallet per semester: the same card prints every time.
  const rand = mulberry32(hashString(`${activity.address.toLowerCase()}:${semester.index}`));
  const studentName = opts.studentName?.trim() || shortAddress(activity.address);
  // Harrow uses the first name, or "this student" (never the wallet address).
  const firstName = opts.studentName?.trim().split(/\s+/)[0] || undefined;

  const subjects = gradeSubjects(activity);
  const standing = academicStanding(subjects);
  const incidents = detectIncidents(activity);
  const status = determineStatus(subjects, standing, incidents, activity.trades.length);

  const era = pick(rand, ERAS);
  const school: School = semester.label.startsWith("SUMMER")
    ? "summer"
    : status === "SUSPENDED"
      ? "detention"
      : rand() < 0.3
        ? "catholic"
        : "public";

  return {
    address: activity.address,
    studentName,
    semester,
    subjects,
    attendance: attendance(activity.activeDays.length, daysInSession(semester, opts.now)),
    standing,
    status,
    incidents,
    teacherComments: teacherComments(rand, firstName, subjects, status, incidents),
    era,
    school,
    source: activity.source,
    locked: isLocked(semester, opts.now),
  };
}
