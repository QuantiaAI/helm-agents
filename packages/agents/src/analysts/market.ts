import { createDataAnalyst } from "./shared.js";
import { MARKET_ANALYST_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createMarketAnalyst(deps: AgentDeps) {
  return createDataAnalyst(deps, {
    system: MARKET_ANALYST_SYSTEM,
    reportField: "marketReport",
    role: "Market Analyst",
    calls: (state) => [
      {
        method: "getStockData",
        args: [state.companyOfInterest, state.tradeDate],
        label: "OHLCV / price data",
      },
      {
        method: "getIndicators",
        args: [state.companyOfInterest, state.tradeDate],
        label: "Technical indicators",
      },
    ],
  });
}
