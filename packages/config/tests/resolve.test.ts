import { describe, it, expect } from "vitest";
import {
  resolveConfig,
  DEFAULT_CONFIG,
  detectAssetType,
} from "../src/index.js";

describe("resolveConfig", () => {
  it("returns defaults when nothing overrides", () => {
    const c = resolveConfig({ env: {} });
    expect(c.llmProvider).toBe(DEFAULT_CONFIG.llmProvider);
    expect(c.maxDebateRounds).toBe(DEFAULT_CONFIG.maxDebateRounds);
  });

  it("applies env overrides with type coercion", () => {
    const c = resolveConfig({
      env: {
        TRADINGAGENTS_MAX_DEBATE_ROUNDS: "3",
        TRADINGAGENTS_CHECKPOINT_ENABLED: "true",
        TRADINGAGENTS_TEMPERATURE: "0.7",
        TRADINGAGENTS_LLM_PROVIDER: "anthropic",
      },
    });
    expect(c.maxDebateRounds).toBe(3);
    expect(c.checkpointEnabled).toBe(true);
    expect(c.temperature).toBe(0.7);
    expect(c.llmProvider).toBe("anthropic");
  });

  it("runtime overrides win over env", () => {
    const c = resolveConfig({
      env: { TRADINGAGENTS_LLM_PROVIDER: "anthropic" },
      runtime: { llmProvider: "openai" },
    });
    expect(c.llmProvider).toBe("openai");
  });

  it("ignores empty env values", () => {
    const c = resolveConfig({ env: { TRADINGAGENTS_LLM_PROVIDER: "" } });
    expect(c.llmProvider).toBe(DEFAULT_CONFIG.llmProvider);
  });
});

describe("detectAssetType", () => {
  it("detects crypto by -USD suffix", () => {
    expect(detectAssetType("BTC-USD")).toBe("crypto");
    expect(detectAssetType("ETH-USD")).toBe("crypto");
  });
  it("detects crypto by concatenated form", () => {
    expect(detectAssetType("BTCUSD")).toBe("crypto");
  });
  it("defaults to stock", () => {
    expect(detectAssetType("NVDA")).toBe("stock");
    expect(detectAssetType("0700.HK")).toBe("stock");
  });
});
