import { createResearcher } from "./shared.js";
import { BEAR_SYSTEM } from "../prompts.js";
import type { AgentDeps } from "../context.js";

export function createBearResearcher(deps: AgentDeps) {
  return createResearcher(deps, { side: "Bear", system: BEAR_SYSTEM });
}
