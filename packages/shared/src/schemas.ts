/**
 * Structured-output Zod schemas + markdown render functions for the four
 * structured agents (ports tradingagents/agents/schemas.py).
 */
import { z } from "zod";
import { PORTFOLIO_RATINGS, TRADER_ACTIONS } from "./rating.js";

const ratingEnum = z.enum(PORTFOLIO_RATINGS);
const traderEnum = z.enum(TRADER_ACTIONS);
const bandEnum = z.enum([
  "Very Bearish",
  "Bearish",
  "Somewhat Bearish",
  "Neutral",
  "Somewhat Bullish",
  "Bullish",
  "Very Bullish",
]);

export const SentimentReportSchema = z.object({
  overallBand: bandEnum,
  overallScore: z.number().min(0).max(10),
  confidence: z.enum(["low", "medium", "high"]),
  narrative: z.string(),
});
export type SentimentReport = z.infer<typeof SentimentReportSchema>;

export const ResearchPlanSchema = z.object({
  recommendation: ratingEnum,
  rationale: z.string(),
  strategicActions: z.array(z.string()),
});
export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

export const TraderProposalSchema = z.object({
  action: traderEnum,
  reasoning: z.string(),
  // Nullable: models legitimately emit `null` (not just omit) when there is no
  // entry/stop — e.g. a sell-to-reduce. `.optional()` alone rejects null and
  // dropped the whole proposal to raw text.
  entryPrice: z.number().positive().nullable().optional(),
  stopLoss: z.number().positive().nullable().optional(),
  positionSizing: z.string().optional(),
});
export type TraderProposal = z.infer<typeof TraderProposalSchema>;

export const PortfolioDecisionSchema = z.object({
  rating: ratingEnum,
  executiveSummary: z.string(),
  investmentThesis: z.string(),
  priceTarget: z.number().positive().nullable().optional(),
  timeHorizon: z.string().optional(),
});
export type PortfolioDecision = z.infer<typeof PortfolioDecisionSchema>;

export function renderResearchPlan(p: ResearchPlan): string {
  return [
    `Rating: **${p.recommendation}**`,
    "",
    "## Rationale",
    p.rationale,
    "",
    "## Strategic Actions",
    ...p.strategicActions.map((a) => `- ${a}`),
  ].join("\n");
}

export function renderTraderProposal(t: TraderProposal): string {
  const lines = [`Action: **${t.action}**`, "", "## Reasoning", t.reasoning];
  if (t.entryPrice != null) lines.push("", `Entry price: ${t.entryPrice}`);
  if (t.stopLoss != null) lines.push(`Stop loss: ${t.stopLoss}`);
  if (t.positionSizing) lines.push(`Position sizing: ${t.positionSizing}`);
  lines.push("", `FINAL TRANSACTION PROPOSAL: **${t.action.toUpperCase()}**`);
  return lines.join("\n");
}

export function renderPmDecision(d: PortfolioDecision): string {
  const lines = [
    `Rating: **${d.rating}**`,
    "",
    "## Executive Summary",
    d.executiveSummary,
    "",
    "## Investment Thesis",
    d.investmentThesis,
  ];
  if (d.priceTarget != null) lines.push("", `Price target: ${d.priceTarget}`);
  if (d.timeHorizon) lines.push(`Time horizon: ${d.timeHorizon}`);
  return lines.join("\n");
}

export function renderSentimentReport(s: SentimentReport): string {
  return [
    `| Band | Score | Confidence |`,
    `| --- | --- | --- |`,
    `| ${s.overallBand} | ${s.overallScore.toFixed(1)}/10 | ${s.confidence} |`,
    "",
    s.narrative,
  ].join("\n");
}
