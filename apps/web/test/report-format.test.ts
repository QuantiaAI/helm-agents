import { describe, it, expect } from "vitest";
import {
  matchDecisionShape,
  asPlainObject,
  tryParseJsonObject,
  matchKnownReport,
  matchSentimentShape,
} from "../src/lib/report-format";

describe("asPlainObject", () => {
  it("returns plain objects and rejects arrays/primitives/null", () => {
    expect(asPlainObject({ a: 1 })).toEqual({ a: 1 });
    expect(asPlainObject([1, 2])).toBeNull();
    expect(asPlainObject(null)).toBeNull();
    expect(asPlainObject("x")).toBeNull();
    expect(asPlainObject(undefined)).toBeNull();
  });
});

describe("tryParseJsonObject", () => {
  it("parses a JSON object", () => {
    expect(tryParseJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(tryParseJsonObject('  {"a":1}  ')).toEqual({ a: 1 });
  });

  it("returns null for arrays, primitives, and non-JSON", () => {
    expect(tryParseJsonObject("[1,2]")).toBeNull();
    expect(tryParseJsonObject("42")).toBeNull();
    expect(tryParseJsonObject("null")).toBeNull();
    expect(tryParseJsonObject("just a sentence")).toBeNull();
    expect(tryParseJsonObject("# Heading\nsome text")).toBeNull();
    expect(tryParseJsonObject("")).toBeNull();
  });

  it("recovers the first object when the body has a duplicate/trailing payload", () => {
    // The trader agent persisted the same object twice (\n\n joined), which broke
    // strict JSON.parse and dropped the proposal to raw text.
    const doubled = '{"action":"Sell","stopLoss":150}\n\n{"action":"Sell","stopLoss":150}';
    expect(tryParseJsonObject(doubled)).toEqual({ action: "Sell", stopLoss: 150 });
    expect(tryParseJsonObject('{"a":1}\nthanks')).toEqual({ a: 1 });
  });
});

describe("matchKnownReport", () => {
  it("matches each report field to its schema kind", () => {
    expect(
      matchKnownReport("sentimentReport", { overallBand: "Bullish", overallScore: 7, confidence: "high", narrative: "n" }),
    ).toBe("sentiment");
    expect(
      matchKnownReport("investmentPlan", { recommendation: "Buy", rationale: "r", strategicActions: ["a"] }),
    ).toBe("research");
    expect(matchKnownReport("traderInvestmentPlan", { action: "Buy", reasoning: "r" })).toBe("trader");
    expect(
      matchKnownReport("finalTradeDecision", { rating: "Hold", executiveSummary: "s", investmentThesis: "t" }),
    ).toBe("portfolio");
  });

  it("returns null when the object does not satisfy the field's schema", () => {
    expect(matchKnownReport("investmentPlan", { foo: 1 })).toBeNull();
  });

  it("returns null for unknown or absent fields", () => {
    expect(
      matchKnownReport("marketReport", { recommendation: "Buy", rationale: "r", strategicActions: [] }),
    ).toBeNull();
    expect(matchKnownReport(undefined, { rating: "Buy", executiveSummary: "s", investmentThesis: "t" })).toBeNull();
  });
});

describe("matchDecisionShape", () => {
  it("matches {rating, analysis, plan}", () => {
    const d = matchDecisionShape({ rating: "卖出", analysis: "因为…", plan: "1. 减仓" });
    expect(d).toEqual({ rating: "卖出", analysis: "因为…", plan: "1. 减仓" });
  });

  it("maps recommendation→rating and rationale→analysis", () => {
    expect(matchDecisionShape({ recommendation: "Hold", rationale: "balanced" }))
      .toEqual({ rating: "Hold", analysis: "balanced", plan: undefined });
  });

  it("matches rating + plan without analysis", () => {
    expect(matchDecisionShape({ rating: "Sell", plan: "exit now" }))
      .toEqual({ rating: "Sell", analysis: undefined, plan: "exit now" });
  });

  it("maps a `reason` key to analysis (real PM/research output shape)", () => {
    expect(matchDecisionShape({ rating: "减持", reason: "估值不明，波动加剧。" }))
      .toEqual({ rating: "减持", analysis: "估值不明，波动加剧。", plan: undefined });
  });

  it("returns null when there is no stance field", () => {
    expect(matchDecisionShape({ foo: "bar", analysis: "x" })).toBeNull();
  });

  it("returns null when stance exists but neither analysis nor plan", () => {
    expect(matchDecisionShape({ rating: "Sell" })).toBeNull();
  });

  it("returns null for a pure narrative (no stance)", () => {
    expect(matchDecisionShape({ narrative: "something" })).toBeNull();
  });

  it("ignores non-string values", () => {
    expect(matchDecisionShape({ rating: 123, analysis: "x" })).toBeNull();
    expect(matchDecisionShape({ rating: "Sell", analysis: 42 })).toBeNull();
  });
});

describe("report-format regression", () => {
  it("tryParseJsonObject still parses a plain object", () => {
    expect(tryParseJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(tryParseJsonObject("[1,2]")).toBeNull();
  });
  it("matchKnownReport still returns null for an unknown field", () => {
    expect(matchKnownReport("notAField", { rating: "Sell" })).toBeNull();
  });
});

describe("matchSentimentShape", () => {
  const base = {
    overallBand: "Somewhat Bearish",
    overallScore: -25,
    confidence: "low",
    narrative: "Mild bearish tilt with low sample size.",
  };

  it("recognizes a sentiment object with an out-of-range score", () => {
    expect(matchSentimentShape("sentimentReport", base)).toEqual({
      overallBand: "Somewhat Bearish",
      overallScore: -25,
      confidence: "low",
      narrative: "Mild bearish tilt with low sample size.",
    });
  });

  it("recognizes a sentiment object without score/confidence", () => {
    expect(
      matchSentimentShape("sentimentReport", { overallBand: "Bullish", narrative: "n" }),
    ).toEqual({ overallBand: "Bullish", narrative: "n" });
  });

  it("only fires for the sentimentReport field", () => {
    expect(matchSentimentShape("marketReport", base)).toBeNull();
    expect(matchSentimentShape(undefined, base)).toBeNull();
  });

  it("returns null when overallBand or narrative is missing/empty", () => {
    expect(matchSentimentShape("sentimentReport", { narrative: "n" })).toBeNull();
    expect(matchSentimentShape("sentimentReport", { overallBand: "Bullish" })).toBeNull();
    expect(matchSentimentShape("sentimentReport", { overallBand: "", narrative: "n" })).toBeNull();
  });

  it("ignores non-numeric score and non-string confidence", () => {
    expect(
      matchSentimentShape("sentimentReport", {
        overallBand: "Neutral",
        narrative: "n",
        overallScore: "x",
        confidence: 5,
      }),
    ).toEqual({ overallBand: "Neutral", narrative: "n" });
  });
});
