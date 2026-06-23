/**
 * Risk-debate debator factory (ports
 * tradingagents/agents/risk_mgmt/{aggressive,conservative,neutral}_debator.py).
 *
 * Three debators rotate (Aggressive → Conservative → Neutral). Each appends its
 * argument, sets latestSpeaker, and increments the count — the workflow's
 * conditional routing keys off latestSpeaker and count.
 */
import {
  instrumentContext,
  languageInstruction,
  type AgentDeps,
  type AgentNode,
} from "../context.js";
import type { RiskDebateState } from "@helm-agents/shared";

export function createRiskDebator(
  deps: AgentDeps,
  opts: {
    speaker: "Aggressive" | "Conservative" | "Neutral";
    system: string;
  },
): AgentNode {
  return async (state) => {
    const ds: RiskDebateState = state.riskDebateState;
    const reports = [
      `Market research report: ${state.marketReport}`,
      `Sentiment report: ${state.sentimentReport}`,
      `News report: ${state.newsReport}`,
      `Fundamentals report: ${state.fundamentalsReport}`,
    ].join("\n\n");

    const res = await deps.quick.invoke({
      system: opts.system + languageInstruction(deps.config),
      messages: [
        {
          role: "user",
          content: `${instrumentContext(state)}\n\nTrader proposal:\n${state.traderInvestmentPlan}\n\n${reports}\n\nRisk-debate history:\n${ds.history}\n\nLast speaker: ${ds.latestSpeaker || "(none)"}`,
        },
      ],
    });

    const argument = `${opts.speaker} Analyst: ${res.content}`;
    const next: RiskDebateState = {
      ...ds,
      history: `${ds.history}\n${argument}`,
      aggressiveHistory:
        opts.speaker === "Aggressive"
          ? `${ds.aggressiveHistory}\n${argument}`
          : ds.aggressiveHistory,
      conservativeHistory:
        opts.speaker === "Conservative"
          ? `${ds.conservativeHistory}\n${argument}`
          : ds.conservativeHistory,
      neutralHistory:
        opts.speaker === "Neutral"
          ? `${ds.neutralHistory}\n${argument}`
          : ds.neutralHistory,
      currentAggressiveResponse:
        opts.speaker === "Aggressive" ? argument : ds.currentAggressiveResponse,
      currentConservativeResponse:
        opts.speaker === "Conservative"
          ? argument
          : ds.currentConservativeResponse,
      currentNeutralResponse:
        opts.speaker === "Neutral" ? argument : ds.currentNeutralResponse,
      latestSpeaker: opts.speaker,
      count: ds.count + 1,
    };

    return { riskDebateState: next };
  };
}
