// The 13-analyst cast (design system §05). Each role carries a single-glyph
// avatar symbol + its pipeline stage + accent color, so timelines and report
// cards can render the agent the way the design does: a colored glyph avatar.
// Glyphs are fixed visual symbols (not prose), matching the design mockups.
import { HELM_COLORS, DEBATE_COLORS } from "@/lib/theme-tokens";

export type AgentStage =
  | "analysts"
  | "debate"
  | "trading"
  | "risk"
  | "portfolio";

export interface AgentMeta {
  glyph: string;
  stage: AgentStage;
  color: string;
}

const CYAN = HELM_COLORS.accent; // #2DE2E6
const ORANGE = "#F08A4B"; // risk stage (design §05 stage 4)

const AGENT_META: Record<string, AgentMeta> = {
  "Market Analyst": { glyph: "市", stage: "analysts", color: CYAN },
  "Sentiment Analyst": { glyph: "情", stage: "analysts", color: CYAN },
  "News Analyst": { glyph: "闻", stage: "analysts", color: CYAN },
  "Fundamentals Analyst": { glyph: "本", stage: "analysts", color: CYAN },
  "Bull Researcher": { glyph: "多", stage: "debate", color: DEBATE_COLORS.bull },
  "Bear Researcher": { glyph: "空", stage: "debate", color: DEBATE_COLORS.bear },
  "Research Manager": { glyph: "研", stage: "debate", color: DEBATE_COLORS.neutral },
  Trader: { glyph: "交", stage: "trading", color: CYAN },
  "Aggressive Analyst": { glyph: "激", stage: "risk", color: ORANGE },
  "Conservative Analyst": { glyph: "保", stage: "risk", color: ORANGE },
  "Neutral Analyst": { glyph: "中", stage: "risk", color: ORANGE },
  "Portfolio Manager": { glyph: "决", stage: "portfolio", color: CYAN },
};

const FALLBACK_META: AgentMeta = {
  glyph: "·",
  stage: "analysts",
  color: HELM_COLORS.faint,
};

/** Metadata for a runtime agent (by its English contract name). */
export function agentMeta(name: string): AgentMeta {
  return AGENT_META[name] ?? FALLBACK_META;
}

// Map a report field → the agent that produces it, so a report card can show
// that agent's glyph avatar next to its title (design REPORT screen).
const FIELD_AGENT: Record<string, string> = {
  marketReport: "Market Analyst",
  sentimentReport: "Sentiment Analyst",
  newsReport: "News Analyst",
  fundamentalsReport: "Fundamentals Analyst",
  investmentPlan: "Research Manager",
  traderInvestmentPlan: "Trader",
  finalTradeDecision: "Portfolio Manager",
  investmentDebate: "Research Manager",
  riskDebate: "Neutral Analyst",
};

/** Metadata for the agent that produces a given report field. */
export function fieldAgentMeta(field?: string): AgentMeta {
  return field && FIELD_AGENT[field]
    ? agentMeta(FIELD_AGENT[field])
    : FALLBACK_META;
}
