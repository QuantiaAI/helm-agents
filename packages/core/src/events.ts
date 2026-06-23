/**
 * Normalized run events emitted by Engine.streamEvents for SSE consumption
 * (ports the original's per-chunk stream output). Phase 1 emits node-level
 * patches + a terminal done/error event; richer events (messages, tools,
 * token stats) arrive in Phase 3.
 */
import type { AgentState, PortfolioRating } from "@helm-agents/shared";

export type RunEvent =
  | { type: "nodeEnd"; node: string; patch: Record<string, unknown> }
  | { type: "done"; rating: PortfolioRating; finalState: AgentState }
  | { type: "error"; message: string };
