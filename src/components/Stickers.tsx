import type { CSSProperties } from "react";

/**
 * Die-cut degen stickers slapped on the desk around the report card.
 * Pure SVG, decorative, deterministic.
 */

type Kind = "pill" | "circle" | "burst" | "bumper" | "hazard" | "bubble" | "smiley" | "rocket" | "candles" | "label";

export interface Sticker {
  kind: Kind;
  text?: string;
  bg?: string;
  fg?: string;
  /** Position of the sticker's center, in % of the stage. */
  x: number;
  y: number;
  /** Width in px. */
  w: number;
  rot: number;
}

const PINK = "#ff2a9d";
const YOLK = "#ffe600";
const CYAN = "#19d3ff";
const ORANGE = "#ff6a00";
const PURPLE = "#7b2cff";
const RED = "#ef1d1d";
const GREEN = "#1fcf5a";

const DIECUT = { stroke: "#fff", strokeWidth: 7, paintOrder: "stroke" as const, strokeLinejoin: "round" as const };
const T: CSSProperties = { fontFamily: "var(--f-display), Impact, sans-serif" };

function Art({ s }: { s: Sticker }) {
  switch (s.kind) {
    case "pill": {
      const w = 44 + s.text!.length * 19;
      return (
        <svg viewBox={`${-w / 2 - 6} -36 ${w + 12} 72`}>
          <rect x={-w / 2} y={-30} width={w} height={60} rx={30} fill={s.bg} {...DIECUT} />
          <text textAnchor="middle" y={13} fontSize={36} fill={s.fg} style={T}>
            {s.text}
          </text>
        </svg>
      );
    }
    case "circle":
      return (
        <svg viewBox="-56 -56 112 112">
          <circle r={50} fill={s.bg} {...DIECUT} />
          <circle r={41} fill="none" stroke={s.fg} strokeWidth={2} strokeDasharray="4 5" />
          <text textAnchor="middle" y={14} fontSize={s.text!.length > 3 ? 30 : 40} fill={s.fg} style={T}>
            {s.text}
          </text>
        </svg>
      );
    case "burst": {
      const pts = Array.from({ length: 28 }, (_, i) => {
        const r = i % 2 ? 44 : 62;
        const a = (i / 28) * Math.PI * 2;
        return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
      }).join(" ");
      return (
        <svg viewBox="-68 -68 136 136">
          <polygon points={pts} fill={s.bg} {...DIECUT} />
          <text textAnchor="middle" y={12} fontSize={s.text!.length > 4 ? 26 : 34} fill={s.fg} style={T}>
            {s.text}
          </text>
        </svg>
      );
    }
    case "bumper": {
      const w = 60 + s.text!.length * 14.5;
      return (
        <svg viewBox={`${-w / 2 - 6} -32 ${w + 12} 64`}>
          <rect x={-w / 2} y={-26} width={w} height={52} rx={4} fill={s.bg} {...DIECUT} />
          <text textAnchor="middle" y={11} fontSize={30} fill={s.fg} style={T}>
            {s.text}
          </text>
        </svg>
      );
    }
    case "label": {
      const w = 30 + s.text!.length * 15;
      return (
        <svg viewBox={`${-w / 2 - 2} -21 ${w + 4} 42`}>
          <rect x={-w / 2} y={-19} width={w} height={38} rx={3} fill="#151515" stroke="#000" strokeWidth={1} />
          <text
            textAnchor="middle"
            y={9}
            fontSize={25}
            fill="#f4f4f4"
            letterSpacing={2}
            style={{ fontFamily: "var(--f-type), monospace", fontWeight: 700 }}
          >
            {s.text}
          </text>
        </svg>
      );
    }
    case "hazard":
      return (
        <svg viewBox="-96 -38 192 76">
          <defs>
            <pattern id="hz" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="28" height="28" fill={YOLK} />
              <rect width="14" height="28" fill="#111" />
            </pattern>
          </defs>
          <rect x={-90} y={-32} width={180} height={64} fill="url(#hz)" {...DIECUT} />
          <rect x={-66} y={-21} width={132} height={42} fill={YOLK} />
          <text textAnchor="middle" y={12} fontSize={32} fill="#111" style={T}>
            {s.text}
          </text>
        </svg>
      );
    case "bubble":
      return (
        <svg viewBox="-72 -44 144 100">
          <path
            d="M-56-38h112a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H-10l-26 22 6-22h-26a10 10 0 0 1-10-10v-44a10 10 0 0 1 10-10z"
            fill="#fff"
            stroke="#111"
            strokeWidth={4}
          />
          <text textAnchor="middle" y={16} fontSize={46} fill="#111" style={{ fontFamily: "var(--f-marker), cursive" }}>
            {s.text}
          </text>
        </svg>
      );
    case "smiley":
      return (
        <svg viewBox="-56 -56 112 112">
          <circle r={50} fill={YOLK} {...DIECUT} />
          <circle cx={-17} cy={-12} r={7} fill="#111" />
          <circle cx={17} cy={-12} r={7} fill="#111" />
          <path d="M-28 10q28 32 56 0" fill="none" stroke="#111" strokeWidth={7} strokeLinecap="round" />
        </svg>
      );
    case "rocket":
      return (
        <svg viewBox="-64 -64 128 128">
          <circle r={58} fill={s.bg ?? PURPLE} {...DIECUT} />
          <g transform="rotate(35)">
            <path d="M0-42c14 12 18 34 14 54H-14C-18-8-14-30 0-42z" fill="#fff" />
            <circle cy={-14} r={8} fill={CYAN} stroke="#111" strokeWidth={3} />
            <path d="M-14 0l-12 22 12-4zM14 0l12 22-12-4z" fill={RED} />
            <path d="M-9 13c2 16 6 24 9 30 3-6 7-14 9-30z" fill={YOLK} />
          </g>
        </svg>
      );
    case "candles":
      return (
        <svg viewBox="-76 -56 152 112">
          <rect x={-70} y={-50} width={140} height={100} rx={14} fill="#0d0d0d" {...DIECUT} />
          {[0, 1, 2, 3, 4].map((i) => {
            const h = 16 + i * 9;
            const x = -52 + i * 24;
            const y = 34 - h - i * 8;
            return (
              <g key={i}>
                <path d={`M${x + 6} ${y - 8}v${h + 16}`} stroke={GREEN} strokeWidth={2.5} />
                <rect x={x} y={y} width={12} height={h} fill={GREEN} />
              </g>
            );
          })}
        </svg>
      );
  }
}

