import { describe, it, expect, vi } from "vitest";
import {
  createBullResearcher,
  createBearResearcher,
  createAggressiveDebator,
  createResearchManager,
  createTrader,
  createPortfolioManager,
  createMarketAnalyst,
  createSentimentAnalyst,
  type AgentDeps,
} from "../src/index.js";
import { createInitialState, type AgentState } from "@helm-agents/shared";
import type { ResolvedConfig } from "@helm-agents/config";
import type { InvokeInput, LlmClient } from "@helm-agents/llm";

const config = { outputLanguage: "English" } as unknown as ResolvedConfig;

/** A stub LLM returning `content`; for structured calls, tries canned candidates. */
function stubLlm(content = "ok", structured = false): LlmClient {
  const candidates = [
    { recommendation: "Overweight", rationale: "AI demand", strategicActions: ["Add on dips"] },
    { action: "Buy", reasoning: "upside", entryPrice: 100, stopLoss: 90 },
    { rating: "Buy", executiveSummary: "sum", investmentThesis: "thesis", priceTarget: 130 },
    { overallBand: "Bullish", overallScore: 7, confidence: "high", narrative: "n" },
  ];
  return {
    provider: "x",
    model: "x",
    async invoke(input: InvokeInput) {
      let parsed: unknown;
      if (structured && input.structured) {
        for (const c of candidates) {
          try {
            parsed = (input.structured as { parse: (v: unknown) => unknown }).parse(c);
            break;
          } catch {
            /* try next */
          }
        }
      }
      return {
        content: parsed ? JSON.stringify(parsed) : content,
        parsed,
        usage: { input: 1, output: 1 },
      };
    },
  };
}

function makeDeps(quick: LlmClient, deep: LlmClient): AgentDeps {
  return {
    quick,
    deep,
    route: vi.fn().mockResolvedValue("data"),
    config,
  };
}

function state(): AgentState {
  return createInitialState({
    ticker: "NVDA",
    tradeDate: "2024-05-10",
    assetType: "stock",
  });
}

describe("debate researchers", () => {
  it("bull researcher increments count and tags currentResponse 'Bull'", async () => {
    const deps = makeDeps(stubLlm("AI demand soaring."), stubLlm());
    const patch = await createBullResearcher(deps)(state());
    expect(patch.investmentDebateState?.count).toBe(1);
    expect(patch.investmentDebateState?.currentResponse).toMatch(/^Bull/);
    expect(patch.investmentDebateState?.bullHistory).toContain("Bull Analyst");
  });

  it("bear researcher increments from 1 to 2 and tags 'Bear'", async () => {
    const deps = makeDeps(stubLlm("Valuation stretched."), stubLlm());
    const s = state();
    s.investmentDebateState.count = 1;
    const patch = await createBearResearcher(deps)(s);
    expect(patch.investmentDebateState?.count).toBe(2);
    expect(patch.investmentDebateState?.currentResponse).toMatch(/^Bear/);
  });

  it("preserves the other side's history untouched", async () => {
    const deps = makeDeps(stubLlm("risk"), stubLlm());
    const s = state();
    s.investmentDebateState.bearHistory = "prior bear";
    const patch = await createBullResearcher(deps)(s);
    expect(patch.investmentDebateState?.bearHistory).toBe("prior bear");
  });
});

describe("risk debators", () => {
  it("aggressive debator sets latestSpeaker and increments count", async () => {
    const deps = makeDeps(stubLlm("size up"), stubLlm());
    const patch = await createAggressiveDebator(deps)(state());
    expect(patch.riskDebateState?.latestSpeaker).toBe("Aggressive");
    expect(patch.riskDebateState?.count).toBe(1);
    expect(patch.riskDebateState?.aggressiveHistory).toContain("Aggressive Analyst");
  });
});

describe("structured agents", () => {
  it("research manager renders a rated investment plan", async () => {
    const deps = makeDeps(stubLlm(), stubLlm("ignored", true));
    const patch = await createResearchManager(deps)(state());
    expect(patch.investmentPlan).toContain("Rating: **Overweight**");
    expect(patch.investmentDebateState?.judgeDecision).toContain("Rating:");
  });

  it("research manager carries the parsed plan under structured.investmentPlan", async () => {
    const deps = makeDeps(stubLlm(), stubLlm("ignored", true));
    const patch = await createResearchManager(deps)(state());
    expect(patch.structured?.investmentPlan).toMatchObject({ recommendation: "Overweight" });
  });

  it("trader emits the FINAL TRANSACTION PROPOSAL stop-signal line", async () => {
    const deps = makeDeps(stubLlm("ignored", true), stubLlm());
    const patch = await createTrader(deps)(state());
    expect(patch.traderInvestmentPlan).toContain("FINAL TRANSACTION PROPOSAL: **BUY**");
    expect(patch.sender).toBe("Trader");
  });

  it("trader carries the parsed proposal under structured.traderInvestmentPlan", async () => {
    const deps = makeDeps(stubLlm("ignored", true), stubLlm());
    const patch = await createTrader(deps)(state());
    expect(patch.structured?.traderInvestmentPlan).toMatchObject({ action: "Buy" });
  });

  it("portfolio manager renders the final rated decision", async () => {
    const deps = makeDeps(stubLlm(), stubLlm("ignored", true));
    const patch = await createPortfolioManager(deps)(state());
    expect(patch.finalTradeDecision).toContain("Rating: **Buy**");
  });

  it("portfolio manager carries the parsed decision under structured.finalTradeDecision", async () => {
    const deps = makeDeps(stubLlm(), stubLlm("ignored", true));
    const patch = await createPortfolioManager(deps)(state());
    expect(patch.structured?.finalTradeDecision).toMatchObject({ rating: "Buy" });
  });

  it("omits structured when the model returns free text (parse fails)", async () => {
    // deep returns plain "ok" (structured=false) -> no parsed object.
    const deps = makeDeps(stubLlm(), stubLlm("ok", false));
    const patch = await createPortfolioManager(deps)(state());
    expect(patch.structured).toBeUndefined();
  });
});

describe("analysts", () => {
  it("market analyst writes a market report and routes data", async () => {
    const deps = makeDeps(stubLlm("Market trends up."), stubLlm());
    const patch = await createMarketAnalyst(deps)(state());
    expect(patch.marketReport).toBe("Market trends up.");
    expect(patch.sender).toBe("Market Analyst");
    expect(deps.route).toHaveBeenCalled();
  });

  it("sentiment analyst renders the structured band/score header", async () => {
    const deps = makeDeps(stubLlm("ignored", true), stubLlm());
    const patch = await createSentimentAnalyst(deps)(state());
    expect(patch.sentimentReport).toContain("Bullish");
    expect(String(patch.sentimentReport)).toMatch(/Score|Confidence/);
    expect(patch.sender).toBe("Sentiment Analyst");
  });

  it("sentiment analyst carries the parsed report under structured.sentimentReport", async () => {
    const deps = makeDeps(stubLlm("ignored", true), stubLlm());
    const patch = await createSentimentAnalyst(deps)(state());
    expect(patch.structured?.sentimentReport).toMatchObject({ overallBand: "Bullish" });
  });
});
