import { useNavigate, useLocation, useParams } from "react-router-dom";
import { LOCALES, isValidLocale, DEFAULT_LOCALE, type Locale } from "@/locale";

const LABEL: Record<Locale, string> = {
  en: "EN",
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  vi: "Tiếng Việt",
};

export function LocaleSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locale } = useParams();
  const current = (locale && isValidLocale(locale) ? locale : DEFAULT_LOCALE) as Locale;

  function switchTo(next: Locale) {
    if (next === current) return;
    // pathname is locale-prefixed (e.g. /en/analyze); swap the leading segment.
    const rest = location.pathname.replace(/^\/[a-z]{2}(\/|$)/, "/");
    navigate(`/${next}${rest === "/" ? "" : rest}`);
  }

  return (
    <label className="relative flex items-center gap-1.5">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute left-2 text-helm-faint"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
      <select
        value={current}
        onChange={(e) =>
          isValidLocale(e.target.value) && switchTo(e.target.value as Locale)
        }
        aria-label="Language / 语言"
        className="cursor-pointer appearance-none rounded border border-zinc-700 bg-transparent py-1.5 pl-7 pr-6 font-mono text-xs text-helm-muted transition-colors hover:border-helm-accent hover:text-helm-text"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l} className="bg-helm-panel text-helm-text">
            {LABEL[l]}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-2 text-[9px] text-helm-faint"
        aria-hidden="true"
      >
        ▾
      </span>
    </label>
  );
}
