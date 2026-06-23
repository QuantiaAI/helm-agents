import { describe, it, expect } from "vitest";
import { localeFromPath } from "../src/i18n";

// Regression: a direct page load at a non-default locale must start i18n in
// that locale (the URL's first segment), not fall back to English.
describe("localeFromPath", () => {
  it("extracts a valid locale from the first path segment", () => {
    expect(localeFromPath("/zh")).toBe("zh");
    expect(localeFromPath("/ja/analyze")).toBe("ja");
    expect(localeFromPath("/fr/runs/run_1")).toBe("fr");
  });

  it("falls back to the default locale for root or unknown segments", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("")).toBe("en");
    expect(localeFromPath("/xx/analyze")).toBe("en");
  });
});
