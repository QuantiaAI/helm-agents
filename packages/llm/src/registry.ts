/**
 * Provider registry (ports tradingagents/llm_clients/factory.py +
 * openai_client.OPENAI_COMPATIBLE_PROVIDERS).
 *
 * One row per provider. The OpenAI-compatible family (openai, xAI, DeepSeek,
 * Qwen, GLM, MiniMax, OpenRouter, Mistral, Kimi, Groq, NVIDIA, Ollama, generic)
 * all speak the Chat Completions API and differ only by base URL / auth, so they
 * share one client. Native Anthropic / Google / Azure / Bedrock use genuinely
 * different APIs and have their own clients (Phase 2).
 */
import type { ProviderSpec, LlmClient } from "./types.js";
import { PROVIDER_API_KEY_ENV } from "./api-key-env.js";
import { createOpenAiCompatibleClient } from "./openai.js";
import { createAnthropicClient } from "./anthropic.js";
import { createGoogleClient } from "./google.js";

/** Native clients implemented in Phase 2b. azure/bedrock remain TODO. */
const IMPLEMENTED_NATIVES = new Set(["anthropic", "google"]);

export class ProviderNotImplementedError extends Error {
  constructor(provider: string) {
    super(`Provider '${provider}' is not implemented yet`);
    this.name = "ProviderNotImplementedError";
  }
}

function spec(name: string, extra: Partial<ProviderSpec> = {}): ProviderSpec {
  return {
    name,
    keyEnv: PROVIDER_API_KEY_ENV[name] ?? null,
    ...extra,
  };
}

export const PROVIDERS: Record<string, ProviderSpec> = {
  // --- OpenAI-compatible family ---
  openai: spec("openai"),
  xai: spec("xai", { baseUrl: "https://api.x.ai/v1" }),
  deepseek: spec("deepseek", { baseUrl: "https://api.deepseek.com" }),
  qwen: spec("qwen", {
    baseUrl: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  }),
  "qwen-cn": spec("qwen-cn", {
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
  }),
  glm: spec("glm", { baseUrl: "https://api.z.ai/api/paas/v4/" }),
  "glm-cn": spec("glm-cn", { baseUrl: "https://open.bigmodel.cn/api/paas/v4/" }),
  minimax: spec("minimax", { baseUrl: "https://api.minimax.io/v1" }),
  "minimax-cn": spec("minimax-cn", { baseUrl: "https://api.minimaxi.com/v1" }),
  openrouter: spec("openrouter", { baseUrl: "https://openrouter.ai/api/v1" }),
  mistral: spec("mistral", { baseUrl: "https://api.mistral.ai/v1" }),
  kimi: spec("kimi", { baseUrl: "https://api.moonshot.ai/v1" }),
  groq: spec("groq", { baseUrl: "https://api.groq.com/openai/v1" }),
  nvidia: spec("nvidia", { baseUrl: "https://integrate.api.nvidia.com/v1" }),
  ollama: spec("ollama", {
    baseUrl: "http://localhost:11434/v1",
    baseUrlEnv: "OLLAMA_BASE_URL",
    keyOptional: true,
    placeholderKey: "ollama",
  }),
  openai_compatible: spec("openai_compatible", {
    keyOptional: true,
    requireBaseUrl: true,
  }),

  // --- Native clients (Phase 2) ---
  anthropic: spec("anthropic", { native: "anthropic" }),
  anthropic_compatible: spec("anthropic_compatible", {
    native: "anthropic",
    requireBaseUrl: true,
  }),
  google: spec("google", { native: "google" }),
  azure: spec("azure", { native: "azure" }),
  bedrock: spec("bedrock", { native: "bedrock" }),
};

export function listProviders(): string[] {
  return Object.keys(PROVIDERS);
}

export function getProviderSpec(provider: string): ProviderSpec | undefined {
  return PROVIDERS[provider.toLowerCase()];
}

export function isOpenAiCompatible(provider: string): boolean {
  const s = PROVIDERS[provider.toLowerCase()];
  return !!s && !s.native;
}

/** UI 接口类型：anthropic-native 系归 "anthropic"，其余归 "openai"。 */
export function getInterfaceType(provider: string): "openai" | "anthropic" {
  return getProviderSpec(provider)?.native === "anthropic"
    ? "anthropic"
    : "openai";
}

/** Settings 页可选的 provider（排除本页面不支持的 google/azure/bedrock）。 */
const SETTINGS_HIDDEN_PROVIDERS = new Set(["google", "azure", "bedrock"]);
export function listSettingsProviders(): {
  name: string;
  interface: "openai" | "anthropic";
}[] {
  return listProviders()
    .filter((name) => !SETTINGS_HIDDEN_PROVIDERS.has(name))
    .map((name) => ({ name, interface: getInterfaceType(name) }));
}

export interface CreateClientOptions {
  provider: string;
  model: string;
  baseUrl?: string;
  apiKey?: string;
  env?: NodeJS.ProcessEnv;
}

export interface ResolvedProviderDeps {
  provider: string;
  model: string;
  baseUrl?: string;
  apiKey: string;
}

/**
 * Pure resolution of base URL + API key for a provider (no network). Exposed for
 * testability and reuse by the settings UI. Priority: explicit override → env →
 * spec default / placeholder.
 */
export function resolveProviderDeps(
  opts: CreateClientOptions,
): ResolvedProviderDeps {
  const specObj = getProviderSpec(opts.provider);
  if (!specObj) throw new Error(`Unknown provider: ${opts.provider}`);
  if (specObj.native && !IMPLEMENTED_NATIVES.has(specObj.native)) {
    throw new ProviderNotImplementedError(opts.provider);
  }

  const env = opts.env ?? process.env;

  const baseUrl =
    opts.baseUrl ??
    (specObj.baseUrlEnv ? env[specObj.baseUrlEnv] : undefined) ??
    specObj.baseUrl;

  if (specObj.requireBaseUrl && !baseUrl) {
    throw new Error(
      `Provider '${opts.provider}' requires an explicit base URL`,
    );
  }

  const envKey = specObj.keyEnv ?? undefined;
  const apiKey =
    opts.apiKey ??
    (envKey ? env[envKey] : undefined) ??
    specObj.placeholderKey ??
    "";

  return { provider: opts.provider, model: opts.model, baseUrl, apiKey };
}

export function createLlmClient(opts: CreateClientOptions): LlmClient {
  const deps = resolveProviderDeps(opts);
  const specObj = getProviderSpec(opts.provider)!;

  if (specObj.native === "anthropic") {
    return createAnthropicClient({
      model: deps.model,
      apiKey: deps.apiKey,
      baseUrl: deps.baseUrl,
    });
  }
  if (specObj.native === "google") {
    return createGoogleClient({ model: deps.model, apiKey: deps.apiKey });
  }
  return createOpenAiCompatibleClient(deps);
}
