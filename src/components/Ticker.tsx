import type { CSSProperties, ReactNode } from "react";

/**
 * Endless tape. The sequence is rendered twice and the track slides by half its
 * width, so the loop is seamless. Under reduced motion it simply sits still.
 */
export function Ticker({
  items,
  variant = "hazard",
  seconds = 40,
  reverse = false,
  label,
  badge,
}: {
  items: ReactNode[];
  variant?: "hazard" | "tape" | "verdict" | "shout";
  seconds?: number;
  reverse?: boolean;
  /** Accessible name when the items are not plain text. */
  label?: string;
  /** A fixed tag at the left edge, e.g. BREAKING. */
  badge?: string;
}) {
  // Repeat short lists so one sequence is always wider than the screen.
  const reps = Math.max(1, Math.ceil(8 / items.length));
  const seq = Array.from({ length: reps }, () => items).flat();
  const row = (hidden: boolean) => (
    <div className="tk-seq" aria-hidden={hidden || undefined}>
      {seq.map((t, i) => (
        <span className="tk-item" key={i}>
          {t}
          <i className="tk-sep" aria-hidden />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={`ticker ticker-${variant}${reverse ? " tk-rev" : ""}`}
      role="marquee"
      aria-label={label ?? items.filter((i) => typeof i === "string").join(". ")}
    >
      {badge && <span className="tk-label">{badge}</span>}
      <div className="tk-window">
        <div className="tk-track" style={{ "--dur": `${seconds}s` } as CSSProperties}>
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}

/** A green/red grade quote for the stock-tape ticker. */
export function Quote({ sym, grade, up }: { sym: string; grade: string; up: boolean }) {
  return (
    <span className={`quote ${up ? "q-up" : "q-down"}`}>
      <span className="q-sym">${sym}</span>
      <span className="q-grade">{grade}</span>
      <span className="q-arrow">{up ? "▲" : "▼"}</span>
    </span>
  );
}
