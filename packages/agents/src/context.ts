/**
 * Shared agent dependencies + prompt helpers (ports
 * tradingagents/agents/utils/agent_utils helpers consumed by every agent).
 */
import type { LlmClient } from "@helm-agents/llm";
import type { RouteFn } from "@helm-agents/dataflows";
import type { ResolvedConfig } from "@helm-agents/config";
import type { AgentState } from "@helm-agents/shared";

export interface AgentDeps {
  /** Quick-thinking LLM — used by most agents. */
  quick: LlmClient;
  /** Deep-thinking LLM — used by Research Manager + Portfolio Manager. */
  deep: LlmClient;
  /** Bound data-vendor route function. */
  route: RouteFn;
  config: ResolvedConfig;
}

export type AgentNode = (state: AgentState) => Promise<Partial<AgentState>>;

/**
 * Prompt instruction for the configured output language. Empty for English
 * (default) so no extra tokens are spent (ports get_language_instruction).
 */
export function languageInstruction(config: ResolvedConfig): string {
  const lang = (config.outputLanguage ?? "English").trim();
  if (!lang || lang.toLowerCase() === "english") return "";
  return `\n\nWrite your full response in ${lang}.`;
}

/**
 * The instrument identity context for the current run. Prefers the
 * identity-resolved context set at run start; falls back to a ticker-only
 * context with no network lookup (ports get_instrument_context_from_state).
 */
export function instrumentContext(state: AgentState): string {
  const ctx = state.instrumentContext?.trim();
  if (ctx) return ctx;
  return `Analyzing ${state.companyOfInterest} (${state.assetType}). Reference date: ${state.tradeDate}.`;
}

export function assetLabel(state: AgentState): string {
  return state.assetType === "stock" ? "stock" : "asset";
}
