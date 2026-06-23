/**
 * Hold-period returns + benchmark alpha (ports tradingagents/graph/
 * trading_graph._fetch_returns + _resolve_benchmark). Used by the reflection
 * feature to evaluate whether a past decision held up.
 */
import { normalizeSymbol } from "@helm-agents/shared";

const BASE = "https://query1.finance.yahoo.com";
const UA = "tradingagents-web/0.1";

export interface ReturnsResult {
  symbolReturn: number | null;
  benchmarkReturn: number | null;
  alpha: number | null;
}

/** Pick the benchmark for a ticker by suffix (default SPY). */
export function resolveBenchmark(
  ticker: string,
  benchmarkMap: Record<string, string>,
  defaultBenchmark = "SPY",
): string {
  const t = ticker.toUpperCase();
  // Longest matching suffix wins (e.g. ".NS" before "").
  const suffixes = Object.keys(benchmarkMap)
    .filter((s) => s === "" || t.endsWith(s.toUpperCase()))
    .sort((a, b) => b.length - a.length);
  return suffixes.length ? benchmarkMap[suffixes[0]!] ?? defaultBenchmark : defaultBenchmark;
}

interface Series {
  date: string; // YYYY-MM-DD
  close: number;
}

async function fetchSeries(
  symbol: string,
  fetchImpl: typeof fetch,
): Promise<Series[]> {
  const url = `${BASE}/v8/finance/chart/${encodeURIComponent(normalizeSymbol(symbol))}?range=2y&interval=1d`;
  const res = await fetchImpl(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    chart?: { result?: Array<{ timestamp?: number[]; indicators?: { quote?: Array<{ close?: Array<number | null> }> } }> };
  };
  const r = json.chart?.result?.[0];
  if (!r) return [];
  const ts = r.timestamp ?? [];
  const closes = r.indicators?.quote?.[0]?.close ?? [];
  const out: Series[] = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null) continue;
    out.push({ date: new Date(ts[i]! * 1000).toISOString().slice(0, 10), close: c });
  }
  return out;
}

function closeOn(series: Series[], date: string): number | null {
  // Nearest close at or before `date`.
  let pick: Series | null = null;
  for (const s of series) {
    if (s.date <= date && (!pick || s.date > pick.date)) pick = s;
  }
  return pick?.close ?? null;
}

function pctChange(series: Series[], from: string, to: string): number | null {
  const start = closeOn(series, from);
  const end = closeOn(series, to);
  if (start == null || end == null || start === 0) return null;
  return ((end - start) / start) * 100;
}

function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function computeReturns(
  symbol: string,
  fromDate: string,
  holdDays: number,
  benchmark: string,
  fetchImpl: typeof fetch = globalThis.fetch,
): Promise<ReturnsResult> {
  const endDate = addDays(fromDate, holdDays);
  const [symSeries, benchSeries] = await Promise.all([
    fetchSeries(symbol, fetchImpl),
    fetchSeries(benchmark, fetchImpl),
  ]);
  const symbolReturn = pctChange(symSeries, fromDate, endDate);
  const benchmarkReturn = pctChange(benchSeries, fromDate, endDate);
  const alpha =
    symbolReturn != null && benchmarkReturn != null
      ? symbolReturn - benchmarkReturn
      : null;
  return { symbolReturn, benchmarkReturn, alpha };
}
