import { describe, it, expect } from "vitest";
import {
  shouldContinueDebate,
  shouldContinueRiskAnalysis,
} from "../src/index.js";
import { createInitialState } from "@helm-agents/shared";

function st(ticker = "X") {
  return createInitialState({
    ticker,
    tradeDate: "2024-01-01",
    assetType: "stock",
  });
}

describe("shouldContinueDebate", () => {
  it("routes to Research Manager when rounds exhausted", () => {
    const s = st();
    s.investmentDebateState.count = 2; // 2 * 1
    expect(shouldContinueDebate(s, 1)).toBe("Research Manager");
  });
  it("Bull → Bear then Bear → Bull", () => {
    const s = st();
    s.investmentDebateState.currentResponse = "Bull Analyst: ...";
    expect(shouldContinueDebate(s, 1)).toBe("Bear Researcher");
    s.investmentDebateState.currentResponse = "Bear Analyst: ...";
    expect(shouldContinueDebate(s, 1)).toBe("Bull Researcher");
  });
  it("respects larger round counts", () => {
    const s = st();
    s.investmentDebateState.count = 5;
    s.investmentDebateState.currentResponse = "Bull Analyst: ...";
    expect(shouldContinueDebate(s, 3)).toBe("Bear Researcher"); // 5 < 6
    s.investmentDebateState.count = 6;
    expect(shouldContinueDebate(s, 3)).toBe("Research Manager");
  });
});

describe("shouldContinueRiskAnalysis", () => {
  it("rotates Aggressive → Conservative → Neutral", () => {
    const s = st();
    s.riskDebateState.latestSpeaker = "Aggressive";
    expect(shouldContinueRiskAnalysis(s, 1)).toBe("Conservative Analyst");
    s.riskDebateState.latestSpeaker = "Conservative";
    expect(shouldContinueRiskAnalysis(s, 1)).toBe("Neutral Analyst");
    s.riskDebateState.latestSpeaker = "Neutral";
    expect(shouldContinueRiskAnalysis(s, 1)).toBe("Aggressive Analyst");
  });
  it("ends at Portfolio Manager when rounds exhausted", () => {
    const s = st();
    s.riskDebateState.count = 3; // 3 * 1
    expect(shouldContinueRiskAnalysis(s, 1)).toBe("Portfolio Manager");
  });
});
