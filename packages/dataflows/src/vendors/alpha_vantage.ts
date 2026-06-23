/**
 * Alpha Vantage vendor (ports dataflows/alpha_vantage*.py). REST API keyed by
 * ALPHA_VANTAGE_API_KEY. Implements the core stock / indicator / fundamental /
 * news methods so it can serve as a fallback or alternative to yfinance.
 */
import { VendorNotConfiguredError } from "../errors.js";
import { normalizeSymbol } from "@helm-agents/shared";
import type { VendorFn, VendorImpl } from "../router.js";

const AV_BASE = "https://www.alphavantage.co/query";

async function avQuery(
  fn: string,
  params: Record<string, string>,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<Record<string, unknown>> {
  const qs = new URLSearchParams({ function: fn, apikey: apiKey, ...params });
  const res = await fetchImpl(`${AV_BASE}?${qs.toString()}`);
  if (!res.ok) throw new Error(`Alpha Vantage HTTP ${res.status}`);
  return (await res.json()) as Record<string, unknown>;
}

export function createAlphaVantageVendor(
  apiKey: string | undefined,
  fetchImpl: typeof fetch = globalThis.fetch,
): VendorImpl {
  const requireKey = (): string => {
    if (!apiKey) throw new VendorNotConfiguredError("alpha_vantage");
    return apiKey;
  };

  const getStockData: VendorFn = async (symbol: string) => {
    const data = await avQuery(
      "TIME_SERIES_DAILY",
      { symbol: normalizeSymbol(String(symbol)), outputsize: "compact" },
      requireKey(),
      fetchImpl,
    );
    const ts = (data["Time Series (Daily)"] ?? {}) as Record<string, Record<string, string>>;
    const dates = Object.keys(ts).sort().reverse().slice(0, 5);
    const rows = dates.map((d) => `${d}: close ${ts[d]?.["4. close"]}`);
    return [`## Alpha Vantage daily: ${normalizeSymbol(String(symbol))}`, ...rows].join("\n");
  };

  const getIndicators: VendorFn = async (symbol: string, indicator = "RSI") => {
    const data = await avQuery(
      String(indicator).toUpperCase(),
      { symbol: normalizeSymbol(String(symbol)), interval: "daily", time_period: "14", series_type: "close" },
      requireKey(),
      fetchImpl,
    );
    return `## Alpha Vantage ${indicator} for ${normalizeSymbol(String(symbol))}\n${JSON.stringify(data, null, 2).slice(0, 800)}`;
  };

  const fundamentals = (fn: string): VendorFn => async (symbol: string) => {
    const data = await avQuery(fn, { symbol: normalizeSymbol(String(symbol)) }, requireKey(), fetchImpl);
    return `## Alpha Vantage ${fn} for ${normalizeSymbol(String(symbol))}\n${JSON.stringify(data, null, 2).slice(0, 1000)}`;
  };

  const getNews: VendorFn = async (symbol: string, _date?: string, limit = 10) => {
    const data = await avQuery(
      "NEWS_SENTIMENT",
      { tickers: normalizeSymbol(String(symbol)), limit: String(limit) },
      requireKey(),
      fetchImpl,
    );
    const feed = (data["feed"] ?? []) as Array<{ title?: string; overall_sentiment_label?: string }>;
    const rows = feed.slice(0, limit).map((f) => `- [${f.overall_sentiment_label ?? "?"}] ${f.title ?? ""}`);
    return ["## Alpha Vantage news & sentiment", ...rows].join("\n");
  };

  return {
    name: "alpha_vantage",
    methods: {
      getStockData,
      getIndicators,
      getFundamentals: fundamentals("OVERVIEW"),
      getBalanceSheet: fundamentals("BALANCE_SHEET"),
      getCashflow: fundamentals("CASH_FLOW"),
      getIncomeStatement: fundamentals("INCOME_STATEMENTS"),
      getNews,
      getInsiderTransactions: fundamentals("INSIDER_TRANSACTIONS"),
    },
  };
}
