/**
 * Default configuration (ports tradingagents/default_config.py DEFAULT_CONFIG).
 * Field names are camelCase; see spec §14 for snake_case mapping.
 */

export interface ResolvedConfig {
  // Paths / IO
  projectDir: string;
  resultsDir: string;
  dataCacheDir: string;
  memoryLogPath: string;
  memoryLogMaxEntries: number | null;

  // LLM core
  llmProvider: string;
  deepThinkLlm: string;
  quickThinkLlm: string;
  backendUrl: string | null;

  // Provider reasoning params
  googleThinkingLevel: string | null;
  openaiReasoningEffort: string | null;
  anthropicEffort: string | null;
  temperature: number | null;

  // Language / debate / graph behavior
  outputLanguage: string;
  checkpointEnabled: boolean;
  maxDebateRounds: number;
  maxRiskDiscussRounds: number;
  maxRecurLimit: number;
  analystConcurrencyLimit: number;

  // News / data tuning
  newsArticleLimit: number;
  globalNewsArticleLimit: number;
  globalNewsLookbackDays: number;

  // Data vendor routing (category-level + method-level)
  dataVendors: Record<string, string>;
  toolVendors: Record<string, string>;

  // Benchmarks
  benchmarkTicker: string | null;
  benchmarkMap: Record<string, string>;
}

const HOME = process.env.HOME || process.env.USERPROFILE || ".";
const BASE = `${HOME}/.tradingagents-web`;

export const DEFAULT_CONFIG: ResolvedConfig = {
  projectDir: process.cwd(),
  resultsDir: `${BASE}/logs`,
  dataCacheDir: `${BASE}/cache`,
  memoryLogPath: `${BASE}/memory/trading_memory.md`,
  memoryLogMaxEntries: null,

  llmProvider: "openai",
  deepThinkLlm: "gpt-5.5",
  quickThinkLlm: "gpt-5.4-mini",
  backendUrl: null,

  googleThinkingLevel: null,
  openaiReasoningEffort: null,
  anthropicEffort: null,
  temperature: null,

  outputLanguage: "English",
  checkpointEnabled: false,
  maxDebateRounds: 1,
  maxRiskDiscussRounds: 1,
  maxRecurLimit: 100,
  analystConcurrencyLimit: 1,

  newsArticleLimit: 20,
  globalNewsArticleLimit: 10,
  globalNewsLookbackDays: 7,

  dataVendors: {
    core_stock_apis: "yfinance",
    technical_indicators: "yfinance",
    fundamental_data: "yfinance",
    news_data: "yfinance",
    macro_data: "fred",
    prediction_markets: "polymarket",
    social_data: "social",
  },
  toolVendors: {},

  benchmarkTicker: null,
  benchmarkMap: {
    ".NS": "^NSEI",
    ".T": "^N225",
    ".HK": "^HSI",
    ".L": "^FTSE",
    "": "SPY",
  },
};
