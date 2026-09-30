import type { Status } from "./types";

/**
 * Every status floods the stage (and the share image) with its own color, so a
 * timeline full of report cards tells you the verdict before you read it.
 * `bg`/`bg2` paint the stage, `hot` is the giant status type on top of it,
 * `ink` is the rubber-stamp ink on the paper.
 */
export interface StatusTheme {
  key: string;
  bg: string;
  bg2: string;
  hot: string;
  ink: string;
}

export const STATUS_THEME: Record<Status, StatusTheme> = {
  "HONOR ROLL": { key: "honor", bg: "#16804b", bg2: "#04170c", hot: "#c8ff3d", ink: "#0b7a36" },
  "NEEDS IMPROVEMENT": { key: "needs", bg: "#ff9500", bg2: "#2e1200", hot: "#fff4d6", ink: "#d25d00" },
  "ACADEMIC PROBATION": { key: "probation", bg: "#ff5717", bg2: "#2c0800", hot: "#ffe600", ink: "#d8141c" },
  "HELD BACK": { key: "heldback", bg: "#3b4bff", bg2: "#08062b", hot: "#ffe600", ink: "#1f3bb8" },
  SUSPENDED: { key: "suspended", bg: "#e5157a", bg2: "#2a0017", hot: "#ffe600", ink: "#c3106b" },
  EXPELLED: { key: "expelled", bg: "#f0141f", bg2: "#2e0003", hot: "#ffe600", ink: "#d8141c" },
  "MOST LIKELY TO BECOME EXIT LIQUIDITY": {
    key: "exitliq",
    bg: "#ff2a9d",
    bg2: "#220a5e",
    hot: "#ffe600",
    ink: "#d8141c",
  },
};

export function statusTheme(status: Status): StatusTheme {
  return STATUS_THEME[status];
}
