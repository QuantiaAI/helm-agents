import { describe, it, expect } from "vitest";
import {
  ResearchPlanSchema,
  renderResearchPlan,
  renderTraderProposal,
  renderPmDecision,
  PortfolioDecisionSchema,
  TraderProposalSchema,
} from "../src/schemas.js";

describe("ResearchPlan", () => {
  it("parses a valid plan", () => {
    const p = ResearchPlanSchema.parse({
      recommendation: "Overweight",
      rationale: "Strong AI demand.",
      strategicActions: ["Add on dips", "Watch datacenter capex"],
    });
    expect(p.recommendation).toBe("Overweight");
  });
  it("rejects an invalid tier", () => {
    expect(() =>
      ResearchPlanSchema.parse({
        recommendation: "Yolo",
        rationale: "x",
        strategicActions: [],
      }),
    ).toThrow();
  });
  it("renders to markdown with the rating line", () => {
    const md = renderResearchPlan({
      recommendation: "Buy",
      rationale: "r",
      strategicActions: ["a"],
    });
    expect(md).toContain("Rating: **Buy**");
    expect(md).toContain("- a");
  });
});

describe("TraderProposal render", () => {
  it("emits the FINAL TRANSACTION PROPOSAL stop-signal line", () => {
    const md = renderTraderProposal({
      action: "Sell",
      reasoning: "r",
      entryPrice: 100,
      stopLoss: 90,
    });
    expect(md).toContain("FINAL TRANSACTION PROPOSAL: **SELL**");
  });
});

describe("TraderProposal nullable numerics", () => {
  // Models legitimately emit null for "no entry price on a sell-to-reduce".
  // `.optional()` alone rejects null, which dropped valid proposals to raw text.
  it("accepts null entryPrice/stopLoss", () => {
    const p = TraderProposalSchema.parse({
      action: "Sell",
      reasoning: "reduce exposure",
      entryPrice: null,
      stopLoss: 150,
      positionSizing: "<=2%",
    });
    expect(p.action).toBe("Sell");
    expect(p.entryPrice).toBeNull();
    expect(p.stopLoss).toBe(150);
  });
  it("still rejects a non-positive number", () => {
    expect(() =>
      TraderProposalSchema.parse({ action: "Buy", reasoning: "r", entryPrice: -5 }),
    ).toThrow();
  });
  it("renderTraderProposal omits null entry/stop lines", () => {
    const md = renderTraderProposal({ action: "Sell", reasoning: "r", entryPrice: null });
    expect(md).not.toContain("Entry price");
  });
});

describe("PortfolioDecision nullable priceTarget", () => {
  it("accepts null priceTarget", () => {
    const d = PortfolioDecisionSchema.parse({
      rating: "Hold",
      executiveSummary: "s",
      investmentThesis: "t",
      priceTarget: null,
    });
    expect(d.priceTarget).toBeNull();
  });
});

describe("PortfolioDecision", () => {
  it("parses and renders", () => {
    const d = PortfolioDecisionSchema.parse({
      rating: "Hold",
      executiveSummary: "sum",
      investmentThesis: "thesis",
    });
    const md = renderPmDecision(d);
    expect(md).toContain("Rating: **Hold**");
    expect(md).toContain("Investment Thesis");
  });
});
