/**
 * LangGraph state channels (ports tradingagents/agents/utils/agent_states.py).
 *
 * Mirrors the AgentState Zod schema from @helm-agents/shared. Each field uses
 * a replace reducer (the agent nodes return complete values / complete debate
 * sub-states), so no append/merge logic is needed. `messages` is included for
 * parity but agents in Phase 1 communicate via report fields, not messages.
 */
import { Annotation } from "@langchain/langgraph";
import type {
  InvestDebateState,
  RiskDebateState,
  Message,
} from "@helm-agents/shared";

function replace<T>(): (prev: T, next: T) => T {
  return (_prev, next) => next;
}

const emptyInvest: InvestDebateState = {
  bullHistory: "",
  bearHistory: "",
  history: "",
  currentResponse: "",
  judgeDecision: "",
  count: 0,
};

const emptyRisk: RiskDebateState = {
  aggressiveHistory: "",
  conservativeHistory: "",
  neutralHistory: "",
  history: "",
  latestSpeaker: "",
  currentAggressiveResponse: "",
  currentConservativeResponse: "",
  currentNeutralResponse: "",
  judgeDecision: "",
  count: 0,
};

export const GraphState = Annotation.Root({
  messages: Annotation<Message[]>({ reducer: replace(), default: () => [] }),
  companyOfInterest: Annotation<string>({
    reducer: replace(),
    default: () => "",
  }),
  assetType: Annotation<"stock" | "crypto">({
    reducer: replace(),
    default: () => "stock",
  }),
  instrumentContext: Annotation<string>({
    reducer: replace(),
    default: () => "",
  }),
  tradeDate: Annotation<string>({ reducer: replace(), default: () => "" }),
  pastContext: Annotation<string>({ reducer: replace(), default: () => "" }),
  sender: Annotation<string>({ reducer: replace(), default: () => "" }),
  marketReport: Annotation<string>({ reducer: replace(), default: () => "" }),
  sentimentReport: Annotation<string>({ reducer: replace(), default: () => "" }),
  newsReport: Annotation<string>({ reducer: replace(), default: () => "" }),
  fundamentalsReport: Annotation<string>({
    reducer: replace(),
    default: () => "",
  }),
  investmentDebateState: Annotation<InvestDebateState>({
    reducer: replace(),
    default: () => ({ ...emptyInvest }),
  }),
  riskDebateState: Annotation<RiskDebateState>({
    reducer: replace(),
    default: () => ({ ...emptyRisk }),
  }),
  investmentPlan: Annotation<string>({ reducer: replace(), default: () => "" }),
  traderInvestmentPlan: Annotation<string>({
    reducer: replace(),
    default: () => "",
  }),
  finalTradeDecision: Annotation<string>({
    reducer: replace(),
    default: () => "",
  }),
  // Structured-output sidecar. Unlike the report channels (replace), this MERGES
  // each node's contribution so objects from different agents accumulate.
  structured: Annotation<Record<string, unknown>>({
    reducer: (prev, next) => ({ ...prev, ...next }),
    default: () => ({}),
  }),
});

export type GraphStateType = typeof GraphState.State;
