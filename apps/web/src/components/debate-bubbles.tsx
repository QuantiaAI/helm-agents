import { Markdown as Md } from "@/components/markdown";
import { ReportContent } from "@/components/report-content";
import { parseDebate, type DebateTurn } from "@/lib/debate";

// One debate turn as a chat bubble (design REPORT screen): a glyph avatar +
// speaker tag + a tinted, asymmetric-corner bubble. Bull↔Bear alternate
// left/right; the 3-way risk debate is all left-aligned but color-coded.
function Bubble({ turn: t }: { turn: DebateTurn }) {
  const right = t.side === "right";
  return (
    <div className={`flex gap-2.5 ${right ? "flex-row-reverse" : ""}`}>
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-[12px] font-semibold"
        style={{ color: t.color, borderColor: t.color }}
        aria-hidden="true"
      >
        {t.glyph}
      </span>
      <div className="min-w-0 max-w-[82%]">
        <div
          className={`mb-1 font-mono text-[10px] uppercase tracking-wider ${right ? "text-right" : ""}`}
          style={{ color: t.color }}
        >
          {t.speaker}
        </div>
        <div
          className="rounded-md border px-3.5 py-2.5"
          style={{
            borderColor: `${t.color}3d`,
            backgroundColor: `${t.color}14`,
            borderRadius: right ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
          }}
        >
          <Md>{t.text}</Md>
        </div>
      </div>
    </div>
  );
}

/** A debate section: renders the history as bubbles when it parses into turns,
 *  otherwise falls back to a plain markdown card. */
export function Debate({
  title,
  body,
  field,
}: {
  title?: string;
  body?: string;
  field?: string;
}) {
  const turns = body ? parseDebate(body) : [];
  if (turns.length === 0) {
    return <ReportContent title={title} field={field} body={body} />;
  }
  return (
    <div className="rounded-md border border-zinc-800 bg-helm-panel p-4">
      {title && (
        <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-helm-muted">
          {title}
        </h3>
      )}
      <div className="space-y-3">
        {turns.map((t, i) => (
          <Bubble key={`${t.speaker}-${i}`} turn={t} />
        ))}
      </div>
    </div>
  );
}
