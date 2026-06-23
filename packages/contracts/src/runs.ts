import type { AnalyzeInput } from "@helm-agents/core";

export type RunStatus = "running" | "done" | "error";

/** One row in the run history list (`GET /api/runs`). */
export interface RunListItem {
  id: string;
  ticker: string;
  tradeDate: string;
  assetType: string;
  status: RunStatus;
  rating: string | null;
  selectedAnalysts: string | null;
  finalStateJson: string | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface RunsListResponse {
  runs: RunListItem[];
}

/**
 * Response of `GET /api/runs/:id`. A live (in-memory) run returns the lean
 * snapshot branch; a persisted run (history after restart) returns the row
 * plus a parsed `finalState`. Fields are optional because which branch applies
 * depends on whether the run is still in memory.
 */
export interface RunDetailResponse {
  id: string;
  status: RunStatus;
  rating?: string | null;
  error?: string | null;
  input?: AnalyzeInput;
  ticker?: string;
  tradeDate?: string;
  assetType?: string;
  selectedAnalysts?: string | null;
  finalStateJson?: string | null;
  finalState?: unknown;
  createdAt?: number;
  updatedAt?: number;
}

export interface CancelRunResponse {
  cancelled: boolean;
}
