/**
 * Conditional routing for the two debate loops (ports
 * tradingagents/graph/conditional_logic.py). Pure functions, parameterized by
 * the configured round counts, so they can be unit-tested without a graph.
 */
import type { AgentState } from "@helm-agents/shared";

/** Investment-debate routing: Bull ⇄ Bear, ending at Research Manager. */
export function shouldContinueDebate(
  state: Pick<AgentState, "investmentDebateState">,
  maxDebateRounds: number,
): string {
  if (state.investmentDebateState.count >= 2 * maxDebateRounds) {
    return "Research Manager";
  }
  return state.investmentDebateState.currentResponse.startsWith("Bull")
    ? "Bear Researcher"
    : "Bull Researcher";
}

/** Risk-debate routing: Aggressive → Conservative → Neutral, ending at PM. */
export function shouldContinueRiskAnalysis(
  state: Pick<AgentState, "riskDebateState">,
  maxRiskDiscussRounds: number,
): string {
  if (state.riskDebateState.count >= 3 * maxRiskDiscussRounds) {
    return "Portfolio Manager";
  }
  const s = state.riskDebateState.latestSpeaker;
  if (s.startsWith("Aggressive")) return "Conservative Analyst";
  if (s.startsWith("Conservative")) return "Neutral Analyst";
  return "Aggressive Analyst";
}
