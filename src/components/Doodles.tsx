/**
 * Ballpoint doodles a bored student left in the margins. Blue ink, retraced
 * strokes, a bit of green highlighter. Purely decorative.
 */

const ink = {
  fill: "none",
  stroke: "var(--ballpoint)",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Rocket({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 92" aria-hidden>
      <g {...ink}>
        <path d="M24 3c9 9 12 24 10 42H14C12 27 15 12 24 3z" />
        <path d="M24 4.5c8 9 10.5 23 9 40" opacity=".55" />
        <circle cx="24" cy="23" r="5" />
        <circle cx="24" cy="23" r="3" opacity=".6" />
        <path d="M14 34L5 50l9-3M34 34l9 16-9-3" />
        <path d="M17 46c1 14 5 22 7 28 2-6 6-14 7-28" />
        <path d="M20 47c1 8 3 13 4 17 1-4 3-9 4-17" />
        <path d="M9 62l-3 8M40 60l3 9M16 76l-2 9M33 75l2 9" opacity=".7" />
      </g>
    </svg>
  );
}

export function UpCandles({ className }: { className?: string }) {
  // Only-up chart. Green highlighter bodies, ballpoint outlines.
  const bars = [
    [4, 44, 12],
    [16, 36, 14],
    [28, 30, 10],
    [40, 18, 18],
    [52, 6, 20],
  ];
  return (
    <svg className={className} viewBox="0 0 72 66" aria-hidden>
      {bars.map(([x, y, h]) => (
        <g key={x}>
          <rect x={x} y={y} width="8" height={h} fill="var(--candle)" opacity=".85" />
          <path {...ink} d={`M${x + 4} ${y - 5}v5M${x + 4} ${y + h}v5M${x} ${y}h8v${h}h-8z`} />
        </g>
      ))}
      <path {...ink} d="M2 62L66 2m0 0l-9 1m9-1l-1 9" strokeWidth="2" />
    </svg>
  );
}

export function Moon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 56" aria-hidden>
      <g {...ink}>
        <path d="M30 6a22 22 0 1 0 18 34A18 18 0 1 1 30 6z" />
        <path d="M30 8a20 20 0 1 0 16 31" opacity=".5" />
        <path d="M16 24l3 1M14 32q4 3 8 0" />
        <path d="M60 10l2 5 5 1-4 3 1 5-4-3-5 3 1-5-4-3 5-1z" />
        <path d="M70 34l1 3 3 .5-2 2 .5 3-2.5-1.5-3 1.5.5-3-2-2 3-.5z" opacity=".8" />
      </g>
      <text x="44" y="54" className="doodle-word" fill="var(--ballpoint)" fontSize="15">
        wen?
      </text>
    </svg>
  );
}

export function Diamond({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 52" aria-hidden>
      <g {...ink}>
        <path d="M14 4h36l12 14-30 32L2 18z" />
        <path d="M2 18h60M14 4l8 14 10 32 10-32 8-14M22 18L32 4l10 14" />
        <path d="M6 20l24 26M10 19l22 25" opacity=".45" />
      </g>
    </svg>
  );
}

export function Cube({ className }: { className?: string }) {
  // The classic bored-kid 3D box.
  return (
    <svg className={className} viewBox="0 0 50 50" aria-hidden>
      <g {...ink}>
        <path d="M6 16h26v28H6zM6 16l12-11h26L32 16M44 5v28L32 44" />
        <path d="M6.5 17h25v26" opacity=".5" />
        <path d="M34 18l8-8M34 24l8-8M34 30l8-8M34 36l8-8" opacity=".55" />
      </g>
    </svg>
  );
}

export function Wagmi({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 118 44" aria-hidden>
      <g {...ink}>
        <path d="M4 7c36-4 74-4 110-1 1 10 1 21-1 31-36 3-73 3-109 1-2-10-2-21 0-31z" />
        <path d="M6 9c35-3 70-3 105 0" opacity=".5" />
      </g>
      <text x="59" y="33" textAnchor="middle" className="doodle-word" fill="var(--ballpoint)" fontSize="28">
        WAGMI
      </text>
    </svg>
  );
}

export function LaserEyes({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 70 60" aria-hidden>
      <g {...ink}>
        <circle cx="22" cy="24" r="15" />
        <path d="M15 32q7 5 14 0M22 39v16M10 46h24M22 55l-7 5M22 55l7 5" />
      </g>
      <g stroke="var(--red-pen)" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="17" cy="21" r="2" fill="var(--red-pen)" />
        <circle cx="27" cy="21" r="2" fill="var(--red-pen)" />
        <path d="M17 21L68 6M27 21L68 14M17 21L68 12M27 21l41-1" />
      </g>
    </svg>
  );
}
