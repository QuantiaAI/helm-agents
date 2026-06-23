import { describe, it, expect, vi } from "vitest";
import { buildGraph } from "../src/index.js";
import { createInitialState } from "@helm-agents/shared";
import { resolveConfig } from "@helm-agents/config";
import type { AgentDeps } from "@helm-agents/agents";
import type { InvokeInput, LlmClient } from "@helm-agents/llm";

/** Stub LLM: free-text "ok"; parses structured output via canned candidates. */
function stubLlm(): LlmClient {
  const candidates = [
    { recommendation: "Overweight", rationale: "AI demand", strategicActions: ["Add on dips"] },
    { action: "Buy", reasoning: "upside", entryPrice: 100, stopLoss: 90 },
    { rating: "Buy", executiveSummary: "sum", investmentThesis: "thesis", priceTarget: 130 },
  ];
  return {
    provider: "x",
    model: "x",
    async invoke(input: InvokeInput) {
      let parsed: unknown;
      if (input.structured) {
        for (const c of candidates) {
          try {
            parsed = (input.structured as { parse: (v: unknown) => unknown }).parse(c);
            break;
          } catch {
            /* next */
          }
        }
      }
      return {
        content: parsed ? JSON.stringify(parsed) : "ok",
        parsed,
        usage: { input: 1, output: 1 },
      };
    },
  };
}

describe("buildGraph end-to-end (stubbed deps)", () => {
  it("runs the full pipeline and produces a final decision + rating", async () => {
    const config = resolveConfig({ runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1 } });
    const deps: AgentDeps = {
      quick: stubLlm(),
      deep: stubLlm(),
      route: vi.fn().mockResolvedValue("market-data"),
      config,
    };
    const graph = buildGraph(deps);
    const init = createInitialState({
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
    });
    const finalState = await graph.invoke(init, { recursionLimit: 50 });

    expect(finalState.marketReport).toBe("ok");
    expect(finalState.investmentDebateState.count).toBeGreaterThanOrEqual(2);
    expect(finalState.investmentPlan).toContain("Rating:");
    expect(finalState.traderInvestmentPlan).toContain("FINAL TRANSACTION PROPOSAL");
    expect(finalState.riskDebateState.count).toBeGreaterThanOrEqual(3);
    expect(finalState.finalTradeDecision).toContain("Rating: **Buy**");
    // structured sidecar merges contributions from multiple nodes (a replace
    // reducer would keep only the last one).
    expect(finalState.structured.investmentPlan).toMatchObject({ recommendation: "Overweight" });
    expect(finalState.structured.traderInvestmentPlan).toMatchObject({ action: "Buy" });
    expect(finalState.structured.finalTradeDecision).toMatchObject({ rating: "Buy" });
  });

  it("respects a reduced analyst selection", async () => {
    const config = resolveConfig();
    const deps: AgentDeps = {
      quick: stubLlm(),
      deep: stubLlm(),
      route: vi.fn().mockResolvedValue("d"),
      config,
    };
    const graph = buildGraph(deps, { selectedAnalysts: ["market"] });
    const init = createInitialState({
      ticker: "AAPL",
      tradeDate: "2024-05-10",
      assetType: "stock",
    });
    const finalState = await graph.invoke(init, { recursionLimit: 50 });
    expect(finalState.marketReport).toBe("ok");
    expect(finalState.sentimentReport).toBe(""); // not selected
    expect(finalState.finalTradeDecision).toContain("Rating:");
  });
});
