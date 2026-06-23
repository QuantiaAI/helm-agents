import { createDataAnalyst } from "./shared.js";
import { SENTIMENT_ANALYST_SYSTEM } from "../prompts.js";
import { SentimentReportSchema, renderSentimentReport, type SentimentReport } from "@helm-agents/shared";
import type { AgentDeps } from "../context.js";

export function createSentimentAnalyst(deps: AgentDeps) {
  return createDataAnalyst(deps, {
    system: SENTIMENT_ANALYST_SYSTEM,
    reportField: "sentimentReport",
    role: "Sentiment Analyst",
    structured: SentimentReportSchema,
    render: (p) => renderSentimentReport(p as SentimentReport),
    calls: (state) => [
      {
        method: "getNews",
        args: [state.companyOfInterest, state.tradeDate],
        label: "News tone",
      },
      {
        method: "getSocialSentiment",
        args: [state.companyOfInterest],
        label: "Social sentiment (Reddit + StockTwits)",
      },
    ],
  });
}
