import { describe, it, expect } from "vitest";
import {
  routeToVendor,
  NoMarketDataError,
  VendorNotConfiguredError,
  VendorRateLimitError,
  NO_DATA_PREFIX,
  type VendorImpl,
} from "../src/index.js";
import { DEFAULT_CONFIG } from "@helm-agents/config";

const cfg = {
  ...DEFAULT_CONFIG,
  dataVendors: { ...DEFAULT_CONFIG.dataVendors, core_stock_apis: "alpha,beta" },
};

function makeVendor(name: string, out: string | Error): VendorImpl {
  return {
    name,
    methods: {
      getStockData: async () => {
        if (out instanceof Error) throw out;
        return out;
      },
    },
  };
}

describe("routeToVendor", () => {
  it("returns the first vendor's data", async () => {
    const r = await routeToVendor(
      "getStockData",
      { args: ["NVDA", "2024-05-10"] },
      cfg,
      {
        alpha: makeVendor("alpha", "OHLCV-data"),
        beta: makeVendor("beta", "should-not-reach"),
      },
    );
    expect(r).toBe("OHLCV-data");
  });

  it("falls through on NoMarketDataError to the next vendor", async () => {
    const r = await routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
      alpha: makeVendor("alpha", new NoMarketDataError("alpha", "NVDA")),
      beta: makeVendor("beta", "beta-data"),
    });
    expect(r).toBe("beta-data");
  });

  it("falls through on VendorNotConfiguredError", async () => {
    const r = await routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
      alpha: makeVendor("alpha", new VendorNotConfiguredError("alpha")),
      beta: makeVendor("beta", "beta-data"),
    });
    expect(r).toBe("beta-data");
  });

  it("falls through on VendorRateLimitError", async () => {
    const r = await routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
      alpha: makeVendor("alpha", new VendorRateLimitError("alpha")),
      beta: makeVendor("beta", "beta-data"),
    });
    expect(r).toBe("beta-data");
  });

  it("returns NO_DATA_AVAILABLE when all vendors in the chain fail", async () => {
    const r = await routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
      alpha: makeVendor("alpha", new NoMarketDataError("alpha", "NVDA")),
      beta: makeVendor("beta", new NoMarketDataError("beta", "NVDA")),
    });
    expect(String(r)).toContain(NO_DATA_PREFIX);
  });

  it("does NOT fall back to a vendor not in the configured chain", async () => {
    // chain is "alpha,beta"; gamma is configured-but-ignored.
    const r = await routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
      alpha: makeVendor("alpha", new NoMarketDataError("alpha", "NVDA")),
      beta: makeVendor("beta", new NoMarketDataError("beta", "NVDA")),
      gamma: makeVendor("gamma", "gamma-data"),
    });
    expect(String(r)).toContain(NO_DATA_PREFIX);
    expect(String(r)).not.toContain("gamma-data");
  });

  it("propagates unexpected errors", async () => {
    await expect(
      routeToVendor("getStockData", { args: ["NVDA"] }, cfg, {
        alpha: makeVendor("alpha", new TypeError("boom")),
        beta: makeVendor("beta", "beta-data"),
      }),
    ).rejects.toThrow("boom");
  });
});
