/**
 * Localized display label for a canonical English rating/action enum value
 * (Buy / Overweight / Hold / Underweight / Sell, and the Buy/Hold/Sell trader
 * actions). The underlying value stays English everywhere — the data contract,
 * the rating-color map, and the structured-output enum the LLM must emit — so
 * only the rendered label is localized. Pass a `t` bound to the "rating"
 * namespace. Falls back to the raw value for unknown strings, "—" for empty.
 */
export function ratingLabel(
  rating: string | null | undefined,
  t: (key: string) => string,
): string {
  if (!rating) return "—";
  return t(rating) || rating;
}
