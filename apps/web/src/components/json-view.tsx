// Generic, reusable fallback renderer for arbitrary JSON values, styled in the
// helm design language (key/value table). Used when a report object matches no
// known schema, so the user still gets readable structure instead of a raw code
// block. Pure & presentational; recursion is depth-capped for safety.
const MAX_DEPTH = 4;

function Primitive({ value }: { value: string | number | boolean | null }) {
  if (value === null)
    return <span className="font-mono text-helm-faint">null</span>;
  if (typeof value === "boolean")
    return <span className="font-mono text-helm-accent">{String(value)}</span>;
  if (typeof value === "number")
    return <span className="font-mono text-helm-text">{value}</span>;
  return <span className="whitespace-pre-wrap break-words text-helm-text">{value}</span>;
}

export function JsonView({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined) return <Primitive value={null} />;
  if (typeof value !== "object")
    return <Primitive value={value as string | number | boolean} />;

  if (depth >= MAX_DEPTH) {
    return (
      <span className="whitespace-pre-wrap break-words font-mono text-xs text-helm-muted">
        {JSON.stringify(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0)
      return <span className="font-mono text-helm-faint">[]</span>;
    return (
      <ol className="space-y-1 border-l border-helm-line pl-3">
        {value.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="pt-0.5 font-mono text-[10px] text-helm-faint">{i}</span>
            <div className="min-w-0 flex-1">
              <JsonView value={item} depth={depth + 1} />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0)
    return <span className="font-mono text-helm-faint">{"{}"}</span>;
  return (
    <dl className="space-y-1.5">
      {entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <dt className="font-mono text-[10px] uppercase tracking-wider text-helm-faint sm:w-40 sm:shrink-0 sm:pt-0.5">
            {k}
          </dt>
          <dd className="min-w-0 flex-1 text-sm">
            <JsonView value={v} depth={depth + 1} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
