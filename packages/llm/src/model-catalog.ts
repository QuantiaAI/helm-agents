/**
 * Model catalog (ports llm_clients/model_catalog.py). Per-provider model lists
 * split into quick (fast/cheap) and deep (reasoning) tiers, plus a set of
 * providers that only accept a user-supplied custom model id.
 */

export type ModelMode = "quick" | "deep";

export interface ModelOption {
  label: string;
  modelId: string;
}

// Providers whose model lineup changes too fast to keep a static list — the UI
// offers a free-form "custom model id" input instead.
export const CUSTOM_ONLY_PROVIDERS = new Set([
  "mistral",
  "kimi",
  "groq",
  "nvidia",
  "bedrock",
  "openai_compatible",
  "openrouter",
]);

export const MODEL_OPTIONS: Record<string, Partial<Record<ModelMode, ModelOption[]>>> = {
  openai: {
    quick: [
      { label: "GPT-5.4 mini", modelId: "gpt-5.4-mini" },
      { label: "GPT-5.4 nano", modelId: "gpt-5.4-nano" },
      { label: "GPT-4.1", modelId: "gpt-4.1" },
    ],
    deep: [
      { label: "GPT-5.5", modelId: "gpt-5.5" },
      { label: "GPT-5.5 pro", modelId: "gpt-5.5-pro" },
      { label: "GPT-5.4", modelId: "gpt-5.4" },
    ],
  },
  anthropic: {
    quick: [
      { label: "Claude Haiku 4.5", modelId: "claude-haiku-4-5" },
      { label: "Claude Sonnet 4.6", modelId: "claude-sonnet-4-6" },
    ],
    deep: [
      { label: "Claude Opus 4.8", modelId: "claude-opus-4-8" },
      { label: "Claude Sonnet 4.6", modelId: "claude-sonnet-4-6" },
    ],
  },
  google: {
    quick: [
      { label: "Gemini 3.5 Flash", modelId: "gemini-3.5-flash" },
      { label: "Gemini 3.1 Flash Lite", modelId: "gemini-3.1-flash-lite" },
    ],
    deep: [
      { label: "Gemini 3.1 Pro (preview)", modelId: "gemini-3.1-pro-preview" },
      { label: "Gemini 2.5 Pro", modelId: "gemini-2.5-pro" },
    ],
  },
  xai: {
    quick: [{ label: "Grok 4.3", modelId: "grok-4.3" }],
    deep: [{ label: "Grok 4.20 reasoning", modelId: "grok-4.20-reasoning" }],
  },
  deepseek: {
    quick: [{ label: "DeepSeek V4 Flash", modelId: "deepseek-v4-flash" }],
    deep: [{ label: "DeepSeek V4 Pro", modelId: "deepseek-v4-pro" }],
  },
  qwen: {
    quick: [{ label: "Qwen 3.6 Plus", modelId: "qwen3.6-plus" }],
    deep: [{ label: "Qwen 3.7 Max", modelId: "qwen3.7-max" }],
  },
  "qwen-cn": {
    quick: [{ label: "Qwen 3.6 Plus", modelId: "qwen3.6-plus" }],
    deep: [{ label: "Qwen 3.7 Max", modelId: "qwen3.7-max" }],
  },
  glm: {
    quick: [
      { label: "GLM 5 Turbo", modelId: "glm-5-turbo" },
      { label: "GLM 4.5 Air", modelId: "glm-4.5-air" },
    ],
    deep: [{ label: "GLM 5.2", modelId: "glm-5.2" }],
  },
  "glm-cn": {
    quick: [{ label: "GLM 4.5 Air", modelId: "glm-4.5-air" }],
    deep: [{ label: "GLM 5.2", modelId: "glm-5.2" }],
  },
  minimax: {
    quick: [{ label: "MiniMax M2.7 highspeed", modelId: "MiniMax-M2.7-highspeed" }],
    deep: [{ label: "MiniMax M3", modelId: "MiniMax-M3" }],
  },
  "minimax-cn": {
    quick: [{ label: "MiniMax M2.7 highspeed", modelId: "MiniMax-M2.7-highspeed" }],
    deep: [{ label: "MiniMax M3", modelId: "MiniMax-M3" }],
  },
  ollama: {
    quick: [
      { label: "Qwen 3", modelId: "qwen3:latest" },
      { label: "GPT-OSS", modelId: "gpt-oss:latest" },
    ],
    deep: [{ label: "GLM 4.7 Flash", modelId: "glm-4.7-flash:latest" }],
  },
};

export function getModelOptions(provider: string, mode: ModelMode): ModelOption[] {
  return MODEL_OPTIONS[provider.toLowerCase()]?.[mode] ?? [];
}

export function isCustomOnly(provider: string): boolean {
  return CUSTOM_ONLY_PROVIDERS.has(provider.toLowerCase());
}
