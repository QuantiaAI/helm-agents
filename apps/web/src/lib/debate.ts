/**
 * Recover per-turn debates from the engine's `investmentDebateState.history`
 * / `riskDebateState.history` text blobs.
 *
 * The engine appends each turn as `${side} Analyst: ${content}` joined by "\n"
 * (packages/agents researchers + risk-mgmt). We split that back into turns so
 * the UI can render a bull/bear (and aggressive/conservative/neutral) chat —
 * staying true to the design's debate-bubble idea using the data we actually
 * have, rather than prose in one block.
 */

export type DebateSide = "Bull" | "Bear" | "Aggressive" | "Conservative" | "Neutral";

export interface DebateTurn {
  speaker: DebateSide;
  /** Single-glyph avatar symbol (design §05). */
  glyph: string;
  /** Speaker accent color. */
  color: string;
  /** Bubble alignment: bull↔bear alternate left/right; 3-way risk is all left. */
  side: "left" | "right";
  text: string;
}

const SPEAKERS: Record<DebateSide, Omit<DebateTurn, "text">> = {
  Bull: { speaker: "Bull", glyph: "多", color: "#00D68F", side: "left" },
  Bear: { speaker: "Bear", glyph: "空", color: "#F0496E", side: "right" },
  Aggressive: { speaker: "Aggressive", glyph: "激", color: "#F08A4B", side: "left" },
  Conservative: { speaker: "Conservative", glyph: "保", color: "#2DE2E6", side: "left" },
  Neutral: { speaker: "Neutral", glyph: "中", color: "#E0B43C", side: "left" },
};

// `${side} Analyst:` at line start begins a new turn; the rest of that line is
// the start of the body. Subsequent lines belong to the current turn's body
// until another marker line appears.
const TURN_START = /^(\w+) Analyst:\s*(.*)$/;

export function parseDebate(history: string): DebateTurn[] {
  const turns: DebateTurn[] = [];
  let current: DebateTurn | null = null;
  for (const line of history.split("\n")) {
    const m = line.match(TURN_START);
    const side = m?.[1] as DebateSide | undefined;
    const meta = side && side in SPEAKERS ? SPEAKERS[side] : undefined;
    if (meta && m) {
      current = { ...meta, text: m[2] ?? "" };
      turns.push(current);
    } else if (current) {
      current.text += (current.text ? "\n" : "") + line;
    }
  }
  return turns
    .map((t) => ({ ...t, text: t.text.trim() }))
    .filter((t) => t.text.length > 0);
}
