/**
 * Research Manager (ports managers/research_manager.py). Deep-thinking LLM,
 * structured ResearchPlan output. Judges the bull/bear debate.
 */
import {
  ResearchPlanSchema,
  renderResearchPlan,
  type ResearchPlan,
} from "@helm-agents/shared";
import { RESEARCH_MANAGER_SYSTEM } from "../prompts.js";
import {
  instrumentContext,
  languageInstruction,
  type AgentDeps,
  type AgentNode,
} from "../context.js";

export function createResearchManager(deps: AgentDeps): AgentNode {
  return async (state) => {
    const ds = state.investmentDebateState;
    const res = await deps.deep.invoke({
      system: `${RESEARCH_MANAGER_SYSTEM}${languageInstruction(deps.config)}`,
      messages: [
        {
          role: "user",
          content: `${instrumentContext(state)}\n\n**Debate History:**\n${ds.history}`,
        },
      ],
      structured: ResearchPlanSchema,
    });

    const plan = res.parsed as ResearchPlan | undefined;
    const investmentPlan = plan ? renderResearchPlan(plan) : res.content;

    return {
      investmentPlan,
      investmentDebateState: {
        ...ds,
        judgeDecision: investmentPlan,
        currentResponse: investmentPlan,
      },
      ...(plan ? { structured: { investmentPlan: plan } } : {}),
    };
  };
}
