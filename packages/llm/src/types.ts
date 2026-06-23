/**
 * LLM client interfaces (ports tradingagents/llm_clients/base_client.py).
 */
import type { z } from "zod";

export type LlmRole = "user" | "assistant" | "system" | "tool";

export interface LlmMessage {
  role: LlmRole;
  content: string;
}

export interface InvokeInput {
  system?: string;
  messages: LlmMessage[];
  /** When set, request structured output conforming to this Zod schema. */
  structured?: z.ZodType;
}

export interface LlmUsage {
  input: number;
  output: number;
}

export interface LlmResult {
  content: string;
  /** Parsed structured output, if requested and successfully parsed. */
  parsed?: unknown;
  usage: LlmUsage;
}

export interface LlmClient {
  readonly provider: string;
  readonly model: string;
  invoke(input: InvokeInput): Promise<LlmResult>;
}

/** Declarative config for one provider (ports ProviderSpec + key mapping). */
export interface ProviderSpec {
  name: string;
  baseUrl?: string;
  baseUrlEnv?: string;
  keyEnv?: string | null;
  keyOptional?: boolean;
  placeholderKey?: string;
  requireBaseUrl?: boolean;
  /** Native clients (anthropic/google/azure/bedrock) are NOT OpenAI-compatible. */
  native?: "anthropic" | "google" | "azure" | "bedrock" | false;
}
