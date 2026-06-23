/**
 * Data-method catalog + category mapping (ports
 * tradingagents/dataflows/interface.TOOLS_CATEGORIES).
 */

export type DataMethod =
  | "getStockData"
  | "getIndicators"
  | "getFundamentals"
  | "getBalanceSheet"
  | "getCashflow"
  | "getIncomeStatement"
  | "getNews"
  | "getGlobalNews"
  | "getInsiderTransactions"
  | "getMacroIndicators"
  | "getPredictionMarkets"
  | "getSocialSentiment";

export const METHOD_CATEGORY: Record<DataMethod, string> = {
  getStockData: "core_stock_apis",
  getIndicators: "technical_indicators",
  getFundamentals: "fundamental_data",
  getBalanceSheet: "fundamental_data",
  getCashflow: "fundamental_data",
  getIncomeStatement: "fundamental_data",
  getNews: "news_data",
  getGlobalNews: "news_data",
  getInsiderTransactions: "news_data",
  getMacroIndicators: "macro_data",
  getPredictionMarkets: "prediction_markets",
  getSocialSentiment: "social_data",
};
