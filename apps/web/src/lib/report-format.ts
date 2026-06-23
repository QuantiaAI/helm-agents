/**
 * Pure helpers for classifying report content so the UI can pick a renderer:
 * a known-schema card, a generic JSON code block, or markdown. No React.
 */
import {
  SentimentReportSchema,
  ResearchPlanSchema,
  TraderProposalSchema,
  PortfolioDecisionSchema,
  extractFirstJsonObject,
} from "@helm-agents/shared";

export type KnownReportKind = "sentiment" | "research" | "trader" | "portfolio";

/** Minimal structural type so this module needn't depend on zod directly. */
interface SafeParser {
  safeParse: (v: unknown) => { success: boolean };
}

/** Report field name -> (structured kind, validating schema). */
const FIELD_SCHEMA: Record<string, { kind: KnownReportKind; schema: SafeParser }> = {
  sentimentReport: { kind: "sentiment", schema: SentimentReportSchema },
  investmentPlan: { kind: "research", schema: ResearchPlanSchema },
  traderInvestmentPlan: { kind: "trader", schema: TraderProposalSchema },
  finalTradeDecision: { kind: "portfolio", schema: PortfolioDecisionSchema },
};

/** Narrow to a plain object (not array, not primitive, not null); else null. */
export function asPlainObject(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
}

/**
 * Parse the first JSON object embedded in a string (tolerating trailing/extra
 * content). Returns it only for a plain object (not array, not primitive, not
 * null); otherwise null.
 */
export function tryParseJsonObject(s: string): Record<string, unknown> | null {
  // Lenient: recover the first JSON object even when the agent persisted extra
  // content — trailing prose or a duplicated second object (observed in real
  // runs). asPlainObject still rejects arrays/primitives.
  return asPlainObject(extractFirstJsonObject(s));
}

/**
 * If `obj` satisfies the schema mapped to `field`, return that kind; else null.
 * Field-driven so a market report that happens to look like a research plan
 * is not mis-rendered.
 */
export function matchKnownReport(
  field: string | undefined,
  obj: Record<string, unknown>,
): KnownReportKind | null {
  if (!field) return null;
  const entry = FIELD_SCHEMA[field];
  if (!entry) return null;
  return entry.schema.safeParse(obj).success ? entry.kind : null;
}

/** A recognized free-form decision shape (rating + prose). */
export interface DecisionShape {
  rating: string;
  analysis?: string;
  plan?: string;
}

const RATING_KEY = /^(rating|recommendation|action|decision)$/i;
const ANALYSIS_KEY = /analysis|rationale|reason|justification|summary|thesis|narrative/i;
const PLAN_KEY = /plan|actions|strategy|steps/i;

function firstString(obj: Record<string, unknown>, re: RegExp): string | undefined {
  for (const k of Object.keys(obj)) {
    if (re.test(k) && typeof obj[k] === "string" && (obj[k] as string).length > 0) {
      return obj[k] as string;
    }
  }
  return undefined;
}

/**
 * Loosely recognize a decision-like object (e.g. `{rating, analysis, plan}`)
 * that did NOT match a known schema. Requires a stance field and at least one
 * of analysis/plan; otherwise returns null so the caller falls back to a JSON
 * block or markdown. Pure.
 */
export function matchDecisionShape(obj: Record<string, unknown>): DecisionShape | null {
  const rating = firstString(obj, RATING_KEY);
  if (!rating) return null;
  const analysis = firstString(obj, ANALYSIS_KEY);
  const plan = firstString(obj, PLAN_KEY);
  if (!analysis && !plan) return null;
  return { rating, analysis, plan };
}

/** A sentiment report recognized structurally (band + narrative), tolerating an
 * out-of-range or differently-scaled `overallScore`. Field-gated to
 * `sentimentReport` so other reports are never mis-rendered. Pure. */
export interface SentimentShape {
  overallBand: string;
  narrative: string;
  overallScore?: number;
  confidence?: string;
}

export function matchSentimentShape(
  field: string | undefined,
  obj: Record<string, unknown>,
): SentimentShape | null {
  if (field !== "sentimentReport") return null;
  const { overallBand, narrative, overallScore, confidence } = obj;
  if (typeof overallBand !== "string" || overallBand.length === 0) return null;
  if (typeof narrative !== "string" || narrative.length === 0) return null;
  const shape: SentimentShape = { overallBand, narrative };
  if (typeof overallScore === "number" && Number.isFinite(overallScore)) {
    shape.overallScore = overallScore;
  }
  if (typeof confidence === "string" && confidence.length > 0) {
    shape.confidence = confidence;
  }
  return shape;
}
