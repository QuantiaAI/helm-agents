import { describe, it, expect } from "vitest";
import { normalizeSymbol } from "../src/symbol-utils.js";

describe("normalizeSymbol", () => {
  it("maps commodity/index CFD aliases", () => {
    expect(normalizeSymbol("XAUUSD")).toBe("GC=F");
    expect(normalizeSymbol("SPX500")).toBe("^GSPC");
    expect(normalizeSymbol("WTICOUSD")).toBe("CL=F");
  });
  it("maps crypto tickers to BASE-USD", () => {
    expect(normalizeSymbol("BTCUSD")).toBe("BTC-USD");
    expect(normalizeSymbol("ETH-USD")).toBe("ETH-USD");
  });
  it("maps 6-letter forex pairs to PAIR=X", () => {
    expect(normalizeSymbol("EURUSD")).toBe("EURUSD=X");
    expect(normalizeSymbol("USDJPY")).toBe("USDJPY=X");
  });
  it("passes through plain stock tickers", () => {
    expect(normalizeSymbol("NVDA")).toBe("NVDA");
    expect(normalizeSymbol("0700.HK")).toBe("0700.HK");
  });
  it("is idempotent-ish for already-normalized forms", () => {
    expect(normalizeSymbol("BTC-USD")).toBe("BTC-USD");
  });
});
