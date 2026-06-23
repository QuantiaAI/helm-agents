/**
 * Deterministic stub LLM for DEMO mode (DEMO_LLM=1). Lets the full 13-agent
 * pipeline run end-to-end with zero external dependencies, so the Web UI's
 * streaming + timeline + rating flow can be exercised offline. Structured
 * agents get a valid schema object; free-text agents get role-aware canned
 * output. The real LLM path is unchanged when DEMO_LLM is unset.
 */
import type { InvokeInput, LlmClient, LlmResult } from "@helm-agents/llm";

const STRUCTURED_CANDIDATES: object[] = [
  { recommendation: "Overweight", rationale: "Strong demand and margin expansion; risks balanced.", strategicActions: ["Add on pullbacks", "Monitor datacenter capex"] },
  { action: "Buy", reasoning: "Risk/reward favorable with a tight invalidation.", entryPrice: 100, stopLoss: 92, positionSizing: "Half position, scale on confirmation" },
  { rating: "Overweight", executiveSummary: "Constructive setup; reward skews positive.", investmentThesis: "Demand tailwinds and operational leverage support a gradually larger position.", priceTarget: 120, timeHorizon: "3-6 months" },
  { overallBand: "Somewhat Bullish", overallScore: 6.4, confidence: "medium", narrative: "Social tone leans positive on product momentum, tempered by valuation chatter." },
];

function pickStructured(input: InvokeInput): unknown {
  const schema = input.structured as { parse?: (v: unknown) => unknown } | undefined;
  if (!schema || typeof schema.parse !== "function") return undefined;
  for (const c of STRUCTURED_CANDIDATES) {
    try {
      return schema.parse(c);
    } catch {
      /* try next candidate */
    }
  }
  return undefined;
}

function freeText(input: InvokeInput): string {
  const blob = `${input.system ?? ""} ${input.messages.map((m) => m.content).join(" ")}`.toLowerCase();
  if (blob.includes("market analyst")) {
    return "Price action shows a constructive uptrend with the 50-SMA acting as dynamic support. RSI sits in neutral-high territory (mid-60s), and MACD is positive but flattening — momentum is intact without extreme extension. Volume confirms the move. Watch for a hold above the 50-SMA; a break would weaken the thesis.\n\n| Indicator | Reading | Read |\n|---|---|---|\n| 50-SMA | support | constructive |\n| RSI | ~64 | neutral-high |\n| MACD | positive | flattening |";
  }
  if (blob.includes("bull")) {
    return "Bull case: demand tailwinds, margin expansion, and a durable competitive moat outweigh near-term valuation concerns. Bear's risk focus overlooks the operating leverage still ahead.";
  }
  if (blob.includes("bear")) {
    return "Bear case: multiples are rich relative to history, and any deceleration in growth would compress the multiple hard. The bull case discounts a lot of good news already.";
  }
  if (blob.includes("aggressive")) {
    return "Aggressive: size up — the asymmetry favors upside, and a tight stop caps the damage if wrong.";
  }
  if (blob.includes("conservative")) {
    return "Conservative: cap exposure and demand confirmation; protect capital against a multi-compression drawdown.";
  }
  if (blob.includes("neutral")) {
    return "Neutral: evidence cuts both ways; scale in only as the thesis confirms, and pre-commit to trimming on contrary data.";
  }
  return "Analysis complete.";
}

export function createDemoLlm(): LlmClient {
  return {
    provider: "demo",
    model: "demo-stub",
    async invoke(input: InvokeInput): Promise<LlmResult> {
      // Small delay so the streaming timeline animates realistically.
      await new Promise((r) => setTimeout(r, 40));
      const parsed = input.structured ? pickStructured(input) : undefined;
      return {
        content: parsed ? JSON.stringify(parsed) : freeText(input),
        parsed,
        usage: { input: 100, output: 80 },
      };
    },
  };
}