export function Stickers({ items, className = "" }: { items: Sticker[]; className?: string }) {
  return (
    <div className={`stickers ${className}`} aria-hidden>
      {items.map((s, i) => (
        <span
          key={i}
          className="sticker"
          style={
            {
              "--x": `${s.x}%`,
              "--y": `${s.y}%`,
              "--w": `${s.w}px`,
              "--rot": `${s.rot}deg`,
            } as CSSProperties
          }
        >
          <Art s={s} />
        </span>
      ))}
    </div>
  );
}

/** Around the paper on the card page: edges peek out on a phone, the full desk on a monitor. */
export const DESK: Sticker[] = [
  { kind: "hazard", text: "RUG ZONE", x: 8, y: 8, w: 150, rot: -18 },
  { kind: "pill", text: "LFG", bg: PURPLE, fg: YOLK, x: 96, y: 14, w: 110, rot: 16 },
  { kind: "circle", text: "NGMI", bg: YOLK, fg: "#111", x: 5, y: 40, w: 96, rot: -12 },
  { kind: "burst", text: "HODL", bg: CYAN, fg: "#111", x: 97, y: 44, w: 110, rot: 12 },
  { kind: "rocket", x: 5, y: 68, w: 100, rot: 8 },
  { kind: "bubble", text: "gm", x: 96, y: 72, w: 100, rot: -8 },
  { kind: "pill", text: "DIAMOND HANDS", bg: PINK, fg: "#fff", x: 10, y: 93, w: 230, rot: -6 },
  { kind: "candles", x: 95, y: 94, w: 120, rot: 10 },
];

/** Stickers for the landing hero's card stack. */
export const HERO_DESK: Sticker[] = [
  { kind: "bumper", text: "BUY HIGH · SELL LOW", bg: RED, fg: "#fff", x: 10, y: 6, w: 230, rot: -10 },
  { kind: "smiley", x: 95, y: 20, w: 92, rot: 14 },
  { kind: "circle", text: "100x", bg: ORANGE, fg: "#111", x: 2, y: 58, w: 96, rot: -14 },
  { kind: "pill", text: "WAGMI", bg: PINK, fg: "#fff", x: 97, y: 64, w: 140, rot: 10 },
  { kind: "label", text: "NFA · DYOR", x: 12, y: 92, w: 170, rot: 4 },
];
