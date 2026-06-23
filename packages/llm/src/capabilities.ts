/**
 * Per-model capability table (ports tradingagents/llm_clients/capabilities.py).
 *
 * Captures the wire-format quirks of specific models so the clients don't
 * accumulate if-model branches. Resolved by exact ID, then regex pattern, then
 * defaults.
 */
export interface ModelCapabilities {
  /** Model accepts the JSON object response format. */
  supportsJsonMode: boolean;
  /** Model accepts a full JSON schema (OpenAI response_format / Gemini responseSchema). */
  supportsJsonSchema: boolean;
  /** Model honors explicit tool_choice (some reasoning models reject it). */
  supportsToolChoice: boolean;
  /** Preferred structured-output method when several are available. */
  preferredStructuredMethod: "json_schema" | "json_mode" | "tool" | "freetext";
}

export const DEFAULT_CAPABILITIES: ModelCapabilities = {
  supportsJsonMode: true,
  supportsJsonSchema: true,
  supportsToolChoice: true,
  preferredStructuredMethod: "json_schema",
};

interface PatternRule {
  pattern: RegExp;
  capabilities: Partial<ModelCapabilities>;
}

// Reasoning models that reject forced tool_choice; legacy models without JSON schema.
const RULES: PatternRule[] = [
  {
    pattern: /deepseek.*(r1|reasoning)|thinking/i,
    capabilities: {
      supportsToolChoice: false,
      supportsJsonSchema: false,
      preferredStructuredMethod: "json_mode",
    },
  },
  {
    pattern: /^(gpt-3\.5|text-davinci)/i,
    capabilities: { supportsJsonSchema: false, preferredStructuredMethod: "json_mode" },
  },
];

export function getCapabilities(model: string): ModelCapabilities {
  const exact = EXACT_CAPABILITIES[model.toLowerCase()];
  if (exact) return { ...DEFAULT_CAPABILITIES, ...exact };
  for (const rule of RULES) {
    if (rule.pattern.test(model)) {
      return { ...DEFAULT_CAPABILITIES, ...rule.capabilities };
    }
  }
  return { ...DEFAULT_CAPABILITIES };
}

// Models with well-known quirks, keyed by exact lowercased ID.
const EXACT_CAPABILITIES: Record<string, Partial<ModelCapabilities>> = {};
