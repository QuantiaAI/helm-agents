/**
 * Trader (ports trader/trader.py). Quick-thinking LLM, structured
 * TraderProposal output. Translates the Research Manager's plan into a concrete
 * transaction proposal carrying a FINAL TRANSACTION PROPOSAL stop-signal line.
 */
import {
  TraderProposalSchema,
  renderTraderProposal,
  type TraderProposal,
} from "@helm-agents/shared";
import { TRADER_SYSTEM } from "../prompts.js";
import {
  instrumentContext,
  languageInstruction,
  type AgentDeps,
  type AgentNode,
} from "../context.js";

export function createTrader(deps: AgentDeps): AgentNode {
  return async (state) => {
    const res = await deps.quick.invoke({
      system: `${TRADER_SYSTEM}${languageInstruction(deps.config)}`,
      messages: [
        {
          role: "user",
          content: `${instrumentContext(state)}\n\nProposed Investment Plan for ${state.companyOfInterest}:\n${state.investmentPlan}\n\nLeverage these insights to make an informed, strategic decision.`,
        },
      ],
      structured: TraderProposalSchema,
    });

    const proposal = res.parsed as TraderProposal | undefined;
    const traderInvestmentPlan = proposal
      ? renderTraderProposal(proposal)
      : res.content;

    return {
      traderInvestmentPlan,
      sender: "Trader",
      ...(proposal ? { structured: { traderInvestmentPlan: proposal } } : {}),
    };
  };
}
