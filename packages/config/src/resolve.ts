/**
 * Three-layer config merge (ports default_config._apply_env_overrides):
 * DEFAULT_CONFIG → TRADINGAGENTS_* env vars → runtime override. Env var values
 * are coerced to the default value's type (bool/int/float/str).
 */
import { DEFAULT_CONFIG, type ResolvedConfig } from "./default-config.js";

// Explicit per-field coercion types. The original infers the type from the
// default value, but several numeric fields default to null, which makes that
// inference ambiguous. Declaring the intended type here is more robust.
const ENV_KEYS: Record<
  string,
  { key: keyof ResolvedConfig; type: "string" | "number" | "boolean" }
> = {
  TRADINGAGENTS_LLM_PROVIDER: { key: "llmProvider", type: "string" },
  TRADINGAGENTS_DEEP_THINK_LLM: { key: "deepThinkLlm", type: "string" },
  TRADINGAGENTS_QUICK_THINK_LLM: { key: "quickThinkLlm", type: "string" },
  TRADINGAGENTS_LLM_BACKEND_URL: { key: "backendUrl", type: "string" },
  TRADINGAGENTS_OUTPUT_LANGUAGE: { key: "outputLanguage", type: "string" },
  TRADINGAGENTS_MAX_DEBATE_ROUNDS: {
    key: "maxDebateRounds",
    type: "number",
  },
  TRADINGAGENTS_MAX_RISK_ROUNDS: {
    key: "maxRiskDiscussRounds",
    type: "number",
  },
  TRADINGAGENTS_CHECKPOINT_ENABLED: { key: "checkpointEnabled", type: "boolean" },
  TRADINGAGENTS_TEMPERATURE: { key: "temperature", type: "number" },
  TRADINGAGENTS_RESULTS_DIR: { key: "resultsDir", type: "string" },
  TRADINGAGENTS_CACHE_DIR: { key: "dataCacheDir", type: "string" },
  TRADINGAGENTS_MEMORY_LOG_PATH: { key: "memoryLogPath", type: "string" },
  TRADINGAGENTS_BENCHMARK_TICKER: { key: "benchmarkTicker", type: "string" },
};

function coerce(raw: string, type: "string" | "number" | "boolean"): unknown {
  if (type === "boolean") return raw === "true" || raw === "1";
  if (type === "number") return Number(raw);
  return raw;
}

export function resolveConfig(
  opts: { env?: NodeJS.ProcessEnv; runtime?: Partial<ResolvedConfig> } = {},
): ResolvedConfig {
  const env = opts.env ?? process.env;
  const merged: ResolvedConfig = { ...DEFAULT_CONFIG };

  for (const [envKey, spec] of Object.entries(ENV_KEYS)) {
    const raw = env[envKey];
    if (raw !== undefined && raw !== "") {
      Object.assign(merged, { [spec.key]: coerce(raw, spec.type) });
    }
  }

  if (opts.runtime) Object.assign(merged, opts.runtime);
  return merged;
}

const CRYPTO_BASE = "(BTC|ETH|SOL|XRP|DOGE|ADA|AVAX|LINK)";
const CRYPTO_RE = new RegExp(`^${CRYPTO_BASE}USD$`, "i");

/** Detect asset type from a ticker symbol (ports cli detect_asset_type). */
export function detectAssetType(ticker: string): "stock" | "crypto" {
  const t = ticker.toUpperCase();
  if (/^[A-Z]+-USD$/.test(t)) return "crypto";
  if (CRYPTO_RE.test(t)) return "crypto";
  return "stock";
}
