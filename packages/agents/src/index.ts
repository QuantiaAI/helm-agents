/**
 * 13 agent factories + shared deps interface (ports tradingagents/agents).
 * Every agent is an injectable LangGraph.js node: (state) => Promise<Partial<AgentState>>.
 */
export type { AgentDeps, AgentNode } from "./context.js";

// Analysts
export { createMarketAnalyst } from "./analysts/market.js";
export { createSentimentAnalyst } from "./analysts/sentiment.js";
export { createNewsAnalyst } from "./analysts/news.js";
export { createFundamentalsAnalyst } from "./analysts/fundamentals.js";

// Researchers (investment debate)
export { createBullResearcher } from "./researchers/bull.js";
export { createBearResearcher } from "./researchers/bear.js";

// Managers
export { createResearchManager } from "./managers/research-manager.js";
export { createPortfolioManager } from "./managers/portfolio-manager.js";

// Trader
export { createTrader } from "./trader/trader.js";

// Risk-management debate
export { createAggressiveDebator } from "./risk-mgmt/aggressive.js";
export { createConservativeDebator } from "./risk-mgmt/conservative.js";
export { createNeutralDebator } from "./risk-mgmt/neutral.js";
