/**
 * Engine entry point (ports tradingagents/graph/trading_graph.TradingAgentsGraph).
 *
 * createEngine(config) wires the LLM clients, data-vendor router, and the
 * LangGraph workflow into a single public surface:
 *   propagate(input) -> { finalState, rating }
 *   streamEvents(input) -> AsyncIterable<RunEvent>   (for SSE)
 */
import { buildGraph, DEFAULT_ANALYSTS, type AnalystKey } from "@helm-agents/workflow";
import {
  buildVendorRegistry,
  createRouter,
} from "@helm-agents/dataflows";
import { createLlmClient, type LlmClient } from "@helm-agents/llm";
import { detectAssetType, type ResolvedConfig } from "@helm-agents/config";
import type { AgentDeps } from "@helm-agents/agents";
import {
  createInitialState,
  processSignal,
  type AgentState,
  type PortfolioRating,
} from "@helm-agents/shared";
import type { RunEvent } from "./events.js";

export interface AnalyzeInput {
  ticker: string;
  tradeDate: string;
  assetType?: "stock" | "crypto";
  selectedAnalysts?: AnalystKey[];
  instrumentContext?: string;
  pastContext?: string;
  /** Per-run override of the agent report language (e.g. "Japanese"). */
  outputLanguage?: string;
}

export interface AnalyzeResult {
  finalState: AgentState;
  rating: PortfolioRating;
}

export interface Engine {
  propagate(input: AnalyzeInput): Promise<AnalyzeResult>;
  streamEvents(input: AnalyzeInput, signal?: AbortSignal): AsyncIterable<RunEvent>;
  /** One-shot deep-thinking LLM call (used by the reflection feature). */
  reflect(prompt: string): Promise<string>;
}

export interface EngineOverrides {
  /** Inject a custom quick-thinking LLM (e.g. a test stub). */
  quick?: LlmClient;
  /** Inject a custom deep-thinking LLM (e.g. a test stub). */
  deep?: LlmClient;
  /** Inject a custom fetch (used by data vendors; useful for tests). */
  fetchImpl?: typeof fetch;
}

export function createEngine(
  config: ResolvedConfig,
  overrides: EngineOverrides = {},
): Engine {
  const llmOpts = {
    provider: config.llmProvider,
    baseUrl: config.backendUrl ?? undefined,
  };
  const quick =
    overrides.quick ??
    createLlmClient({ ...llmOpts, model: config.quickThinkLlm });
  const deep =
    overrides.deep ??
    createLlmClient({ ...llmOpts, model: config.deepThinkLlm });
  const route = createRouter(
    config,
    buildVendorRegistry(overrides.fetchImpl),
  );
  const deps: AgentDeps = { quick, deep, route, config };

  const compile = (selected?: AnalystKey[], outputLanguage?: string) => {
    const runDeps =
      outputLanguage && outputLanguage !== config.outputLanguage
        ? { ...deps, config: { ...deps.config, outputLanguage } }
        : deps;
    return buildGraph(runDeps, { selectedAnalysts: selected ?? DEFAULT_ANALYSTS });
  };

  const makeState = (input: AnalyzeInput): AgentState =>
    createInitialState({
      ticker: input.ticker,
      tradeDate: input.tradeDate,
      assetType: input.assetType ?? detectAssetType(input.ticker),
      instrumentContext: input.instrumentContext,
      pastContext: input.pastContext,
    });

  return {
    async propagate(input) {
      const graph = compile(input.selectedAnalysts, input.outputLanguage);
      const finalState = (await graph.invoke(makeState(input), {
        recursionLimit: config.maxRecurLimit,
      })) as AgentState;
      const rating = processSignal(finalState.finalTradeDecision);
      return { finalState, rating };
    },

    async reflect(prompt: string): Promise<string> {
      const res = await deep.invoke({ messages: [{ role: "user", content: prompt }] });
      return res.content;
    },

    async *streamEvents(input, signal): AsyncIterable<RunEvent> {
      const graph = compile(input.selectedAnalysts, input.outputLanguage);
      const accumulated = makeState(input);
      try {
        const stream = await graph.stream(accumulated, {
          recursionLimit: config.maxRecurLimit,
          streamMode: "updates",
          signal,
        });
        for await (const chunk of stream) {
          // updates mode: { [nodeName]: Partial<AgentState> }
          for (const [node, patch] of Object.entries(
            chunk as Record<string, Record<string, unknown>>,
          )) {
            if (patch && typeof patch === "object") {
              // `structured` is a merge channel (see workflow/state.ts): a shallow
              // Object.assign would let each node clobber prior contributions, so
              // accumulate it explicitly to mirror the graph's reducer.
              const { structured, ...rest } = patch as {
                structured?: Record<string, unknown>;
              } & Record<string, unknown>;
              Object.assign(accumulated, rest);
              if (structured) {
                accumulated.structured = { ...accumulated.structured, ...structured };
              }
              yield { type: "nodeEnd", node, patch };
            }
          }
        }
        yield {
          type: "done",
          rating: processSignal(accumulated.finalTradeDecision),
          finalState: accumulated,
        };
      } catch (e) {
        yield { type: "error", message: e instanceof Error ? e.message : String(e) };
      }
    },
  };
}
