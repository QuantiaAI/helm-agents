export const LOCALES = ["en", "zh", "ja", "ko", "fr", "de", "es", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE = "en";

/** URL locale -> report-language name passed to the engine's outputLanguage. */
export const LOCALE_TO_LANG_NAME: Record<Locale, string> = {
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  es: "Spanish",
  vi: "Vietnamese",
};

export function isValidLocale(x: string): x is Locale {
  return (LOCALES as readonly string[]).includes(x);
}

export function localeToLangName(locale: string): string {
  return isValidLocale(locale) ? LOCALE_TO_LANG_NAME[locale] : "English";
}
