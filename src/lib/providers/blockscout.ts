import type { Position, Semester, TokenCategory, Trade, WalletActivity } from "../types";

/**
 * Reads a wallet's semester from a Blockscout API v2 explorer.
 *
 * v1 limitations (subjects needing these are graded "I" for Incomplete):
 * - USD values use the token's *current* exchange rate, not the rate at trade time.
 * - No historical price context, so Buying the Top / Selling Too Early are Incomplete.
 * - No cost basis, so realized/unrealized PnL is unknown.
 */

const STABLES = new Set(["USDC", "USDT", "DAI", "USDE", "PYUSD", "USDG", "FRAX", "USDS"]);
const MAJORS = new Set(["ETH", "WETH", "WBTC", "CBBTC"]);
const MAX_PAGES = 20;

interface BsToken {
  address?: string;
  address_hash?: string;
  symbol: string | null;
  exchange_rate: string | null;
  decimals: string | null;
}

interface BsTransfer {
  tx_hash?: string;
  transaction_hash?: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string };
  token: BsToken;
  total: { value: string; decimals: string | null } | null;
}

interface BsTx {
  timestamp: string;
}

interface BsBalance {
  token: BsToken;
  value: string;
}

interface Page<T> {
  items: T[];
  next_page_params: Record<string, string | number> | null;
}

export interface BlockscoutConfig {
  apiUrl: string;
  stockTokens: Set<string>;
}

export function configFromEnv(): BlockscoutConfig {
  const apiUrl = process.env.BLOCKSCOUT_API_URL;
  if (!apiUrl) throw new Error("BLOCKSCOUT_API_URL is not set");
  const stockTokens = new Set(
    (process.env.STOCK_TOKEN_ADDRESSES ?? "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
  return { apiUrl: apiUrl.replace(/\/$/, ""), stockTokens };
}

function tokenAddress(t: BsToken): string {
  return (t.address_hash ?? t.address ?? "").toLowerCase();
}

export function classify(t: BsToken, stockTokens: Set<string>): TokenCategory {
  const sym = (t.symbol ?? "").toUpperCase();
  if (STABLES.has(sym)) return "stable";
  if (MAJORS.has(sym)) return "major";
  if (stockTokens.has(tokenAddress(t))) return "stock";
  return "meme";
}

function usd(t: BsToken, raw: string, decimals: string | null): number {
  const rate = Number(t.exchange_rate ?? 0);
  if (!rate) return 0;
  const d = Number(decimals ?? t.decimals ?? 18);
  return (Number(raw) / 10 ** d) * rate;
}

/** Walks pages newest-first until `stop` says we've passed the semester. */
async function paginate<T>(
  url: string,
  stop: (item: T) => boolean,
): Promise<T[]> {
  const out: T[] = [];
  let params: Record<string, string | number> | null = {};
  for (let i = 0; i < MAX_PAGES && params; i++) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    const res = await fetch(qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url, {
      headers: { accept: "application/json" },
      next: { revalidate: 300 },
    } as RequestInit);
    if (!res.ok) throw new Error(`Blockscout ${res.status} for ${url}`);
    const page = (await res.json()) as Page<T>;
    out.push(...page.items);
    if (page.items.some(stop)) break;
    params = page.next_page_params;
  }
  return out;
}

/**
 * A swap is a transaction where the wallet sent one token and received another.
 * Spending a stable/major for anything else is a buy of that thing; the reverse is a sell.
 */
export function inferTrades(
  wallet: string,
  transfers: BsTransfer[],
  stockTokens: Set<string>,
): Trade[] {
  const byTx = new Map<string, BsTransfer[]>();
  for (const t of transfers) {
    const h = t.transaction_hash ?? t.tx_hash;
    if (!h) continue;
    byTx.set(h, [...(byTx.get(h) ?? []), t]);
  }

  const trades: Trade[] = [];
  const base = (c: TokenCategory) => c === "stable" || c === "major";
  for (const [txHash, group] of byTx) {
    const sent = group.find((t) => t.from.hash.toLowerCase() === wallet);
    const got = group.find((t) => t.to.hash.toLowerCase() === wallet);
    if (!sent || !got || tokenAddress(sent.token) === tokenAddress(got.token)) continue;

    const sentCat = classify(sent.token, stockTokens);
    const gotCat = classify(got.token, stockTokens);
    let side: Trade["side"];
    let leg: BsTransfer;
    let category: TokenCategory;
    if (base(sentCat) && !base(gotCat)) [side, leg, category] = ["buy", got, gotCat];
    else if (!base(sentCat) && base(gotCat)) [side, leg, category] = ["sell", sent, sentCat];
    else continue; // token-to-token or stable-to-major: skip for v1

    const priced = usd(sent.token, sent.total?.value ?? "0", sent.total?.decimals ?? null) ||
      usd(got.token, got.total?.value ?? "0", got.total?.decimals ?? null);
    trades.push({
      txHash,
      timestamp: Date.parse(leg.timestamp),
      side,
      token: {
        address: tokenAddress(leg.token),
        symbol: leg.token.symbol ?? "???",
        category,
      },
      amountUsd: priced,
    });
  }
  return trades.sort((a, b) => a.timestamp - b.timestamp);
}

export async function blockscoutActivity(
  address: string,
  semester: Semester,
  config: BlockscoutConfig = configFromEnv(),
): Promise<WalletActivity> {
  const wallet = address.toLowerCase();
  const inSemester = (ts: string) => {
    const ms = Date.parse(ts);
    return ms >= semester.start && ms < semester.end;
  };
  const before = (ts: string) => Date.parse(ts) < semester.start;
  const base = `${config.apiUrl}/addresses/${address}`;

  const [txs, transfers, balances] = await Promise.all([
    paginate<BsTx>(`${base}/transactions`, (t) => before(t.timestamp)),
    paginate<BsTransfer>(`${base}/token-transfers?type=ERC-20`, (t) => before(t.timestamp)),
    fetch(`${base}/token-balances`, { headers: { accept: "application/json" } }).then(
      (r) => (r.ok ? (r.json() as Promise<BsBalance[]>) : []),
    ),
  ]);

  const activeDays = [
    ...new Set(
      [...txs.map((t) => t.timestamp), ...transfers.map((t) => t.timestamp)]
        .filter(inSemester)
        .map((ts) => new Date(ts).toISOString().slice(0, 10)),
    ),
  ].sort();

  const semesterTransfers = transfers.filter((t) => inSemester(t.timestamp));
  const trades = inferTrades(wallet, semesterTransfers, config.stockTokens);
  const swapTxs = new Set(trades.map((t) => t.txHash));
  const transfersOut = semesterTransfers.filter(
    (t) =>
      t.from.hash.toLowerCase() === wallet &&
      !swapTxs.has(t.transaction_hash ?? t.tx_hash ?? ""),
  ).length;

  const positions: Position[] = balances
    .map((b) => ({
      token: {
        address: tokenAddress(b.token),
        symbol: b.token.symbol ?? "???",
        category: classify(b.token, config.stockTokens),
      },
      valueUsd: usd(b.token, b.value, b.token.decimals),
    }))
    .filter((p) => p.valueUsd > 0);

  return {
    address,
    activeDays,
    trades,
    positions,
    transfersOut,
    liquidated: false, // needs lending-protocol indexing
    source: "blockscout",
  };
}
