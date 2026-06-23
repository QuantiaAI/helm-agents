import { createRiskDebator } from "./shared.js";
import { CONSERVATIVE_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createConservativeDebator(deps: AgentDeps) {
  return createRiskDebator(deps, {
    speaker: "Conservative",
    system: CONSERVATIVE_SYSTEM,
  });
}
