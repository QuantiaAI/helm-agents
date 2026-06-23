/**
 * LangGraph topology assembly (ports tradingagents/graph/setup.py).
 *
 * Phase 1 analysts are single-pass (no tool-call loop), so the graph is a serial
 * analyst chain feeding two debate loops. Conditional edges drive the Bull⇄Bear
 * and Aggressive→Conservative→Neutral rotations.
 */
import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import {
  createMarketAnalyst,
  createSentimentAnalyst,
  createNewsAnalyst,
  createFundamentalsAnalyst,
  createBullResearcher,
  createBearResearcher,
  createResearchManager,
  createTrader,
  createAggressiveDebator,
  createConservativeDebator,
  createNeutralDebator,
  createPortfolioManager,
  type AgentDeps,
} from "@helm-agents/agents";
import type { AgentNode } from "@helm-agents/agents";
import { GraphState, type GraphStateType } from "./state.js";
import { shouldContinueDebate, shouldContinueRiskAnalysis } from "./conditions.js";

export type AnalystKey = "market" | "sentiment" | "news" | "fundamentals";

export const DEFAULT_ANALYSTS: AnalystKey[] = [
  "market",
  "sentiment",
  "news",
  "fundamentals",
];

const ANALYST_FACTORY: Record<AnalystKey, (deps: AgentDeps) => AgentNode> = {
  market: createMarketAnalyst,
  sentiment: createSentimentAnalyst,
  news: createNewsAnalyst,
  fundamentals: createFundamentalsAnalyst,
};

const ANALYST_NODE: Record<AnalystKey, string> = {
  market: "Market Analyst",
  sentiment: "Sentiment Analyst",
  news: "News Analyst",
  fundamentals: "Fundamentals Analyst",
};

export interface BuildGraphOptions {
  selectedAnalysts?: AnalystKey[];
}

type Compiled = ReturnType<StateGraph<typeof GraphState.State>["compile"]>;

/**
 * Permissive builder interface. LangGraph.js tracks node names in a strict
 * generic, which rejects string variables at compile time even though the
 * runtime is correct. We cast once and let the end-to-end graph test verify
 * behavior.
 */
interface GraphBuilder {
  addNode(
    name: string,
    fn: (state: GraphStateType) => Promise<Partial<GraphStateType>>,
  ): void;
  addEdge(from: string, to: string): void;
  addConditionalEdges(
    from: string,
    cond: (state: GraphStateType) => string,
    map: Record<string, string>,
  ): void;
  compile(checkpointer?: unknown): Compiled;
}

export function buildGraph(deps: AgentDeps, opts: BuildGraphOptions = {}): Compiled {
  const { config } = deps;
  const analysts = opts.selectedAnalysts ?? DEFAULT_ANALYSTS;
  const graph = new StateGraph(GraphState) as unknown as GraphBuilder;

  type Node = (state: GraphStateType) => Promise<Partial<GraphStateType>>;
  const node = (fn: AgentNode): Node => fn as unknown as Node;

  // --- Analysts (serial chain) ---
  for (const key of analysts) {
    graph.addNode(ANALYST_NODE[key], node(ANALYST_FACTORY[key](deps)));
  }
  // --- Researchers + manager ---
  graph.addNode("Bull Researcher", node(createBullResearcher(deps)));
  graph.addNode("Bear Researcher", node(createBearResearcher(deps)));
  graph.addNode("Research Manager", node(createResearchManager(deps)));
  // --- Trader ---
  graph.addNode("Trader", node(createTrader(deps)));
  // --- Risk debators ---
  graph.addNode("Aggressive Analyst", node(createAggressiveDebator(deps)));
  graph.addNode("Conservative Analyst", node(createConservativeDebator(deps)));
  graph.addNode("Neutral Analyst", node(createNeutralDebator(deps)));
  // --- Portfolio manager ---
  graph.addNode("Portfolio Manager", node(createPortfolioManager(deps)));

  // --- Edges: START → analyst chain → Bull ---
  const analystNodes = analysts.map((k) => ANALYST_NODE[k]);
  graph.addEdge(START, analystNodes[0]!);
  for (let i = 0; i < analystNodes.length - 1; i++) {
    graph.addEdge(analystNodes[i]!, analystNodes[i + 1]!);
  }
  graph.addEdge(analystNodes[analystNodes.length - 1]!, "Bull Researcher");

  // --- Investment-debate loop (Bull ⇄ Bear → Research Manager) ---
  const debateCond = (s: GraphStateType) =>
    shouldContinueDebate(s, config.maxDebateRounds);
  graph.addConditionalEdges("Bull Researcher", debateCond, {
    "Research Manager": "Research Manager",
    "Bear Researcher": "Bear Researcher",
    "Bull Researcher": "Bull Researcher",
  });
  graph.addConditionalEdges("Bear Researcher", debateCond, {
    "Research Manager": "Research Manager",
    "Bear Researcher": "Bear Researcher",
    "Bull Researcher": "Bull Researcher",
  });

  // --- Research Manager → Trader → first risk debator ---
  graph.addEdge("Research Manager", "Trader");
  graph.addEdge("Trader", "Aggressive Analyst");

  // --- Risk-debate rotation (Aggressive → Conservative → Neutral → PM) ---
  const riskCond = (s: GraphStateType) =>
    shouldContinueRiskAnalysis(s, config.maxRiskDiscussRounds);
  const riskMap = {
    "Portfolio Manager": "Portfolio Manager",
    "Conservative Analyst": "Conservative Analyst",
    "Neutral Analyst": "Neutral Analyst",
    "Aggressive Analyst": "Aggressive Analyst",
  };
  graph.addConditionalEdges("Aggressive Analyst", riskCond, riskMap);
  graph.addConditionalEdges("Conservative Analyst", riskCond, riskMap);
  graph.addConditionalEdges("Neutral Analyst", riskCond, riskMap);

  // --- Portfolio Manager → END ---
  graph.addEdge("Portfolio Manager", END);

  // In-process checkpointing when enabled (config.checkpointEnabled).
  // Note: persistent cross-restart resume would require a durable checkpointer
  // backed by the JSON store — MemorySaver here covers in-process resume.
  return deps.config.checkpointEnabled
    ? graph.compile({ checkpointer: new MemorySaver() })
    : graph.compile();
}
