// The HelmAgents mark — design system §01, **方向 C · 群体智能** (collective
// intelligence): a central hub node with six satellite nodes linked by faint
// lines — a hub-and-spoke constellation that echoes the 13 agents collaborating
// around a single decision. Strokes/fills use `currentColor` so the caller tints
// it (brand cyan by default).
export default function HelmMark({ className }: { className?: string }) {
  // Six satellite positions on a circle (every 60°), hub at center.
  const nodes = [
    { x: 50, y: 16 },
    { x: 79, y: 33 },
    { x: 79, y: 67 },
    { x: 50, y: 84 },
    { x: 21, y: 67 },
    { x: 21, y: 33 },
  ];
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* faint outer ring */}
      <circle cx="50" cy="50" r="37" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      {/* spokes: hub → each satellite */}
      <g stroke="currentColor" strokeWidth="2" opacity="0.5">
        {nodes.map((n) => (
          <line key={`l-${n.x}-${n.y}`} x1="50" y1="50" x2={n.x} y2={n.y} />
        ))}
      </g>
      {/* satellites */}
      <g fill="currentColor">
        {nodes.map((n) => (
          <circle key={`n-${n.x}-${n.y}`} cx={n.x} cy={n.y} r="4" />
        ))}
      </g>
      {/* hub */}
      <circle cx="50" cy="50" r="9" fill="currentColor" />
      <circle cx="50" cy="50" r="9" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4" />
    </svg>
  );
}
