import { describe, it, expect } from "vitest";
import { createInitialState, AgentStateSchema } from "../src/state.js";

describe("createInitialState", () => {
  it("builds an empty state with zeroed debate counts", () => {
    const s = createInitialState({
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
    });
    expect(s.companyOfInterest).toBe("NVDA");
    expect(s.tradeDate).toBe("2024-05-10");
    expect(s.investmentDebateState.count).toBe(0);
    expect(s.riskDebateState.latestSpeaker).toBe("");
    expect(s.marketReport).toBe("");
    // structured-output sidecar defaults to an empty map
    expect(s.structured).toEqual({});
    // round-trips through the schema
    AgentStateSchema.parse(s);
  });

  it("accepts optional context overrides", () => {
    const s = createInitialState({
      ticker: "BTC-USD",
      tradeDate: "2024-01-01",
      assetType: "crypto",
      instrumentContext: "Bitcoin",
      pastContext: "prior decision",
    });
    expect(s.assetType).toBe("crypto");
    expect(s.instrumentContext).toBe("Bitcoin");
    expect(s.pastContext).toBe("prior decision");
  });
});
