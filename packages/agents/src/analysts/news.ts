import { createDataAnalyst } from "./shared.js";
import { NEWS_ANALYST_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createNewsAnalyst(deps: AgentDeps) {
  return createDataAnalyst(deps, {
    system: NEWS_ANALYST_SYSTEM,
    reportField: "newsReport",
    role: "News Analyst",
    calls: (state) => [
      {
        method: "getNews",
        args: [state.companyOfInterest, state.tradeDate],
        label: "Company news",
      },
      { method: "getGlobalNews", args: [], label: "Global / world-affairs news" },
      {
        method: "getInsiderTransactions",
        args: [state.companyOfInterest],
        label: "Insider transactions",
      },
      {
        method: "getMacroIndicators",
        args: [],
        label: "Macro indicators",
      },
      { method: "getPredictionMarkets", args: [], label: "Prediction markets" },
    ],
  });
}
