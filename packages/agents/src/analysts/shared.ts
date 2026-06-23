/**
 * Shared data-analyst factory. Each analyst declares the data calls it needs
 * (as a function of state) and the report field it writes. Phase 1 fetches the
 * data inline and injects it into the prompt — equivalent output to the
 * original tool-calling ReAct loop, with full tool-calling fidelity deferred to
 * Phase 2.
 */
import type { z } from "zod";
import type { DataMethod } from "@helm-agents/dataflows";
import {
  languageInstruction,
  instrumentContext,
  type AgentDeps,
  type AgentNode,
} from "../context.js";
import type { AgentState } from "@helm-agents/shared";

export interface DataCall {
  method: DataMethod;
  args: unknown[];
  label: string;
}

type ReportField =
  | "marketReport"
  | "sentimentReport"
  | "newsReport"
  | "fundamentalsReport";

export function createDataAnalyst(
  deps: AgentDeps,
  opts: {
    system: string;
    reportField: ReportField;
    role: string;
    calls: (state: AgentState) => DataCall[];
    /** When set, request structured output and render it into the report;
     *  falls back to free text if parsing fails (ports structured_or_freetext). */
    structured?: z.ZodType;
    render?: (parsed: unknown) => string;
  },
): AgentNode {
  return async (state) => {
    const sections: string[] = [];
    for (const call of opts.calls(state)) {
      const data = await deps.route(call.method, ...call.args);
      sections.push(`### ${call.label}\n${data ?? "(unavailable)"}`);
    }
    const res = await deps.quick.invoke({
      system: opts.system + languageInstruction(deps.config),
      messages: [
        {
          role: "user",
          content: `${instrumentContext(state)}\n\n# Data\n\n${sections.join("\n\n")}`,
        },
      ],
      ...(opts.structured ? { structured: opts.structured } : {}),
    });
    const hasStructured = opts.structured && opts.render && res.parsed != null;
    const report = hasStructured ? opts.render!(res.parsed) : res.content;
    return {
      [opts.reportField]: report,
      sender: opts.role,
      ...(hasStructured ? { structured: { [opts.reportField]: res.parsed } } : {}),
    } as Partial<AgentState>;
  };
}
