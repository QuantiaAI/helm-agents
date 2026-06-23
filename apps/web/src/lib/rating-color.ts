/** Shared rating → swatch color (used by rating cards and structured report cards). */
import { RATING_COLORS, type Rating } from "@/lib/theme-tokens";

// Re-export the canonical rating key type for callers (Analyze/RunDetail) so the
// 5-tier enum lives in one place — src/lib/theme-tokens.ts.
export type { Rating };

// Fallback for unknown / empty ratings: a muted slate from the design system's
// compass mark (#3A4760) — readable on panel surfaces without implying a bias.
const FALLBACK = "#3A4760";

export function ratingColor(rating?: string | null): string {
  return (rating && RATING_COLORS[rating as Rating]) || FALLBACK;
}
