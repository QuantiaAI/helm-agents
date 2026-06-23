// Re-export the engine's domain types as the wire contract (type-only — erased
// at compile, so no runtime dependency leaks into the browser bundle).
export type { AnalyzeInput, AnalyzeResult, RunEvent } from "@helm-agents/core";

/** Response of `POST /api/runs` — create a streamed run. */
export interface CreateRunResponse {
  runId: string;
}
