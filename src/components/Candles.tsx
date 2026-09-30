import { mulberry32 } from "@/lib/random";

type Shape = "pump-dump" | "dump" | "chop";

export function series(seed: number, count: number, shape: Shape) {
  const rand = mulberry32(seed);
  let p = 100;
  const out: { o: number; c: number; h: number; l: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const drift =
      shape === "pump-dump"
        ? t < 0.68
          ? 0.045 + t * 0.05
          : t < 0.74
            ? -0.02
            : -0.11
        : shape === "dump"
          ? -0.05
          : Math.sin(t * 9) * 0.03;
    const o = p;
    const c = Math.max(4, o * (1 + drift + (rand() - 0.5) * 0.1));
    const h = Math.max(o, c) * (1 + rand() * 0.05);
    const l = Math.min(o, c) * (1 - rand() * 0.05);
    out.push({ o, c, h, l });
    p = c;
  }
  return out;
}

/**
 * Candle-chart silhouette for the stage. Deterministic. `annotate` scrawls
 * "YOU BOUGHT HERE" at the top of the chart, where the student always buys.
 */
export function Candles({
  seed = 7,
  count = 40,
  shape = "pump-dump",
  className = "",
  annotate = false,
}: {
  seed?: number;
  count?: number;
  shape?: Shape;
  className?: string;
  annotate?: boolean;
}) {
  const data = series(seed, count, shape);
  const hi = Math.max(...data.map((d) => d.h));
  const lo = Math.min(...data.map((d) => d.l));
  const W = count * 10;
  const H = 100;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const peak = data.reduce((best, d, i) => (d.h > data[best].h ? i : best), 0);
  return (
    <div className={`candles ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const up = d.c >= d.o;
          const x = i * 10 + 5;
          const top = y(Math.max(d.o, d.c));
          const bot = y(Math.min(d.o, d.c));
          return (
            <g key={i} className={up ? "c-up" : "c-down"}>
              <line x1={x} x2={x} y1={y(d.h)} y2={y(d.l)} vectorEffect="non-scaling-stroke" />
              <rect x={x - 3.2} y={top} width={6.4} height={Math.max(0.8, bot - top)} />
            </g>
          );
        })}
      </svg>
      {annotate && (
        <span
          className="bought-here"
          style={{ left: `${((peak * 10 + 5) / W) * 100}%`, top: `${(y(data[peak].h) / H) * 100}%` }}
        >
          YOU BOUGHT HERE
        </span>
      )}
    </div>
  );
}
