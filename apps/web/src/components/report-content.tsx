import type {
  ResearchPlan,
  TraderProposal,
  PortfolioDecision,
} from "@helm-agents/shared";
import { useTranslation } from "react-i18next";
import { Markdown as Md } from "@/components/markdown";
import { ratingColor } from "@/lib/rating-color";
import { ratingLabel } from "@/lib/rating-label";
import { DEBATE_COLORS, RATING_COLORS } from "@/lib/theme-tokens";
import { fieldAgentMeta } from "@/lib/agents";
import {
  asPlainObject,
  matchKnownReport,
  matchDecisionShape,
  matchSentimentShape,
  tryParseJsonObject,
  type DecisionShape,
  type SentimentShape,
  type KnownReportKind,
} from "@/lib/report-format";
import { JsonView } from "@/components/json-view";

function bandColor(band: string): string {
  // Bull/bear debate semantics from the design system (§05). Anything else
  // (Neutral / mixed) reads as a Hold-ish amber.
  if (band.includes("Bull")) return DEBATE_COLORS.bull;
  if (band.includes("Bear")) return DEBATE_COLORS.bear;
  return RATING_COLORS.Hold;
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    // Tinted chip: colored text on a faint fill of the same hue + matching
    // border. Works across the full rating scale (incl. light tiers like
    // Overweight/Hold) where a solid fill + white text would lose contrast.
    // inline-flex + self-center keeps it content-sized and vertically centered
    // inside a flex <Stats> row.
    <span
      className="inline-flex items-center justify-center self-center rounded-full border px-2.5 py-1 font-mono text-xs font-semibold leading-none"
      style={{ color, borderColor: `${color}66`, backgroundColor: `${color}1f` }}
    >
      {label}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-helm-base/60 px-3 py-1.5">
      <div className="font-mono text-[10px] uppercase tracking-wider text-helm-faint">
        {label}
      </div>
      <div className="text-sm font-medium text-helm-text">{value}</div>
    </div>
  );
}

