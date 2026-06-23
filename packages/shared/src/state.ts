/**
 * LangGraph shared state (ports tradingagents/agents/utils/agent_states.py).
 * Field names are camelCase; see spec §14 for snake_case compatibility notes.
 */
import { z } from "zod";

export const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string().default(""),
  toolCalls: z.array(z.any()).optional(),
  id: z.string().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const InvestDebateStateSchema = z.object({
  bullHistory: z.string().default(""),
  bearHistory: z.string().default(""),
  history: z.string().default(""),
  currentResponse: z.string().default(""),
  judgeDecision: z.string().default(""),
  count: z.number().default(0),
});
export type InvestDebateState = z.infer<typeof InvestDebateStateSchema>;

export const RiskDebateStateSchema = z.object({
  aggressiveHistory: z.string().default(""),
  conservativeHistory: z.string().default(""),
  neutralHistory: z.string().default(""),
  history: z.string().default(""),
  latestSpeaker: z.string().default(""),
  currentAggressiveResponse: z.string().default(""),
  currentConservativeResponse: z.string().default(""),
  currentNeutralResponse: z.string().default(""),
  judgeDecision: z.string().default(""),
  count: z.number().default(0),
});
export type RiskDebateState = z.infer<typeof RiskDebateStateSchema>;

export const AgentStateSchema = z.object({
  messages: z.array(MessageSchema).default([]),
  companyOfInterest: z.string(),
  assetType: z.enum(["stock", "crypto"]),
  instrumentContext: z.string().default(""),
  tradeDate: z.string(),
  pastContext: z.string().default(""),
  sender: z.string().default(""),
  marketReport: z.string().default(""),
  sentimentReport: z.string().default(""),
  newsReport: z.string().default(""),
  fundamentalsReport: z.string().default(""),
  investmentDebateState: InvestDebateStateSchema,
  riskDebateState: RiskDebateStateSchema,
  investmentPlan: z.string().default(""),
  traderInvestmentPlan: z.string().default(""),
  finalTradeDecision: z.string().default(""),
  // Sidecar carrying the raw structured-output objects (keyed by the report
  // field they back, e.g. "investmentPlan"), so the UI can render rich cards
  // instead of re-parsing the rendered markdown. Merged across agent nodes.
  structured: z.record(z.unknown()).default({}),
});
export type AgentState = z.infer<typeof AgentStateSchema>;

export interface InitialStateInput {
  ticker: string;
  tradeDate: string;
  assetType: "stock" | "crypto";
  instrumentContext?: string;
  pastContext?: string;
}

export function createInitialState(input: InitialStateInput): AgentState {
  return AgentStateSchema.parse({
    companyOfInterest: input.ticker,
    tradeDate: input.tradeDate,
    assetType: input.assetType,
    instrumentContext: input.instrumentContext ?? "",
    pastContext: input.pastContext ?? "",
    investmentDebateState: {},
    riskDebateState: {},
  });
}
