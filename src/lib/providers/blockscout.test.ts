import { describe, expect, it } from "vitest";
import { inferTrades } from "./blockscout";

const W = "0x00000000000000000000000000000000000000aa";
const POOL = "0x00000000000000000000000000000000000000bb";
const usdc = { address_hash: "0xusdc", symbol: "USDC", exchange_rate: "1", decimals: "6" };
const meme = { address_hash: "0xmeme", symbol: "FEATHER", exchange_rate: "0.01", decimals: "18" };

function xfer(tx: string, from: string, to: string, token: typeof usdc, value: string) {
  return {
    transaction_hash: tx,
    timestamp: "2026-09-01T12:00:00Z",
    from: { hash: from },
    to: { hash: to },
    token,
    total: { value, decimals: token.decimals },
  };
}

describe("inferTrades", () => {
  it("reads USDC -> meme as a buy and meme -> USDC as a sell", () => {
    const trades = inferTrades(
      W,
      [
        xfer("0x1", W, POOL, usdc, "250000000"),
        xfer("0x1", POOL, W, meme, "25000000000000000000000"),
        xfer("0x2", W, POOL, meme, "1000000000000000000000"),
        xfer("0x2", POOL, W, usdc, "9000000"),
      ],
      new Set(),
    );
    expect(trades.map((t) => [t.side, t.token.symbol, t.token.category])).toEqual([
      ["buy", "FEATHER", "meme"],
      ["sell", "FEATHER", "meme"],
    ]);
    expect(trades[0].amountUsd).toBe(250);
  });

  it("ignores plain transfers", () => {
    expect(inferTrades(W, [xfer("0x3", W, POOL, usdc, "1")], new Set())).toEqual([]);
  });

  it("classifies configured stock tokens", () => {
    const tsla = { ...meme, address_hash: "0xtsla", symbol: "TSLA" };
    const trades = inferTrades(
      W,
      [xfer("0x4", W, POOL, usdc, "1"), xfer("0x4", POOL, W, tsla, "1")],
      new Set(["0xtsla"]),
    );
    expect(trades[0].token.category).toBe("stock");
  });
});
