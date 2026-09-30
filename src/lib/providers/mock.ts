import { hashString, mulberry32, pick } from "../random";
import { daysInSession } from "../semester";
import type { Position, Semester, TokenCategory, Trade, WalletActivity } from "../types";

/**
 * Deterministic fake activity so the card can be designed and demoed before
 * real indexing is wired up. Each address maps to a trader archetype.
 */

const TOKENS: Record<TokenCategory, string[]> = {
  stable: ["USDC"],
  major: ["WETH"],
  stock: ["TSLA", "NVDA", "HOOD", "AAPL", "COIN"],
  meme: ["BONKHOOD", "FEATHER", "GMEOW", "DOGSTONK", "RATIO", "SIRBUYSALOT"],
};

interface Archetype {
  activity: number; // chance of trading on a given day
  tradesPerDay: [number, number];
  meme: number; // share of buys that are memes
  topBuyer: number; // chance a buy is near the local top
  profitTaker: number; // chance a sell is profitable
  paperHands: number; // chance a sell is followed by a big run
  sellRate: number; // share of trades that are sells
  bagDepth: number; // typical unrealized return on held non-stables
  size: [number, number]; // trade size range, USD
  liquidated?: boolean;
  frenzy?: boolean;
}

const ARCHETYPES: Archetype[] = [
  // The degen
  { activity: 0.95, tradesPerDay: [2, 9], meme: 0.9, topBuyer: 0.9, profitTaker: 0.2, paperHands: 0.5, sellRate: 0.25, bagDepth: -0.7, size: [50, 2000] },
  // The honor student
  { activity: 0.5, tradesPerDay: [1, 2], meme: 0.1, topBuyer: 0.2, profitTaker: 0.8, paperHands: 0.1, sellRate: 0.45, bagDepth: 0.15, size: [500, 5000] },
  // The diamond-handed bagholder
  { activity: 0.3, tradesPerDay: [1, 3], meme: 0.6, topBuyer: 0.7, profitTaker: 0.3, paperHands: 0.1, sellRate: 0.05, bagDepth: -0.8, size: [100, 3000] },
  // The paper-handed stock tokenizer
  { activity: 0.7, tradesPerDay: [1, 4], meme: 0.2, topBuyer: 0.4, profitTaker: 0.6, paperHands: 0.8, sellRate: 0.5, bagDepth: 0.05, size: [200, 4000] },
  // The whale who fights in the cafeteria
  { activity: 0.8, tradesPerDay: [3, 14], meme: 0.5, topBuyer: 0.6, profitTaker: 0.5, paperHands: 0.4, sellRate: 0.4, bagDepth: -0.3, size: [20000, 90000], frenzy: true },
  // The liquidated
  { activity: 0.6, tradesPerDay: [1, 5], meme: 0.7, topBuyer: 0.8, profitTaker: 0.1, paperHands: 0.3, sellRate: 0.2, bagDepth: -0.95, size: [300, 8000], liquidated: true },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function mockActivity(address: string, semester: Semester, now: number): WalletActivity {
  const rand = mulberry32(hashString(`mock:${address.toLowerCase()}:${semester.index}`));
  const arch = ARCHETYPES[hashString(address.toLowerCase()) % ARCHETYPES.length];
  const days = daysInSession(semester, now);
  const between = (lo: number, hi: number) => lo + rand() * (hi - lo);

  const trades: Trade[] = [];
  const activeDays: string[] = [];
  for (let d = 0; d < days; d++) {
    if (rand() > arch.activity) continue;
    const dayStart = semester.start + d * DAY_MS;
    activeDays.push(new Date(dayStart).toISOString().slice(0, 10));
    const n = Math.round(between(...arch.tradesPerDay));
    // Frenzy days cram everything into one hour.
    const window = arch.frenzy && rand() < 0.2 ? 60 * 60 * 1000 : DAY_MS;
    const offset = between(0, DAY_MS - window);
    for (let i = 0; i < n; i++) {
      const side = rand() < arch.sellRate ? "sell" : "buy";
      const category: TokenCategory =
        side === "buy" && rand() < arch.meme ? "meme" : rand() < 0.8 ? "stock" : "major";
      const symbol = pick(rand, TOKENS[category]);
      const price = between(0.5, 50);
      const atTop = rand() < arch.topBuyer;
      const ranAfter = rand() < arch.paperHands;
      trades.push({
        txHash: `0xmock${hashString(`${address}:${d}:${i}`).toString(16)}`,
        timestamp: dayStart + offset + rand() * window,
        side,
        token: { address: `0x${symbol.toLowerCase()}`, symbol, category },
        amountUsd: Math.round(between(...arch.size)),
        price: {
          atTrade: price,
          high7dBefore: atTop ? price * between(1, 1.08) : price * between(1.2, 2.5),
          max7dAfter: ranAfter ? price * between(1.35, 4) : price * between(1, 1.2),
        },
        realizedPnlUsd:
          side === "sell"
            ? (rand() < arch.profitTaker ? 1 : -1) * Math.round(between(10, 800))
            : undefined,
      });
    }
  }

  const held = new Map<string, Trade["token"]>();
  for (const t of trades) if (t.side === "buy") held.set(t.token.symbol, t.token);
  const positions: Position[] = [...held.values()].slice(0, 6).map((token) => ({
    token,
    valueUsd: Math.round(between(...arch.size)),
    unrealizedReturn: Math.max(-0.99, arch.bagDepth + between(-0.15, 0.15)),
  }));
  positions.push({
    token: { address: "0xusdc", symbol: "USDC", category: "stable" },
    valueUsd: Math.round(between(0, arch.size[1]) * (arch.profitTaker > 0.5 ? 3 : 0.2)),
  });

  return {
    address,
    activeDays,
    trades: trades.sort((a, b) => a.timestamp - b.timestamp),
    positions,
    transfersOut: Math.round(between(0, 10)),
    liquidated: !!arch.liquidated,
    source: "mock",
  };
}
