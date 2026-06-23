import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { createYfinanceVendor } from "../src/vendors/yfinance.js";

const server = setupServer(
  http.get("https://query1.finance.yahoo.com/v8/finance/chart/NVDA", () =>
    HttpResponse.json({
      chart: {
        result: [
          {
            meta: { regularMarketPrice: 120, currency: "USD" },
            indicators: {
              quote: [{ close: [110, 115, 120] }],
            },
          },
        ],
        error: null,
      },
    }),
  ),
  http.get("https://query1.finance.yahoo.com/v8/finance/chart/EMPTY", () =>
    HttpResponse.json({ chart: { result: [], error: null } }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("yfinance vendor", () => {
  it("fetches and formats stock data", async () => {
    const v = createYfinanceVendor();
    const out = await v.methods.getStockData!("NVDA", "2024-05-10");
    expect(String(out)).toContain("NVDA");
    expect(String(out)).toContain("120");
  });

  it("formats indicators with recent closes", async () => {
    const v = createYfinanceVendor();
    const out = await v.methods.getIndicators!("NVDA");
    expect(String(out)).toContain("Recent closes");
    expect(String(out)).toContain("120");
  });

  it("throws NoMarketDataError on an empty chart", async () => {
    const v = createYfinanceVendor();
    await expect(v.methods.getStockData!("EMPTY")).rejects.toThrow(
      /no market data/i,
    );
  });
});
