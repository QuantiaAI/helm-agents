import type { AnalyzeInput } from "@helm-agents/core";
import { isValidLocale, localeToLangName } from "./locale.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_ANALYSTS = ["market", "sentiment", "news", "fundamentals"] as const;
type AnalystKey = (typeof VALID_ANALYSTS)[number];

export type ParseResult =
  | { ok: true; input: AnalyzeInput }
  | { ok: false; error: string };

export function parseAnalyzeBody(body: unknown): ParseResult {
  const b = (body ?? {}) as Record<string, unknown>;
  const ticker =
    typeof b.ticker === "string" ? b.ticker.trim().slice(0, 32) : "";
  const tradeDate = typeof b.tradeDate === "string" ? b.tradeDate : "";
  if (!ticker) return { ok: false, error: "ticker is required" };
  if (!DATE_RE.test(tradeDate)) {
    return { ok: false, error: "tradeDate must be YYYY-MM-DD" };
  }
  const selectedAnalysts = Array.isArray(b.selectedAnalysts)
    ? b.selectedAnalysts.filter(
        (a): a is AnalystKey =>
          typeof a === "string" &&
          (VALID_ANALYSTS as readonly string[]).includes(a),
      )
    : undefined;
  const assetType =
    b.assetType === "stock" || b.assetType === "crypto" ? b.assetType : undefined;

  const locale = typeof b.locale === "string" ? b.locale : "";
  const outputLanguage = isValidLocale(locale) ? localeToLangName(locale) : undefined;

  return {
    ok: true,
    input: {
      ticker,
      tradeDate,
      selectedAnalysts,
      assetType,
      ...(outputLanguage ? { outputLanguage } : {}),
    },
  };
}
