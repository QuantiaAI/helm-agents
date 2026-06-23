// Design-system section label: a short cyan rule + IBM Plex Mono small-caps,
// optionally prefixed with an index (`01 / …`). Used to head every section so
// the page reads as a structured terminal document. (design system §01 / §06)
export function SectionLabel({
  children,
  index,
  className = "",
}: {
  children: React.ReactNode;
  index?: string | number;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="inline-block h-0.5 w-4 bg-helm-accent" aria-hidden="true" />
      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-helm-faint">
        {index != null && <span className="text-helm-faint">{index} / </span>}
        {children}
      </span>
    </div>
  );
}
