import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { resolveBenchmark, computeReturns } from "../src/index.js";

function ts(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000);
}

function chart(symbolCloses: Record<string, Record<string, number>>) {
  return ({ request }: { request: Request }) => {
    const url = new URL(request.url);
    const sym = decodeURIComponent(url.pathname.split("/").pop() ?? "");
    const map = symbolCloses[sym] ?? {};
    const dates = Object.keys(map).sort();
    const result = {
      timestamp: dates.map(ts),
      indicators: { quote: [{ close: dates.map((d) => map[d] ?? null) }] },
    };
    return HttpResponse.json({ chart: { result: [result], error: null } });
  };
}

const server = setupServer(
  http.get("https://query1.finance.yahoo.com/v8/finance/chart/:sym", chart({
    NVDA: { "2024-05-10": 100, "2024-05-17": 110 },
    SPY: { "2024-05-10": 100, "2024-05-17": 102 },
  })),
);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("resolveBenchmark", () => {
  it("maps by longest matching suffix", () => {
    const map = { ".NS": "^NSEI", ".HK": "^HSI", "": "SPY" };
    expect(resolveBenchmark("0700.HK", map)).toBe("^HSI");
    expect(resolveBenchmark("RELIANCE.NS", map)).toBe("^NSEI");
    expect(resolveBenchmark("NVDA", map)).toBe("SPY");
  });
});

describe("computeReturns", () => {
  it("computes symbol return, benchmark return, and alpha over the hold window", async () => {
    const r = await computeReturns("NVDA", "2024-05-10", 7, "SPY");
    expect(r.symbolReturn).toBeCloseTo(10, 5);
    expect(r.benchmarkReturn).toBeCloseTo(2, 5);
    expect(r.alpha).toBeCloseTo(8, 5);
  });
});
