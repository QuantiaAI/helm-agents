import { describe, it, expect } from "vitest";
import { ratingLabel } from "../src/lib/rating-label";

// Stand-in for an i18next namespaced `t` (echoes the key when untranslated).
const t = (k: string) => (({ Sell: "卖出", Hold: "持有" }) as Record<string, string>)[k] ?? k;

describe("ratingLabel", () => {
  it("maps a known rating to its localized label", () => {
    expect(ratingLabel("Sell", t)).toBe("卖出");
    expect(ratingLabel("Hold", t)).toBe("持有");
  });

  it("falls back to the raw English value for an unknown string", () => {
    expect(ratingLabel("Overweight", t)).toBe("Overweight");
  });

  it("returns a dash for null/undefined/empty", () => {
    expect(ratingLabel(null, t)).toBe("—");
    expect(ratingLabel(undefined, t)).toBe("—");
    expect(ratingLabel("", t)).toBe("—");
  });
});
