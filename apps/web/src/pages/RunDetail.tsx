import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet, apiUrl } from "@/api/client";
import type { RunDetailResponse } from "@helm-agents/contracts";
import { ReportContent } from "@/components/report-content";
import { Debate } from "@/components/debate-bubbles";
import { ratingColor } from "@/lib/rating-color";
import { ratingLabel } from "@/lib/rating-label";
import { TokenizedStockCTA } from "@/components/TokenizedStockCTA";
import { DEFAULT_LOCALE } from "@/locale";
import { NotFound } from "./NotFound";

interface FinalState {
  companyOfInterest?: string;
  tradeDate?: string;
  marketReport?: string;
  sentimentReport?: string;
  newsReport?: string;
  fundamentalsReport?: string;
  investmentPlan?: string;
  traderInvestmentPlan?: string;
  finalTradeDecision?: string;
  investmentDebateState?: { history?: string };
  riskDebateState?: { history?: string };
  structured?: Record<string, unknown>;
}

export function RunDetail() {
  const { t } = useTranslation("detail");
  const { t: tAnalyze } = useTranslation("analyze");
  const { t: tCommon } = useTranslation("common");
  const { t: tRating } = useTranslation("rating");
  const { locale = DEFAULT_LOCALE, id = "" } = useParams();
  const [data, setData] = useState<RunDetailResponse | null | "missing">(null);

  useEffect(() => {
    apiGet<RunDetailResponse>(`/runs/${id}`)
      .then(setData)
      .catch(() => setData("missing"));
  }, [id]);

  if (data === null) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 text-zinc-500">
        {tCommon("loading")}
      </div>
    );
  }
  if (data === "missing") return <NotFound />;

  const finalState = (data.finalState ?? {}) as FinalState;
  const ticker = data.ticker ?? finalState.companyOfInterest ?? "";
  const tradeDate = data.tradeDate ?? finalState.tradeDate ?? "";
  const rating = data.rating ?? null;
  const color = ratingColor(rating);

  // Key numbers from the structured decision + trader proposal (design REPORT
  // rating banner): target price, entry/stop, time horizon.
  const decision = (finalState.structured?.finalTradeDecision ?? {}) as {
    priceTarget?: number | string;
    timeHorizon?: string;
  };
  const trader = (finalState.structured?.traderInvestmentPlan ?? {}) as {
    entryPrice?: number | string;
    stopLoss?: number | string;
  };
  const stats: { label: string; value: string }[] = [];
  if (decision.priceTarget != null)
    stats.push({ label: t("targetPrice"), value: String(decision.priceTarget) });
  if (trader.entryPrice != null || trader.stopLoss != null)
    stats.push({
      label: t("entryStop"),
      value: [trader.entryPrice, trader.stopLoss]
        .filter((v) => v != null)
        .map((v) => String(v))
        .join(" / "),
    });
  if (decision.timeHorizon) stats.push({ label: t("timeHorizon"), value: decision.timeHorizon });

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <Link
          to={`/${locale}/history`}
          className="text-sm text-zinc-400 hover:underline"
        >
          {t("back")}
        </Link>
        <a
          href={apiUrl(`/runs/${data.id}/report`)}
          className="rounded border border-helm-accent/40 px-3 py-1.5 font-mono text-xs text-helm-accent transition-colors hover:bg-helm-accent/10"
        >
          {t("download")}
        </a>
      </div>

      <div
        className="overflow-hidden rounded-md border border-zinc-800 bg-helm-panel"
        style={{ borderLeft: `4px solid ${color}` }}
      >
        <div className="p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-helm-faint">
            {t("runReport")}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: color, boxShadow: `0 0 10px ${color}` }}
            />
            <span
              className="font-mono text-3xl font-semibold tracking-wide"
              style={{ color }}
            >
              {rating ? ratingLabel(rating, tRating) : data.status}
            </span>
            <span className="font-mono text-sm text-helm-muted">
              {ticker} · {tradeDate}
              {data.assetType ? ` · ${data.assetType}` : ""}
            </span>
          </div>
          {stats.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t border-zinc-800 pt-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-[11px] text-helm-faint">{s.label}</div>
                  <div className="mt-0.5 font-mono text-lg font-semibold text-helm-text">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 font-mono text-[11px] text-helm-faint">
            {t("runId", { id: data.id })}
          </div>
        </div>
      </div>

      <TokenizedStockCTA variant="detail" ticker={ticker} />

      <div className="mt-6 space-y-6">
        <ReportContent
          title={t("finalDecision")}
          field="finalTradeDecision"
          body={finalState.finalTradeDecision}
          data={finalState.structured?.finalTradeDecision}
          accent
        />
        <div className="grid gap-4">
          <ReportContent
            title={t("investmentPlan")}
            field="investmentPlan"
            body={finalState.investmentPlan}
            data={finalState.structured?.investmentPlan}
          />
          <ReportContent
            title={t("traderProposal")}
            field="traderInvestmentPlan"
            body={finalState.traderInvestmentPlan}
            data={finalState.structured?.traderInvestmentPlan}
          />
        </div>
        <details
          className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
          open
        >
          <summary className="cursor-pointer font-medium">{t("reports")}</summary>
          <div className="mt-4 grid gap-4">
            <ReportContent
              title={tAnalyze("reportMarket")}
              field="marketReport"
              body={finalState.marketReport}
            />
            <ReportContent
              title={tAnalyze("reportSentiment")}
              field="sentimentReport"
              body={finalState.sentimentReport}
              data={finalState.structured?.sentimentReport}
            />
            <ReportContent
              title={tAnalyze("reportNews")}
              field="newsReport"
              body={finalState.newsReport}
            />
            <ReportContent
              title={tAnalyze("reportFundamentals")}
              field="fundamentalsReport"
              body={finalState.fundamentalsReport}
            />
          </div>
        </details>
        <details className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <summary className="cursor-pointer font-medium">{t("debates")}</summary>
          <div className="mt-4 space-y-4">
            <Debate
              title={t("debateInvest")}
              field="investmentDebate"
              body={finalState.investmentDebateState?.history}
            />
            <Debate
              title={t("debateRisk")}
              field="riskDebate"
              body={finalState.riskDebateState?.history}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
