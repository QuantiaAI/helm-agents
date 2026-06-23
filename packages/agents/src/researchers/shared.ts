/**
 * Bull/Bear debate researcher factory (ports
 * tradingagents/agents/researchers/{bull,bear}_researcher.py).
 */
import {
  assetLabel,
  instrumentContext,
  languageInstruction,
  type AgentDeps,
  type AgentNode,
} from "../context.js";

export function createResearcher(
  deps: AgentDeps,
  opts: {
    side: "Bull" | "Bear";
    system: (target: string) => string;
  },
): AgentNode {
  return async (state) => {
    const target = assetLabel(state);
    const ds = state.investmentDebateState;

    const reports = [
      `Market research report: ${state.marketReport}`,
      `Sentiment report: ${state.sentimentReport}`,
      `Latest world affairs news: ${state.newsReport}`,
      `Fundamentals report: ${state.fundamentalsReport}`,
    ].join("\n\n");

    const res = await deps.quick.invoke({
      system: opts.system(target) + languageInstruction(deps.config),
      messages: [
        {
          role: "user",
          content: `${instrumentContext(state)}\n\n${reports}\n\nConversation history of the debate:\n${ds.history}\n\nLast opponent argument:\n${ds.currentResponse}`,
        },
      ],
    });

    const argument = `${opts.side} Analyst: ${res.content}`;
    const bullHistory =
      opts.side === "Bull" ? `${ds.bullHistory}\n${argument}` : ds.bullHistory;
    const bearHistory =
      opts.side === "Bear" ? `${ds.bearHistory}\n${argument}` : ds.bearHistory;

    return {
      investmentDebateState: {
        ...ds,
        history: `${ds.history}\n${argument}`,
        bullHistory,
        bearHistory,
        currentResponse: argument,
        count: ds.count + 1,
      },
    };
  };
}
