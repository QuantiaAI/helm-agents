import { createRiskDebator } from "./shared.js";
import { NEUTRAL_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createNeutralDebator(deps: AgentDeps) {
  return createRiskDebator(deps, {
    speaker: "Neutral",
    system: NEUTRAL_SYSTEM,
  });
}
