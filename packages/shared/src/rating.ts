/**
 * Five-tier rating vocabulary + a deterministic heuristic parser (ports
 * tradingagents/agents/utils/rating.py + graph/signal_processing.py).
 *
 * The same scale (Buy / Overweight / Hold / Underweight / Sell) is shared by
 * the Research Manager, Portfolio Manager, signal processor and memory log.
 * Deterministic — no LLM call required.
 */

// Canonical, ordered 5-tier scale (most bullish → most bearish).
export const PORTFOLIO_RATINGS = [
  "Buy",
  "Overweight",
  "Hold",
  "Underweight",
  "Sell",
] as const;
export type PortfolioRating = (typeof PORTFOLIO_RATINGS)[number];

export const TRADER_ACTIONS = ["Buy", "Hold", "Sell"] as const;
export type TraderAction = (typeof TRADER_ACTIONS)[number];

// Higher rank = more bullish. Convenience for callers that need ordering.
export const RATING_RANK: Record<PortfolioRating, number> = {
  Buy: 2,
  Overweight: 1,
  Hold: 0,
  Underweight: -1,
  Sell: -2,
};

const RATING_SET: ReadonlySet<string> = new Set(
  PORTFOLIO_RATINGS.map((r) => r.toLowerCase()),
);

// Matches "Rating: X" / "rating - X" / "Rating: **X**" — tolerates markdown
// bold wrappers and a colon or hyphen separator (ports _RATING_LABEL_RE).
const RATING_LABEL_RE = /rating.*?[:\-][\s*]*(\w+)/gi;

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function stripEdges(word: string): string {
  return word.replace(/^[*:.,]+|[*:.,]+$/g, "");
}

/**
 * Heuristically extract a 5-tier rating from prose (ports rating.parse_rating).
 *
 * Two-pass strategy:
 *  1. Look for an explicit "Rating: X" label (tolerant of markdown bold),
 *     scanning line by line.
 *  2. Fall back to the first 5-tier rating word found anywhere in the text.
 *
 * Returns the rating, or `fallback` (default "Hold") when none is found.
 */
export function parseRating(
  text: string,
  fallback: PortfolioRating = "Hold",
): PortfolioRating {
  if (text) {
    const lines = text.split(/\r?\n/);

    // Pass 1: explicit "Rating: X" label.
    for (const line of lines) {
      RATING_LABEL_RE.lastIndex = 0;
      const m = RATING_LABEL_RE.exec(line);
      if (m && RATING_SET.has((m[1] ?? "").toLowerCase())) {
        return titleCase(m[1]!) as PortfolioRating;
      }
    }

    // Pass 2: first 5-tier rating word anywhere.
    for (const line of lines) {
      for (const word of line.toLowerCase().split(/\s+/)) {
        const clean = stripEdges(word);
        if (clean && RATING_SET.has(clean)) {
          return titleCase(clean) as PortfolioRating;
        }
      }
    }
  }
  return fallback;
}

/**
 * Read the 5-tier rating out of a Portfolio Manager decision. Alias kept for
 * parity with the original SignalProcessor.process_signal interface.
 */
export const processSignal = parseRating;
