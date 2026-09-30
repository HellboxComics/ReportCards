/**
 * Normalized onchain activity for one wallet over one semester.
 * Providers (mock, Blockscout, ...) produce this; the grader only reads it.
 */

export type TokenCategory = "stable" | "stock" | "meme" | "major";

export interface Trade {
  txHash: string;
  timestamp: number; // unix ms
  side: "buy" | "sell";
  token: { address: string; symbol: string; category: TokenCategory };
  amountUsd: number;
  /**
   * Price context around the trade. Optional because not every provider has
   * historical prices; subjects that need it are graded Incomplete without it.
   */
  price?: {
    atTrade: number;
    high7dBefore: number; // highest price in the 7 days before the trade
    max7dAfter: number; // highest price in the 7 days after the trade
  };
  /** Realized PnL in USD for sells, when the provider can compute cost basis. */
  realizedPnlUsd?: number;
}

export interface Position {
  token: { address: string; symbol: string; category: TokenCategory };
  valueUsd: number;
  /** Unrealized return vs cost basis, e.g. -0.6 = down 60%. */
  unrealizedReturn?: number;
}

export interface WalletActivity {
  address: string;
  /** Distinct UTC days (yyyy-mm-dd) with at least one transaction. */
  activeDays: string[];
  trades: Trade[];
  positions: Position[];
  /** Hall passes: plain transfers of assets in/out. */
  transfersOut: number;
  liquidated: boolean;
  source: "mock" | "blockscout";
}

export type LetterGrade =
  | "A+" | "A" | "A-"
  | "B+" | "B" | "B-"
  | "C+" | "C" | "C-"
  | "D+" | "D" | "D-"
  | "F"
  | "I"; // Incomplete: not enough data

export type SubjectKey =
  | "buyingTheTop"
  | "takingProfit"
  | "riskManagement"
  | "holdingBags"
  | "chasingMemes"
  | "sellingTooEarly";

export interface SubjectGrade {
  key: SubjectKey;
  name: string;
  grade: LetterGrade;
  /** 0-100 score for the behavior named by the subject, or null if Incomplete. */
  score: number | null;
  remark: string;
}

export type Status =
  | "HONOR ROLL"
  | "NEEDS IMPROVEMENT"
  | "ACADEMIC PROBATION"
  | "HELD BACK"
  | "SUSPENDED"
  | "EXPELLED"
  | "MOST LIKELY TO BECOME EXIT LIQUIDITY";

/** Rare outcomes that physically alter the document. */
export type Incident =
  | "WHALE" // gifted-program sticker
  | "RUGGED" // nurse's office note
  | "LIQUIDATED" // withdrawal paperwork
  | "FIGHT_IN_CAFETERIA"; // stapled disciplinary notice

export type Era =
  | "1987-carbon"
  | "1994-dot-matrix"
  | "1999-school-office"
  | "2004-inkjet";

export type School = "public" | "catholic" | "summer" | "detention";

export interface Semester {
  index: number; // 0-based since genesis
  label: string; // e.g. "FALL 2026"
  term: number; // 1-based term number, shown on the card
  start: number; // unix ms, inclusive
  end: number; // unix ms, exclusive
}

export interface ReportCard {
  address: string;
  studentName: string;
  semester: Semester;
  subjects: SubjectGrade[];
  attendance: { label: string; daysPresent: number; daysInSession: number };
  /** 0-100 internal academic standing (vice subjects inverted); drives status. */
  standing: number | null;
  status: Status;
  incidents: Incident[];
  teacherComments: string[];
  era: Era;
  school: School;
  source: WalletActivity["source"];
  /** True once the semester has ended and the card can be minted. */
  locked: boolean;
}
