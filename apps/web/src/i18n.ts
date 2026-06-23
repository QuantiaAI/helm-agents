import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LOCALE, isValidLocale } from "./locale";
import en from "../messages/en.json";
import zh from "../messages/zh.json";
import ja from "../messages/ja.json";
import ko from "../messages/ko.json";
import fr from "../messages/fr.json";
import de from "../messages/de.json";
import es from "../messages/es.json";
import vi from "../messages/vi.json";

// Each message file is `{ namespace: { key: value } }`, which maps directly to
// i18next's resources[lng][ns] shape — so the 8 next-intl message files are
// reused unchanged. ICU `{n}` placeholders work via the custom interpolation
// delimiters below (the files use only simple interpolation, no plural/select).
const resources = { en, zh, ja, ko, fr, de, es, vi };

/** First path segment as a locale, else the default. Pure — unit-testable. */
export function localeFromPath(pathname: string): string {
  const seg = pathname.split("/")[1] ?? "";
  return isValidLocale(seg) ? seg : DEFAULT_LOCALE;
}

// Start in the URL's locale on a fresh page load. init() is async; if we always
// started at DEFAULT_LOCALE, its resolution could clobber the Layout effect's
// changeLanguage() back to English on a direct load of e.g. /zh.
function initialLng(): string {
  return typeof window !== "undefined"
    ? localeFromPath(window.location.pathname)
    : DEFAULT_LOCALE;
}

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLng(),
  fallbackLng: DEFAULT_LOCALE,
  ns: Object.keys(en),
  defaultNS: "common",
  interpolation: { prefix: "{", suffix: "}", escapeValue: false },
  returnNull: false,
});

export default i18n;
