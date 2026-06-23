/**
 * Canonical provider -> API-key env-var mapping (ports
 * tradingagents/llm_clients/api_key_env.PROVIDER_API_KEY_ENV).
 *
 * Single source of truth consulted by both the provider registry and the
 * (Phase 3) settings UI. null = no single key (AWS credential chain, or
 * keyless local runtimes).
 */
export const PROVIDER_API_KEY_ENV: Record<string, string | null> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  azure: "AZURE_OPENAI_API_KEY",
  // Bedrock authenticates via the AWS credential chain, not a single key env.
  bedrock: null,
  xai: "XAI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  // Dual-region providers carry separate accounts; keys are not interchangeable.
  qwen: "DASHSCOPE_API_KEY",
  "qwen-cn": "DASHSCOPE_CN_API_KEY",
  glm: "ZHIPU_API_KEY",
  "glm-cn": "ZHIPU_CN_API_KEY",
  minimax: "MINIMAX_API_KEY",
  "minimax-cn": "MINIMAX_CN_API_KEY",
  openrouter: "OPENROUTER_API_KEY",
  // Additional hosted OpenAI-compatible providers (kimi -> Moonshot; nvidia -> NIM).
  mistral: "MISTRAL_API_KEY",
  kimi: "MOONSHOT_API_KEY",
  groq: "GROQ_API_KEY",
  nvidia: "NVIDIA_API_KEY",
  // Local runtimes do not authenticate.
  ollama: null,
  openai_compatible: "OPENAI_COMPATIBLE_API_KEY",
  anthropic_compatible: "ANTHROPIC_COMPATIBLE_API_KEY",
};

export function getApiKeyEnv(provider: string): string | null {
  return PROVIDER_API_KEY_ENV[provider.toLowerCase()] ?? null;
}
