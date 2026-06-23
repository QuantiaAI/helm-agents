import { describe, it, expect } from "vitest";
import {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_TO_LANG_NAME,
  isValidLocale,
  localeToLangName,
} from "../src/locale";

describe("locale constants", () => {
  it("defines exactly the 8 requested locales", () => {
    expect(LOCALES).toEqual(["en", "zh", "ja", "ko", "fr", "de", "es", "vi"]);
  });
  it("defaults to en", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
  it("maps every locale to a non-empty report-language name", () => {
    for (const l of LOCALES) {
      expect(LOCALE_TO_LANG_NAME[l]).toBeTruthy();
    }
    expect(LOCALE_TO_LANG_NAME.zh).toBe("Chinese");
    expect(LOCALE_TO_LANG_NAME.vi).toBe("Vietnamese");
  });
  it("validates locales", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("xx")).toBe(false);
  });
  it("falls back to English for unknown locales", () => {
    expect(localeToLangName("xx")).toBe("English");
  });
});
