import { describe, it, expect } from "vitest";
import { ratingColor } from "../src/lib/rating-color";

// Black-box contract: ratingColor() must return the design-system §03 5-tier
// palette (single source of truth = src/lib/theme-tokens.ts). Hard-coded here
// so the test independently pins the public contract, not the implementation.
describe("ratingColor — design-system 5-tier palette", () => {
  it("maps each canonical rating to its design color", () => {
    expect(ratingColor("Buy")).toBe("#00D68F");
    expect(ratingColor("Overweight")).toBe("#7BD88F");
    expect(ratingColor("Hold")).toBe("#E0B43C");
    expect(ratingColor("Underweight")).toBe("#F08A4B");
    expect(ratingColor("Sell")).toBe("#F0496E");
  });

  it("falls back to a neutral swatch for unknown / empty ratings", () => {
    expect(ratingColor(undefined)).toBe("#3A4760");
    expect(ratingColor(null)).toBe("#3A4760");
    expect(ratingColor("")).toBe("#3A4760");
    expect(ratingColor("NotARating")).toBe("#3A4760");
  });
});
