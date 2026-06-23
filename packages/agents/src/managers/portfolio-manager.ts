/**
 * Portfolio Manager (ports managers/portfolio_manager.py). Deep-thinking LLM,
 * structured PortfolioDecision output. The final decision-maker.
 */
import {
  PortfolioDecisionSchema,
  renderPmDecision,
  type PortfolioDecision,
} from "@helm-agents/shared";
import { PORTFOLIO_MANAGER_SYSTEM } from "../prompts.js";
import {
  instrumentContext,
  languageInstruction,
  type AgentDeps,
  type AgentNode,
} from "../context.js";

export function createPortfolioManager(deps: AgentDeps): AgentNode {
  return async (state) => {
    const ds = state.riskDebateState;
    const res = await deps.deep.invoke({
      system: `${PORTFOLIO_MANAGER_SYSTEM}${languageInstruction(deps.config)}`,
      messages: [
        {
          role: "user",
          content: [
            instrumentContext(state),
            `**Research plan:**\n${state.investmentPlan}`,
            `**Trader proposal:**\n${state.traderInvestmentPlan}`,
            `**Risk-management debate:**\n${ds.history}`,
            state.pastContext ? `**Prior decision memory:**\n${state.pastContext}` : "",
          ]
            .filter(Boolean)
            .join("\n\n"),
        },
      ],
      structured: PortfolioDecisionSchema,
    });

    const decision = res.parsed as PortfolioDecision | undefined;
    const finalTradeDecision = decision ? renderPmDecision(decision) : res.content;

    return {
      finalTradeDecision,
      riskDebateState: {
        ...ds,
        judgeDecision: finalTradeDecision,
      },
      ...(decision ? { structured: { finalTradeDecision: decision } } : {}),
    };
  };
}
