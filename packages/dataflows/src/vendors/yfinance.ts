/**
 * Yahoo Finance (yfinance) vendor (ports tradingagents/dataflows/y_finance.py).
 *
 * Uses the unofficial Yahoo chart endpoint via an injectable fetch (default
 * globalThis.fetch) so tests run offline with MSW. Covers the data methods the
 * Phase 1 engine needs; news/global-news/insider return informative sentinels
 * pending the full wiring in Phase 2.
 */
import { normalizeSymbol } from "@helm-agents/shared";
import { NoMarketDataError } from "../errors.js";
import type { VendorFn, VendorImpl } from "../router.js";

const BASE = "https://query1.finance.yahoo.com";

interface ChartResult {
  meta?: Record<string, unknown>;
  indicators?: {
    quote?: Array<{ close?: Array<number | null>; high?: Array<number | null>; low?: Array<number | null>; volume?: Array<number | null> }>;
  };
  timestamp?: number[];
}

async function fetchChart(
  symbol: string,
  fetchImpl: typeof fetch,
  range = "5y",
): Promise<ChartResult> {
  const sym = normalizeSymbol(symbol);
  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(sym)}?range=${range}&interval=1d`;
  const res = await fetchImpl(url, {
    headers: { "User-Agent": "tradingagents-web/0.1" },
  });
  if (!res.ok) {
    throw new NoMarketDataError("yfinance", sym, `HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    chart?: { result?: ChartResult[]; error?: unknown };
  };
  const result = json.chart?.result?.[0];
  if (!result) throw new NoMarketDataError("yfinance", sym, "empty chart");
  return result;
}

function closes(result: ChartResult): number[] {
  const arr = result.indicators?.quote?.[0]?.close ?? [];
  return arr.filter((x): x is number => x != null);
}

export function createYfinanceVendor(
  fetchImpl: typeof fetch = globalThis.fetch,
): VendorImpl {
  const getStockData: VendorFn = async (symbol: string) => {
    const r = await fetchChart(symbol, fetchImpl);
    const price = r.meta?.regularMarketPrice as number | undefined;
    const close = closes(r);
    const last = close[close.length - 1] ?? price;
    return [
      `Ticker: ${normalizeSymbol(symbol)}`,
      `Last price: ${price ?? "n/a"}`,
      `Latest close: ${last ?? "n/a"}`,
      `Data points: ${close.length}`,
    ].join("\n");
  };

  const getIndicators: VendorFn = async (symbol: string) => {
    const r = await fetchChart(symbol, fetchImpl);
    const close = closes(r);
    const recent = close.slice(-10);
    const last = close[close.length - 1];
    return [
      `Ticker: ${normalizeSymbol(symbol)}`,
      `Recent closes: ${recent.join(", ")}`,
      `Last close: ${last ?? "n/a"}`,
      `Data points: ${close.length}`,
    ].join("\n");
  };

  const getFundamentals: VendorFn = async (symbol: string) => {
    const r = await fetchChart(symbol, fetchImpl);
    const m = r.meta ?? {};
    return [
      `Ticker: ${normalizeSymbol(symbol)}`,
      ...Object.entries(m).map(([k, v]) => `${k}: ${v}`),
    ].join("\n");
  };

  // Stubs — full wiring lands in Phase 2.
  const stub = (label: string): VendorFn => async (...args: unknown[]) =>
    `${label}${args.length ? ` for ${normalizeSymbol(String(args[0]))}` : ""} (full data wiring arrives in Phase 2)`;

  return {
    name: "yfinance",
    methods: {
      getStockData,
      getIndicators,
      getFundamentals,
      getBalanceSheet: stub("Balance sheet"),
      getCashflow: stub("Cash flow"),
      getIncomeStatement: stub("Income statement"),
      getNews: stub("News"),
      getGlobalNews: async () =>
        "Global news (full wiring arrives in Phase 2)",
      getInsiderTransactions: stub("Insider transactions"),
    },
  };
}