function Stats({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}

function SentimentCard({ d }: { d: SentimentShape }) {
  const { t } = useTranslation("report");
  const { t: ts } = useTranslation("sentiment");
  // Score scale is not guaranteed (LLM sometimes emits a signed -100..100 value).
  // Show "X.X/10" only when it's a sane 0..10; otherwise show the raw number —
  // never fabricate a denominator. The band is the primary signal regardless.
  const inRange = d.overallScore != null && d.overallScore >= 0 && d.overallScore <= 10;
  return (
    <div className="space-y-3">
      <Stats>
        <Badge label={ratingLabel(d.overallBand, ts)} color={bandColor(d.overallBand)} />
        {d.overallScore != null && (
          <Stat
            label={t("score")}
            value={inRange ? `${d.overallScore.toFixed(1)}/10` : String(d.overallScore)}
          />
        )}
        {d.confidence && <Stat label={t("confidence")} value={ratingLabel(d.confidence, ts)} />}
      </Stats>
      <Md>{d.narrative}</Md>
    </div>
  );
}

function ResearchCard({ d }: { d: ResearchPlan }) {
  const { t } = useTranslation("rating");
  return (
    <div className="space-y-3">
      <Badge label={ratingLabel(d.recommendation, t)} color={ratingColor(d.recommendation)} />
      <Md>{d.rationale}</Md>
      {d.strategicActions.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-sm text-zinc-300">
          {d.strategicActions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TraderCard({ d }: { d: TraderProposal }) {
  const { t } = useTranslation("rating");
  const { t: tr } = useTranslation("report");
  return (
    <div className="space-y-3">
      <Stats>
        <Badge label={ratingLabel(d.action, t)} color={ratingColor(d.action)} />
        {d.entryPrice != null && <Stat label={tr("entry")} value={d.entryPrice} />}
        {d.stopLoss != null && <Stat label={tr("stopLoss")} value={d.stopLoss} />}
        {d.positionSizing && <Stat label={tr("sizing")} value={d.positionSizing} />}
      </Stats>
      <Md>{d.reasoning}</Md>
    </div>
  );
}

function PortfolioCard({ d }: { d: PortfolioDecision }) {
  const { t } = useTranslation("rating");
  const { t: tr } = useTranslation("report");
  return (
    <div className="space-y-3">
      <Stats>
        <Badge label={ratingLabel(d.rating, t)} color={ratingColor(d.rating)} />
        {d.priceTarget != null && <Stat label={tr("priceTarget")} value={d.priceTarget} />}
        {d.timeHorizon && <Stat label={tr("horizon")} value={d.timeHorizon} />}
      </Stats>
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{tr("executiveSummary")}</h4>
        <Md>{d.executiveSummary}</Md>
      </div>
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{tr("investmentThesis")}</h4>
        <Md>{d.investmentThesis}</Md>
      </div>
    </div>
  );
}

function DecisionCard({ d }: { d: DecisionShape }) {
  const { t } = useTranslation("rating");
  const { t: tr } = useTranslation("report");
  return (
    <div className="space-y-3">
      <Badge label={ratingLabel(d.rating, t)} color={ratingColor(d.rating)} />
      {d.analysis && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{tr("analysis")}</h4>
          <Md>{d.analysis}</Md>
        </div>
      )}
      {d.plan && (
        <div>
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">{tr("plan")}</h4>
          <Md>{d.plan}</Md>
        </div>
      )}
    </div>
  );
}

function Card({ kind, obj }: { kind: KnownReportKind; obj: Record<string, unknown> }) {
  switch (kind) {
    case "sentiment":
      return <SentimentCard d={obj as unknown as SentimentShape} />;
    case "research":
      return <ResearchCard d={obj as unknown as ResearchPlan} />;
    case "trader":
      return <TraderCard d={obj as unknown as TraderProposal} />;
    case "portfolio":
      return <PortfolioCard d={obj as unknown as PortfolioDecision} />;
  }
}

/**
 * Renders a report field. Priority: known-schema card → lenient sentiment card
 * → decision card → JSON key/value view → markdown. `data` is the backend's
 * structured object (if any); otherwise the markdown `body` is probed for being
 * a raw JSON object.
 */
export function ReportContent({
  title,
  field,
  body,
  data,
  accent,
}: {
  title?: string;
  field?: string;
  body?: string;
  data?: unknown;
  accent?: boolean;
}) {
  // Prefer the backend's structured object; otherwise probe the markdown body
  // for being a raw JSON object (stray-JSON fallback).
  const obj = asPlainObject(data) ?? (body ? tryParseJsonObject(body) : null);

  if (!obj && !body) return null;

  let inner: React.ReactNode;
  const kind = obj ? matchKnownReport(field, obj) : null;
  // Lenient sentiment recovery: when the strict schema rejected the object
  // (e.g. an out-of-range overallScore), still render the structured card.
  const sentiment = obj && !kind ? matchSentimentShape(field, obj) : null;
  const decision = obj && !sentiment ? matchDecisionShape(obj) : null;
  if (obj && kind) {
    inner = <Card kind={kind} obj={obj} />;
  } else if (sentiment) {
    inner = <SentimentCard d={sentiment} />;
  } else if (decision) {
    inner = <DecisionCard d={decision} />;
  } else if (obj) {
    // Unmatched object: render readable key/value structure (not a raw code
    // block). When this fires for a `data`-backed field it signals schema drift
    // between agent output and the frontend schema copy.
    inner = <JsonView value={obj} />;
  } else {
    inner = <Md>{body!}</Md>;
  }

  const meta = fieldAgentMeta(field);
  return (
    <div
      className={`rounded-md border p-4 ${
        accent
          ? "border-helm-accent/40 bg-helm-accent/5"
          : "border-zinc-800 bg-helm-base/40"
      }`}
    >
      {title && (
        <div className="mb-2 flex items-center gap-2">
          <span
            className="flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px] font-semibold"
            style={{ color: meta.color, borderColor: meta.color }}
            aria-hidden="true"
          >
            {meta.glyph}
          </span>
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-helm-muted">
            {title}
          </h3>
        </div>
      )}
      {inner}
    </div>
  );
}
