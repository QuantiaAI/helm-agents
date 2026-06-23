import { createDataAnalyst } from "./shared.js";
import { FUNDAMENTALS_ANALYST_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createFundamentalsAnalyst(deps: AgentDeps) {
  return createDataAnalyst(deps, {
    system: FUNDAMENTALS_ANALYST_SYSTEM,
    reportField: "fundamentalsReport",
    role: "Fundamentals Analyst",
    calls: (state) => [
      {
        method: "getFundamentals",
        args: [state.companyOfInterest],
        label: "Overview / key metrics",
      },
      {
        method: "getBalanceSheet",
        args: [state.companyOfInterest],
        label: "Balance sheet",
      },
      {
        method: "getCashflow",
        args: [state.companyOfInterest],
        label: "Cash flow",
      },
      {
        method: "getIncomeStatement",
        args: [state.companyOfInterest],
        label: "Income statement",
      },
    ],
  });
}
