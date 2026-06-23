import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "@/api/client";
import type { RunListItem, RunsListResponse } from "@helm-agents/contracts";
import { DEFAULT_LOCALE } from "@/locale";
import { ratingLabel } from "@/lib/rating-label";
import { ratingColor } from "@/lib/rating-color";
import { STATUS_COLORS } from "@/lib/theme-tokens";

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleString();
}

/** Localized, colored status for a run row (design HISTORY: 完成/出错). */
function runStatus(status: string, t: (k: string) => string): { label: string; color: string } {
  switch (status) {
    case "done":
      return { label: t("statusDone"), color: STATUS_COLORS.done };
    case "error":
      return { label: t("statusError"), color: STATUS_COLORS.error };
    case "running":
      return { label: t("statusRunning"), color: STATUS_COLORS.running };
    default:
      return { label: status, color: STATUS_COLORS.idle };
  }
}

export function History() {
  const { t } = useTranslation("history");
  const { t: tCommon } = useTranslation("common");
  const { t: tRating } = useTranslation("rating");
  const { locale = DEFAULT_LOCALE } = useParams();
  const [runs, setRuns] = useState<RunListItem[] | null>(null);

  useEffect(() => {
    apiGet<RunsListResponse>("/runs")
      .then((r) => setRuns(r.runs))
      .catch(() => setRuns([]));
  }, []);

  if (runs === null) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 text-zinc-500">
        {tCommon("loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="mt-1 text-zinc-400">{t("count", { n: runs.length })}</p>

      {runs.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-zinc-800 p-12 text-center text-zinc-600">
          {t("empty")}{" "}
          <Link to={`/${locale}/analyze`} className="text-helm-accent underline">
            {t("emptyCta")}
          </Link>{" "}
          {t("emptyHint")}
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-md border border-zinc-800 bg-helm-panel">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-800 text-left">
              <tr className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
                <th className="px-4 py-3 font-medium">{t("colTicker")}</th>
                <th className="px-4 py-3 font-medium">{t("colDate")}</th>
                <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                <th className="px-4 py-3 font-medium">{t("colRating")}</th>
                <th className="px-4 py-3 font-medium">{t("colRunAt")}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => {
                const st = runStatus(r.status, t);
                return (
                  <tr
                    key={r.id}
                    className="border-t border-zinc-800/60 transition-colors hover:bg-helm-elevated/40"
                  >
                    <td className="px-4 py-3 font-mono text-[14px] font-medium text-helm-text">
                      {r.ticker}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-helm-muted">
                      {r.tradeDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-[12.5px]"
                        style={{ color: st.color }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: st.color }}
                        />
                        {st.label}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 font-mono text-[12px] font-semibold"
                      style={
                        r.rating
                          ? { color: ratingColor(r.rating) }
                          : { color: STATUS_COLORS.idle }
                      }
                    >
                      {ratingLabel(r.rating, tRating)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-helm-faint">
                      {fmtDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/${locale}/runs/${r.id}`}
                        className="font-mono text-xs text-helm-accent hover:underline"
                      >
                        {t("view")}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
