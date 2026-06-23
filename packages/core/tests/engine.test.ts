import { describe, it, expect } from "vitest";
import { createEngine } from "../src/index.js";
import { resolveConfig } from "@helm-agents/config";
import type { InvokeInput, LlmClient } from "@helm-agents/llm";

/** Stub LLM: parses structured output via canned candidates, else free text. */
function stubLlm(): LlmClient {
  const candidates = [
    { recommendation: "Overweight", rationale: "AI demand", strategicActions: ["Add on dips"] },
    { action: "Buy", reasoning: "upside", entryPrice: 100, stopLoss: 90 },
    { rating: "Sell", executiveSummary: "sum", investmentThesis: "thesis" },
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

describe("engine.propagate (stubbed)", () => {
  it("runs the full pipeline and returns a rating", async () => {
    const config = resolveConfig({
      runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1 },
    });
    const engine = createEngine(config, {
      quick: stubLlm(),
      deep: stubLlm(),
    });
    const { rating, finalState } = await engine.propagate({
      ticker: "NVDA",
      tradeDate: "2024-05-10",
    });
    // The stub PM emits a PortfolioDecision rated "Sell"; processSignal must
    // extract exactly that from the rendered final decision (not just "a tier").
    expect(rating).toBe("Sell");
    expect(finalState.finalTradeDecision).toContain("Rating: **Sell**");
    expect(finalState.finalTradeDecision).toContain("Rating:");
    expect(finalState.investmentDebateState.count).toBeGreaterThanOrEqual(2);
  });

  it("propagate is independent of network (vendor route returns sentinel via stub fetch)", async () => {
    const config = resolveConfig();
    const engine = createEngine(config, {
      quick: stubLlm(),
      deep: stubLlm(),
      // No real network: fetch returns empty -> yfinance throws NoMarketDataError
      // -> route sentinel "NO_DATA_AVAILABLE..." is injected into analyst prompts.
      fetchImpl: (async () => new Response("{}", { status: 200 })) as typeof fetch,
    });
    const { rating } = await engine.propagate({
      ticker: "AAPL",
      tradeDate: "2024-05-10",
      selectedAnalysts: ["market"],
    });
    expect(rating).toBeTruthy();
  });
});

describe("engine.streamEvents (stubbed)", () => {
  it("yields nodeEnd events and a terminal done with a rating", async () => {
    const config = resolveConfig({
      runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1 },
    });
    const engine = createEngine(config, {
      quick: stubLlm(),
      deep: stubLlm(),
    });
    const events: string[] = [];
    let doneRating: string | undefined;
    for await (const ev of engine.streamEvents({
      ticker: "TSLA",
      tradeDate: "2024-05-10",
    })) {
      if (ev.type === "nodeEnd") events.push(ev.node);
      if (ev.type === "done") doneRating = ev.rating;
    }
    expect(events).toContain("Portfolio Manager");
    expect(events.length).toBeGreaterThan(5);
    expect(["Buy", "Overweight", "Hold", "Underweight", "Sell"]).toContain(doneRating);
  });

  it("accumulates structured objects across nodes into done.finalState", async () => {
    const config = resolveConfig({
      runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1 },
    });
    const engine = createEngine(config, { quick: stubLlm(), deep: stubLlm() });
    let finalState: Record<string, unknown> | undefined;
    for await (const ev of engine.streamEvents({ ticker: "TSLA", tradeDate: "2024-05-10" })) {
      if (ev.type === "done") finalState = ev.finalState as Record<string, unknown>;
    }
    const structured = finalState?.structured as Record<string, unknown>;
    // A shallow Object.assign would keep only the last node's contribution.
    expect(structured?.investmentPlan).toMatchObject({ recommendation: "Overweight" });
    expect(structured?.traderInvestmentPlan).toMatchObject({ action: "Buy" });
    expect(structured?.finalTradeDecision).toMatchObject({ rating: "Sell" });
  });
});

/** Stub LLM that records the system prompt it received. */
function recordingLlm(): { client: import("@helm-agents/llm").LlmClient; seen: string[] } {
  const seen: string[] = [];
  const client = {
    provider: "x",
    model: "x",
    async invoke(input: import("@helm-agents/llm").InvokeInput) {
      if (input.system) seen.push(input.system);
      return { content: "ok", usage: { input: 1, output: 1 } };
    },
  };
  return { client, seen };
}

describe("engine per-run outputLanguage override", () => {
  it("injects the requested language into agent prompts", async () => {
    const quick = recordingLlm();
    const deep = recordingLlm();
    const engine = createEngine(
      resolveConfig({ runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1, outputLanguage: "English" } }),
      { quick: quick.client, deep: deep.client },
    );
    await engine.propagate({
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      selectedAnalysts: ["market"],
      outputLanguage: "Japanese",
    });
    const all = [...quick.seen, ...deep.seen].join("\n");
    expect(all).toContain("Japanese");
  });

  it("does not mutate the engine's base config across runs", async () => {
    const quick = recordingLlm();
    const deep = recordingLlm();
    const engine = createEngine(
      resolveConfig({ runtime: { maxDebateRounds: 1, maxRiskDiscussRounds: 1, outputLanguage: "English" } }),
      { quick: quick.client, deep: deep.client },
    );
    await engine.propagate({ ticker: "X", tradeDate: "2024-01-01", selectedAnalysts: ["market"], outputLanguage: "Korean" });
    quick.seen.length = 0;
    deep.seen.length = 0;
    await engine.propagate({ ticker: "X", tradeDate: "2024-01-01", selectedAnalysts: ["market"] });
    const all = [...quick.seen, ...deep.seen].join("\n");
    expect(all).not.toContain("Korean");
  });
});
