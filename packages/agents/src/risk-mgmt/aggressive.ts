import { createRiskDebator } from "./shared.js";
import { AGGRESSIVE_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createAggressiveDebator(deps: AgentDeps) {
  return createRiskDebator(deps, {
    speaker: "Aggressive",
    system: AGGRESSIVE_SYSTEM,
  });
}
