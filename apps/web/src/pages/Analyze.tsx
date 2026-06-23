import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { classifyError, ERR_MSG_KEY, type ErrKind } from "@/lib/classify-error";
import { ReportContent } from "@/components/report-content";
import { Debate } from "@/components/debate-bubbles";
import { ratingColor } from "@/lib/rating-color";
import { ratingLabel } from "@/lib/rating-label";
import { STATUS_COLORS } from "@/lib/theme-tokens";
import { agentMeta } from "@/lib/agents";
import { apiGet, apiPost, streamRun } from "@/api/client";
import HelmMark from "@/components/HelmMark";
import type {
  CreateRunResponse,
  RunDetailResponse,
} from "@helm-agents/contracts";
import { DEFAULT_LOCALE } from "@/locale";

type Rating = "Buy" | "Overweight" | "Hold" | "Underweight" | "Sell";
type RunStatus = "idle" | "running" | "done" | "error";

const ANALYST_KEYS = ["market", "sentiment", "news", "fundamentals"] as const;
const ANALYST_LABEL: Record<
  (typeof ANALYST_KEYS)[number],
  "aMarket" | "aSentiment" | "aNews" | "aFundamentals"
> = {
  market: "aMarket",
  sentiment: "aSentiment",
  news: "aNews",
  fundamentals: "aFundamentals",
};

const PIPELINE: Array<{
  stage: "stageAnalysts" | "stageDebate" | "stageTrading" | "stageRisk" | "stagePortfolio";
  agents: string[];
}> = [
  { stage: "stageAnalysts", agents: ["Market Analyst", "Sentiment Analyst", "News Analyst", "Fundamentals Analyst"] },
  { stage: "stageDebate", agents: ["Bull Researcher", "Bear Researcher", "Research Manager"] },
  { stage: "stageTrading", agents: ["Trader"] },
  { stage: "stageRisk", agents: ["Aggressive Analyst", "Conservative Analyst", "Neutral Analyst"] },
  { stage: "stagePortfolio", agents: ["Portfolio Manager"] },
];

