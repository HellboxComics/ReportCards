"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

/**
 * ↻ REPLAY: a two-slide "results are in" moment (worst grade, then the verdict)
 * followed by the paper's own reveal, for screen recordings. Opt-in only; the
 * page itself always lands on the static card within ~2.5s.
 */

const SHOW = "rc:replay";
const PAPER = "rc:replay-paper";
const SLIDE_MS = 1150;

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ReplayButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(reducedMotion() ? PAPER : SHOW))}
    >
      ↻ REPLAY
    </button>
  );
}

/** Remounts its children (restarting their CSS reveal) whenever a replay ends. */
export function Replayable({ children }: { children: ReactNode }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const on = () => setN((x) => x + 1);
    window.addEventListener(PAPER, on);
    return () => window.removeEventListener(PAPER, on);
  }, []);
  return (
    <div className="replayable" key={n}>
      {children}
    </div>
  );
}

export function ReplayShow({
  grade,
  subject,
  backhanded,
  kicker,
  status,
  quote,
}: {
  grade?: string;
  subject?: string;
  backhanded?: boolean;
  kicker?: string;
  status: string;
  quote: string;
}) {
  const [slide, setSlide] = useState(-1);

  useEffect(() => {
    let timers: number[] = [];
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
    };
    const start = () => {
      clear();
      const slides = grade ? [0, 1] : [1];
      slides.forEach((s, i) => timers.push(window.setTimeout(() => setSlide(s), i * SLIDE_MS)));
      timers.push(
        window.setTimeout(() => {
          setSlide(-1);
          window.dispatchEvent(new Event(PAPER));
        }, slides.length * SLIDE_MS),
      );
    };
    window.addEventListener(SHOW, start);
    return () => {
      clear();
      window.removeEventListener(SHOW, start);
    };
  }, [grade]);

  if (slide < 0) return null;
  return (
    <div
      className={`show show-${slide}`}
      role="dialog"
      aria-label="Report card results"
      onClick={() => {
        setSlide(-1);
        window.dispatchEvent(new Event(PAPER));
      }}
      style={{ "--slide-ms": `${SLIDE_MS}ms` } as CSSProperties}
    >
      <div className="show-rays" aria-hidden />
      {slide === 0 && grade && (
        <div className="show-body" key="g">
          <p className="show-kicker">{backhanded ? "NOT A COMPLIMENT" : "WORST GRADE"}</p>
          <div className="show-grade">
            <span>{grade}</span>
          </div>
          <p className="show-subject">IN {subject?.toUpperCase()}</p>
          <p className="show-quote">“{quote}” — Harrow</p>
        </div>
      )}
      {slide === 1 && (
        <div className="show-body" key="s">
          <p className="show-kicker">FINAL STATUS</p>
          {kicker && <p className="show-status-kicker">{kicker}</p>}
          <p className="show-status">{status}</p>
        </div>
      )}
      <div className="show-bar" aria-hidden>
        <span key={slide} />
      </div>
      <p className="show-skip">TAP TO SKIP</p>
    </div>
  );
}
