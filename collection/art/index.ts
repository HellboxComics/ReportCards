/**
 * Art group registry. `npm run collection:layers -- --group <name>` rebuilds
 * one group; without --group it rebuilds all of them.
 *
 * | group        | owns                                                        |
 * | ------------ | ----------------------------------------------------------- |
 * | surfaces     | 01-Background, 10-Stain                                     |
 * | paper        | 02-Paper, 03-School (+ paper-print.ts: ID/semester/GPA/remarks) |
 * | marks        | 05-Grades, 06-Attendance, 07-Teacher-Comment, 08-Pen-Marks, 11-Parent-Signature |
 * | attachments  | 09-Doodle, 12-Incident, 13-Status                           |
 * | oneofones-a  | 1of1: one-of-ones 1-17 (art/oneofones/a.ts)                 |
 * | oneofones-b  | 1of1: one-of-ones 18-33 (art/oneofones/b.ts)               |
 * | extras       | extras: unrevealed placeholder, collection image (foundation) |
 */
import type { ArtModule } from "./types";

export const GROUPS: Readonly<Record<string, () => Promise<ArtModule>>> = {
  surfaces: () => import("./surfaces").then((m) => m.surfacesGroup),
  paper: () => import("./paper").then((m) => m.paperGroup),
  marks: () => import("./marks").then((m) => m.marksGroup),
  attachments: () => import("./attachments").then((m) => m.attachmentsGroup),
  "oneofones-a": () => import("./oneofones/a").then((m) => m.oneOfOnesA),
  "oneofones-b": () => import("./oneofones/b").then((m) => m.oneOfOnesB),
  extras: () => import("./extras").then((m) => m.extrasGroup),
};