const ALL_AGENTS = PIPELINE.flatMap((s) => s.agents);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function Analyze() {
  const { t } = useTranslation("analyze");
  const { t: tCommon } = useTranslation("common");
  const { locale = DEFAULT_LOCALE } = useParams();
  const [ticker, setTicker] = useState("NVDA");
  const [tradeDate, setTradeDate] = useState(today());
  const [analysts, setAnalysts] = useState<string[]>([
    "market",
    "sentiment",
    "news",
    "fundamentals",
  ]);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [reports, setReports] = useState<Record<string, string>>({});
  const [structured, setStructured] = useState<Record<string, unknown>>({});
  const [investDebate, setInvestDebate] = useState("");
  const [riskDebate, setRiskDebate] = useState("");
  const [result, setResult] = useState<{
    rating: Rating;
    finalState: Record<string, unknown>;
  } | null>(null);
  const [error, setError] = useState<{ kind: ErrKind; detail: string } | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);

  function toggleAnalyst(key: string) {
    setAnalysts((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
    );
  }

  /** Apply a completed run's final state to the UI (used by stream done,
   *  resume, and recovery). */
  function hydrateDone(fs: Record<string, unknown>, rating?: string) {
    setReports((prev) => ({ ...prev, ...extractStrings(fs) }));
    if (fs.structured && typeof fs.structured === "object") {
      setStructured((prev) => ({
        ...prev,
        ...(fs.structured as Record<string, unknown>),
      }));
    }
    const ids = fs.investmentDebateState as { history?: string } | undefined;
    const rds = fs.riskDebateState as { history?: string } | undefined;
    if (ids?.history) setInvestDebate(ids.history);
    if (rds?.history) setRiskDebate(rds.history);
    setCompleted(new Set(ALL_AGENTS));
    setResult({ rating: (rating as Rating) ?? "Hold", finalState: fs });
    setStatus("done");
  }

  function showRunError(detail: string) {
    setError({ kind: classifyError(detail), detail });
    setStatus("error");
  }

  /** Shared event consumer. Returns true if it observed the terminal `done`
   *  event; throws on an engine `error` event or a stream/connection failure. */
  async function consumeStream(runId: string, ctrl: AbortController): Promise<boolean> {
    let sawDone = false;
    for await (const ev of streamRun(runId, ctrl.signal)) {
      if (ev.type === "nodeEnd" && ev.node) {
        setCompleted((prev) => new Set(prev).add(ev.node));
        if (ev.patch) {
          setReports((prev) => ({ ...prev, ...extractStrings(ev.patch) }));
          if (ev.patch.structured && typeof ev.patch.structured === "object") {
            setStructured((prev) => ({
              ...prev,
              ...(ev.patch.structured as Record<string, unknown>),
            }));
          }
          const ids = ev.patch.investmentDebateState as { history?: string } | undefined;
          const rds = ev.patch.riskDebateState as { history?: string } | undefined;
          if (ids?.history) setInvestDebate(ids.history);
          if (rds?.history) setRiskDebate(rds.history);
        }
      } else if (ev.type === "done") {
        hydrateDone(
          (ev.finalState as Record<string, unknown>) ?? {},
          ev.rating,
        );
        sawDone = true;
      } else if (ev.type === "error") {
        throw new Error(ev.message ?? "unknown error");
      }
    }
    return sawDone;
  }

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

  /** GET the run's true state; null if the API itself is unreachable. */
  async function loadStatus(runId: string): Promise<RunDetailResponse | null> {
    try {
      return await apiGet<RunDetailResponse>(`/runs/${runId}`);
    } catch {
      return null;
    }
  }

  /** Poll run status until it terminates (fallback when the live stream can't be
   *  held). Keeps the UI truthful without a misleading "provider" error. */
  async function pollUntilTerminal(runId: string) {
    for (let i = 0; i < 60; i++) {
      await sleep(3000);
      const d = await loadStatus(runId);
      if (!d) continue;
      if (d.status === "done") {
        hydrateDone((d.finalState ?? {}) as Record<string, unknown>, d.rating ?? undefined);
        return;
      }
      if (d.status === "error") {
        showRunError(d.error ?? "unknown error");
        return;
      }
    }
  }

  /**
   * Follow a run's stream, recovering from a dropped connection: a stream blip
   * does NOT mean the run failed. On any non-abort interruption (or a clean
   * stream end without a terminal), verify the run's true state — done → render
   * it, error → show the real error, still-running → reconnect (then poll).
   */
  async function streamWithRecovery(runId: string) {
    const MAX_RECONNECT = 3;
    let lastDetail = "network error";
    for (let attempt = 0; ; attempt++) {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        if (await consumeStream(runId, ctrl)) return; // saw `done`
      } catch (e) {
        if (ctrl.signal.aborted) {
          setStatus("idle");
          return;
        }
        lastDetail = e instanceof Error ? e.message : String(e);
      }
      // Stream ended without a terminal in hand → verify the real run state.
      const d = await loadStatus(runId);
      if (!d) {
        showRunError(lastDetail); // API genuinely unreachable
        return;
      }
      if (d.status === "done") {
        hydrateDone((d.finalState ?? {}) as Record<string, unknown>, d.rating ?? undefined);
        return;
      }
      if (d.status === "error") {
        showRunError(d.error ?? lastDetail);
        return;
      }
      // Still running — the stream dropped but the run is alive. Reconnect a few
      // times, then fall back to polling. Never show a "can't reach provider".
      if (attempt < MAX_RECONNECT) {
        await sleep(1000);
        continue;
      }
      await pollUntilTerminal(runId);
      return;
    }
  }

  async function run() {
    setStatus("running");
    setError(null);
    setResult(null);
    setCompleted(new Set());
    setReports({});
    setStructured({});
    setInvestDebate("");
    setRiskDebate("");
    runIdRef.current = null;

    let runId: string;
    try {
      const created = await apiPost<CreateRunResponse>("/runs", {
        ticker,
        tradeDate,
        selectedAnalysts: analysts.length ? analysts : undefined,
        locale,
      });
      runId = created.runId;
      if (!runId) throw new Error("no runId");
    } catch (e) {
      // Failure to even create the run — a real API/provider/config error.
      showRunError(e instanceof Error ? e.message : String(e));
      return;
    }

    runIdRef.current = runId;
    const sp = new URLSearchParams(window.location.search);
    sp.set("run", runId);
    window.history.replaceState(null, "", `?${sp.toString()}`);

    await streamWithRecovery(runId);
  }

  async function cancel() {
    const id = runIdRef.current;
    abortRef.current?.abort();
    if (id) {
      try {
        await apiPost(`/runs/${id}/cancel`);
      } catch {
        /* best-effort; the local abort already stops the UI */
      }
    }
    setStatus("idle");
  }

  // On mount: if the URL has ?run=xxx, resume that run (survives refresh).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const existingRun = params.get("run");
    if (!existingRun) return;
    void resumeRun(existingRun);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resumeRun(runId: string) {
    let data: RunDetailResponse;
    try {
      data = await apiGet<RunDetailResponse>(`/runs/${runId}`);
    } catch {
      // Run not found (server restarted) — clear URL, back to empty state.
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }
    runIdRef.current = runId;

    if (data.status === "running") {
      setStatus("running");
      await streamWithRecovery(runId);
    } else if (data.status === "done") {
      hydrateDone(
        (data.finalState ?? {}) as Record<string, unknown>,
        data.rating ?? undefined,
      );
    } else if (data.status === "error") {
      showRunError(data.error ?? "unknown error");
    }
  }

  function agentState(name: string): "pending" | "running" | "done" {
    if (completed.has(name)) return "done";
    if (status !== "running") return "pending";
    const idx = ALL_AGENTS.indexOf(name);
    const priorDone = ALL_AGENTS.slice(0, idx).every((a) => completed.has(a));
    return priorDone ? "running" : "pending";
  }

  const active = status === "running";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-2.5">
        <div>
          <h1 className="text-2xl font-bold text-helm-text">{t("title")}</h1>
          <p className="mt-1 text-[13px] text-helm-muted">{t("subtitle")}</p>
        </div>
        <StatusPill
          status={status}
          label={
            status === "idle"
              ? t("statusIdle")
              : status === "running"
                ? t("statusRunning")
                : status === "done"
                  ? t("statusDone")
                  : ""
          }
          progress={completed.size}
          total={ALL_AGENTS.length}
        />
      </div>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[340px_1fr]">
        <section className="rounded-md border border-zinc-800 bg-helm-panel p-5 lg:sticky lg:top-[78px]">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
              {t("ticker")}
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded border border-zinc-700 bg-helm-base px-3 py-2.5 transition-colors focus-within:border-helm-accent">
              <span className="font-mono text-sm text-helm-faint">$</span>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                className="flex-1 bg-transparent font-mono text-[15px] tracking-wide text-helm-text outline-none"
                disabled={active}
              />
            </div>
          </label>
          <label className="mt-4 block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
              {t("tradeDate")}
            </span>
            <div className="mt-1.5 flex items-center gap-2 rounded border border-zinc-700 bg-helm-base px-3 py-2.5 transition-colors focus-within:border-helm-accent">
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm text-helm-text outline-none [color-scheme:dark]"
                disabled={active}
              />
            </div>
          </label>
          <div className="mt-4">
            <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
              {t("analysts")}
            </span>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {ANALYST_KEYS.map((key) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center justify-center rounded border bg-helm-base px-2 py-2 text-center text-xs transition-colors has-[:checked]:border-helm-accent/50 has-[:checked]:bg-helm-accent/12 has-[:checked]:text-helm-accent has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-helm-accent ${
                    active
                      ? "pointer-events-none border-zinc-700 text-helm-muted opacity-60"
                      : "border-zinc-700 text-helm-muted"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={analysts.includes(key)}
                    onChange={() => toggleAnalyst(key)}
                    disabled={active}
                  />
                  {t(ANALYST_LABEL[key])}
                </label>
              ))}
            </div>
          </div>
          {active ? (
            <button
              onClick={cancel}
              className="mt-6 w-full rounded border border-helm-danger/50 bg-helm-danger/10 px-4 py-2.5 font-sans font-semibold text-helm-danger transition-colors hover:bg-helm-danger/20"
            >
              ■ {tCommon("cancel")}
            </button>
          ) : (
            <button
              onClick={run}
              disabled={analysts.length === 0}
              className="mt-6 w-full rounded bg-helm-accent px-4 py-3 font-sans font-bold text-helm-base transition-colors hover:bg-helm-accentHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              ▶ {status === "done" ? t("runAgain") : tCommon("run")}
            </button>
          )}
          {error && (
            <div className="mt-3 rounded border border-helm-danger/40 bg-helm-danger/10 p-3 text-sm text-helm-danger">
              <p>{t(ERR_MSG_KEY[error.kind])}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Link
                  to={`/${locale}/settings`}
                  className="rounded bg-helm-accent px-3 py-1.5 font-medium text-helm-base hover:bg-helm-accentHover"
                >
                  {t("openSettings")}
                </Link>
                <details className="text-xs text-helm-danger/80">
                  <summary className="cursor-pointer hover:text-helm-danger">
                    {t("errDetail")}
                  </summary>
                  <pre className="mt-1 whitespace-pre-wrap break-words font-sans">
                    {error.detail}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </section>

        <section className="min-w-0">
          {status === "idle" && !result && (
            <EmptyState label={t("empty")} hint={t("emptyHint")} />
          )}
          {(active || status === "done" || status === "error") && (
            <div className="space-y-5">
              <Timeline agentState={agentState} stages={t} agentLabel={t} />

              {/* 01 · analyst reports */}
              {(
                reports.marketReport ||
                reports.sentimentReport ||
                reports.newsReport ||
                reports.fundamentalsReport
              ) && (
                <div className="space-y-4">
                  <StageDivider n="01" label={t("stageAnalysts")} />
                  <div className="grid gap-4">
                    <ReportContent
                      title={t("reportMarket")}
                      field="marketReport"
                      body={reports.marketReport}
                    />
                    <ReportContent
                      title={t("reportSentiment")}
                      field="sentimentReport"
                      body={reports.sentimentReport}
                      data={structured.sentimentReport}
                    />
                    <ReportContent
                      title={t("reportNews")}
                      field="newsReport"
                      body={reports.newsReport}
                    />
                    <ReportContent
                      title={t("reportFundamentals")}
                      field="fundamentalsReport"
                      body={reports.fundamentalsReport}
                    />
                  </div>
                </div>
              )}

              {/* 02 · investment debate */}
              {(reports.investmentPlan || investDebate) && (
                <div className="space-y-4">
                  <StageDivider n="02" label={t("stageDebate")} />
                  {reports.investmentPlan && (
                    <ReportContent
                      title={t("investmentPlan")}
                      field="investmentPlan"
                      body={reports.investmentPlan}
                      data={structured.investmentPlan}
                    />
                  )}
                  {investDebate && (
                    <Debate
                      title={t("debateInvest")}
                      field="investmentDebate"
                      body={investDebate}
                    />
                  )}
                </div>
              )}

              {/* 03 · trader proposal */}
              {reports.traderInvestmentPlan && (
                <div className="space-y-4">
                  <StageDivider n="03" label={t("stageTrading")} />
                  <ReportContent
                    title={t("traderProposal")}
                    field="traderInvestmentPlan"
                    body={reports.traderInvestmentPlan}
                    data={structured.traderInvestmentPlan}
                  />
                </div>
              )}

              {/* 04 · risk debate */}
              {riskDebate && (
                <div className="space-y-4">
                  <StageDivider n="04" label={t("stageRisk")} />
                  <Debate title={t("debateRisk")} field="riskDebate" body={riskDebate} />
                </div>
              )}

              {/* 05 · final decision */}
              {result && (
                <div className="space-y-4">
                  <StageDivider n="05" label={t("stagePortfolio")} />
                  <DecisionHero
                    rating={result.rating}
                    ticker={ticker}
                    date={tradeDate}
                    decision={structured.finalTradeDecision}
                    trader={structured.traderInvestmentPlan}
                  />
                  {reports.finalTradeDecision && (
                    <ReportContent
                      field="finalTradeDecision"
                      body={reports.finalTradeDecision}
                      data={structured.finalTradeDecision}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function extractStrings(patch: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of [
    "marketReport",
    "sentimentReport",
    "newsReport",
    "fundamentalsReport",
    "investmentPlan",
    "traderInvestmentPlan",
    "finalTradeDecision",
  ]) {
    if (typeof patch[k] === "string") out[k] = patch[k] as string;
  }
  return out;
}

function StatusPill({
  status,
  label,
  progress,
  total,
}: {
  status: RunStatus;
  label: string;
  progress: number;
  total: number;
}) {
  const color = STATUS_COLORS[status];
  return (
    <div
      className="flex items-center gap-2 font-mono text-xs"
      style={{ color }}
      aria-live="polite"
    >
      <span
        className={`h-2 w-2 rounded-full ${status === "running" ? "animate-ha-pulse" : ""}`}
        style={{
          background: color,
          boxShadow: status === "idle" ? "none" : `0 0 8px ${color}`,
        }}
      />
      {label && <span>{label}</span>}
      <span className="text-helm-faint">
        {progress}
        <span className="text-helm-faint/60">/{total}</span>
      </span>
    </div>
  );
}

function EmptyState({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-4 rounded-md border border-dashed border-zinc-800 bg-helm-panel/40 p-8 text-center">
      <HelmMark className="h-14 w-14 text-zinc-700" />
      <div>
        <p className="text-base text-helm-muted">{label}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-helm-faint">
          {hint}
        </p>
      </div>
    </div>
  );
}

function Timeline({
  agentState,
  stages,
  agentLabel,
}: {
  agentState: (name: string) => "pending" | "running" | "done";
  stages: (k: string) => string;
  agentLabel: (k: string) => string;
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-helm-panel p-5">
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-helm-faint">
        {stages("timeline")}
      </h2>
      <ol className="space-y-4">
        {PIPELINE.map((stage) => (
          <li key={stage.stage}>
            <div className="font-mono text-xs text-helm-accent">
              {stages(stage.stage)}
            </div>
            <ul className="mt-1.5 flex flex-wrap gap-2">
              {stage.agents.map((agent) => {
                const s = agentState(agent);
                const meta = agentMeta(agent);
                return (
                  <li
                    key={agent}
                    className="flex items-center gap-2 rounded-full border border-zinc-800 bg-helm-base/50 py-1 pl-1 pr-3"
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] font-semibold"
                      style={{
                        color: meta.color,
                        borderColor: meta.color,
                        opacity: s === "pending" ? 0.4 : 1,
                      }}
                      aria-hidden="true"
                    >
                      {meta.glyph}
                    </span>
                    <span
                      className={
                        s === "pending" ? "text-[12px] text-helm-faint" : "text-[12px] text-helm-text"
                      }
                    >
                      {agentLabel(`agent.${agent}`)}
                    </span>
                    {s === "done" && (
                      <span className="font-mono text-[11px] text-helm-success" aria-hidden="true">
                        ✓
                      </span>
                    )}
                    {s === "running" && (
                      <span
                        className="animate-ha-pulse font-mono text-[11px] text-helm-accent"
                        aria-hidden="true"
                      >
                        ⠼
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

function StageDivider({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="rounded bg-helm-accent px-2 py-1 font-mono text-[11px] font-semibold text-helm-base">
        {n}
      </span>
      <span className="text-[15px] font-bold text-helm-text">{label}</span>
      <span className="h-px flex-1 bg-zinc-800" />
    </div>
  );
}

function DecisionHero({
  rating,
  ticker,
  date,
  decision,
  trader,
}: {
  rating: Rating;
  ticker: string;
  date: string;
  decision: unknown;
  trader: unknown;
}) {
  const { t } = useTranslation("analyze");
  const { t: tRating } = useTranslation("rating");
  const { t: tDetail } = useTranslation("detail");
  const color = ratingColor(rating);
  const d = (decision ?? {}) as { priceTarget?: number | string; timeHorizon?: string };
  const tr = (trader ?? {}) as { entryPrice?: number | string; stopLoss?: number | string };
  const stats: { label: string; value: string }[] = [];
  if (d.priceTarget != null)
    stats.push({ label: tDetail("targetPrice"), value: String(d.priceTarget) });
  if (tr.entryPrice != null || tr.stopLoss != null)
    stats.push({
      label: tDetail("entryStop"),
      value: [tr.entryPrice, tr.stopLoss]
        .filter((v) => v != null)
        .map((v) => String(v))
        .join(" / "),
    });
  if (d.timeHorizon) stats.push({ label: tDetail("timeHorizon"), value: d.timeHorizon });
  return (
    <div
      className="rounded-md border p-5"
      style={{
        borderColor: `${color}66`,
        backgroundImage: `linear-gradient(135deg, ${color}24, rgba(45,226,230,0.05))`,
      }}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-helm-muted">
        {t("finalDecision")} · FINAL CALL
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: color, boxShadow: `0 0 12px ${color}` }}
        />
        <span
          className="font-mono text-3xl font-semibold tracking-wide"
          style={{ color }}
        >
          {ratingLabel(rating, tRating)}
        </span>
        <span className="font-mono text-sm text-helm-muted">
          {ticker} · {date}
        </span>
      </div>
      {stats.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
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
    </div>
  );
}
