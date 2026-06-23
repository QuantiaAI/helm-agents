import { describe, it, expect } from "vitest";
import {
  parseRating,
  processSignal,
  PORTFOLIO_RATINGS,
  RATING_RANK,
} from "../src/rating.js";

describe("parseRating (faithful port of rating.parse_rating)", () => {
  it("extracts the explicit 'Rating:' label (tolerant of markdown bold)", () => {
    expect(parseRating("Rating: **Overweight**\nThesis: ...")).toBe(
      "Overweight",
    );
    expect(parseRating("Rating: Buy")).toBe("Buy");
    expect(parseRating("rating - sell")).toBe("Sell");
  });

  it("uses the first 'Rating:' line when several appear", () => {
    expect(
      parseRating("Rating: Hold\nFINAL TRANSACTION PROPOSAL: **SELL**"),
    ).toBe("Hold");
  });

  it("falls back to the first rating word anywhere (pass 2)", () => {
    expect(parseRating("We lean toward an Overweight stance here.")).toBe(
      "Overweight",
    );
    expect(parseRating("recommendation: sell now")).toBe("Sell");
  });

  it("returns the fallback when no rating word is present", () => {
    expect(parseRating("no decision here")).toBe("Hold");
    expect(parseRating("no decision here", "Buy")).toBe("Buy");
  });

  it("processSignal is an alias of parseRating", () => {
    expect(processSignal("Rating: Underweight")).toBe("Underweight");
    expect(processSignal("")).toBe("Hold");
  });
});

describe("rating metadata", () => {
  it("exposes all 5 tiers", () => {
    expect(PORTFOLIO_RATINGS).toEqual([
      "Buy",
      "Overweight",
      "Hold",
      "Underweight",
      "Sell",
    ]);
  });
  it("ranks Buy above Hold above Sell", () => {
    expect(RATING_RANK.Buy).toBeGreaterThan(RATING_RANK.Hold);
    expect(RATING_RANK.Sell).toBeLessThan(RATING_RANK.Hold);
  });
});
