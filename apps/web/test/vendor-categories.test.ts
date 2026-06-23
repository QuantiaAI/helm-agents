import { describe, it, expect } from "vitest";
import {
  VENDOR_CATEGORIES,
  VENDOR_CATEGORY_LABEL_KEY,
} from "../src/lib/vendor-categories";
import en from "../messages/en.json";
import zh from "../messages/zh.json";
import ja from "../messages/ja.json";
import ko from "../messages/ko.json";
import fr from "../messages/fr.json";
import de from "../messages/de.json";
import es from "../messages/es.json";
import vi from "../messages/vi.json";

const CATALOGS = { en, zh, ja, ko, fr, de, es, vi };

describe("vendor category i18n", () => {
  it("every category maps to a non-empty label key", () => {
    for (const cat of VENDOR_CATEGORIES) {
      expect(VENDOR_CATEGORY_LABEL_KEY[cat]).toBeTruthy();
    }
  });

  for (const [locale, msgs] of Object.entries(CATALOGS)) {
    it(`${locale}: every vendor category label key exists under settings`, () => {
      const keys = new Set(Object.keys((msgs as { settings?: Record<string, unknown> }).settings ?? {}));
      for (const cat of VENDOR_CATEGORIES) {
        // The raw snake_case id must NOT be what we render — there must be a translated key.
        expect(keys.has(VENDOR_CATEGORY_LABEL_KEY[cat])).toBe(true);
      }
    });
  }
});
