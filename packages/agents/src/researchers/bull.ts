import { createResearcher } from "./shared.js";
import { BULL_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createBullResearcher(deps: AgentDeps) {
  return createResearcher(deps, { side: "Bull", system: BULL_SYSTEM });
}
