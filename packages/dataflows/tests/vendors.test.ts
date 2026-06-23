import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import {
  createPolymarketVendor,
  createFredVendor,
  createAlphaVantageVendor,
  createSocialVendor,
  VendorNotConfiguredError,
} from "../src/index.js";

const server = setupServer(
  // Polymarket
  http.get("https://gamma-api.polymarket.com/markets", () =>
    HttpResponse.json([
      {
        question: "Fed rate cut in July?",
        outcomes: ["Yes", "No"],
        outcomePrices: ["0.65", "0.35"],
        volume: "100000",
      },
    ]),
  ),
  // FRED
  http.get("https://api.stlouisfed.org/fred/series/observations", ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get("api_key")) {
      return HttpResponse.json({ error_message: "missing key" }, { status: 400 });
    }
    return HttpResponse.json({
      observations: [
        { date: "2024-05-01", value: "5.33" },
        { date: "2024-04-01", value: "5.33" },
      ],
    });
  }),
  // Alpha Vantage
  http.get("https://www.alphavantage.co/query", ({ request }) => {
    const url = new URL(request.url);
    if (!url.searchParams.get("apikey")) {
      return HttpResponse.json({ Information: "demo only" });
    }
    return HttpResponse.json({
      "Time Series (Daily)": { "2024-05-10": { "4. close": "120.5" } },
    });
  }),
  // StockTwits
  http.get("https://api.stocktwits.com/api/2/streams/symbol/NVDA.json", () =>
    HttpResponse.json({
      messages: [
        { body: "NVDA to the moon", sentiment: { bullish: true }, user: { username: "bull" } },
        { body: "overvalued", sentiment: { bearish: true }, user: { username: "bear" } },
      ],
    }),
  ),
  // Reddit RSS
  http.get("https://www.reddit.com/r/wallstreetbets/search.rss", () =>
    new HttpResponse(
      `<?xml version="1.0"?><rss><channel>
         <item><title>NVDA earnings play</title></item>
         <item><title>What's next for NVDA</title></item>
       </channel></rss>`,
      { headers: { "content-type": "application/rss+xml" } },
    ),
  ),
  http.get("https://www.reddit.com/r/stocks/search.rss", () =>
    new HttpResponse(`<?xml version="1.0"?><rss><channel></channel></rss>`, {
      headers: { "content-type": "application/rss+xml" },
    }),
  ),
  http.get("https://www.reddit.com/r/investing/search.rss", () =>
    new HttpResponse(`<?xml version="1.0"?><rss><channel></channel></rss>`, {
      headers: { "content-type": "application/rss+xml" },
    }),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("polymarket vendor", () => {
  it("formats prediction markets with probabilities", async () => {
    const v = createPolymarketVendor();
    const out = await v.methods.getPredictionMarkets!("fed", 5);
    expect(String(out)).toContain("Fed rate cut in July?");
    expect(String(out)).toContain("65%");
  });
});

describe("fred vendor", () => {
  it("returns macro observations when keyed", async () => {
    const v = createFredVendor("FRED_KEY");
    const out = await v.methods.getMacroIndicators!("cpi");
    expect(String(out)).toContain("CPIAUCSL");
    expect(String(out)).toContain("5.33");
  });
  it("throws VendorNotConfiguredError without a key", async () => {
    const v = createFredVendor(undefined);
    await expect(v.methods.getMacroIndicators!("cpi")).rejects.toBeInstanceOf(
      VendorNotConfiguredError,
    );
  });
});

describe("alpha_vantage vendor", () => {
  it("returns daily stock data when keyed", async () => {
    const v = createAlphaVantageVendor("AV_KEY");
    const out = await v.methods.getStockData!("NVDA");
    expect(String(out)).toContain("120.5");
  });
  it("throws VendorNotConfiguredError without a key", async () => {
    const v = createAlphaVantageVendor(undefined);
    await expect(v.methods.getStockData!("NVDA")).rejects.toBeInstanceOf(
      VendorNotConfiguredError,
    );
  });
});

describe("social vendor", () => {
  it("aggregates Reddit + StockTwits", async () => {
    const v = createSocialVendor();
    const out = await v.methods.getSocialSentiment!("NVDA");
    expect(String(out)).toContain("Reddit");
    expect(String(out)).toContain("NVDA earnings play");
    expect(String(out)).toContain("StockTwits");
    expect(String(out)).toContain("to the moon");
  });
});
