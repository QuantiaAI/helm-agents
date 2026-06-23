import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isValidLocale } from "@/locale";
import { BRAND } from "@/lib/brand";

export function NotFound() {
  const { locale: raw } = useParams();
  // The URL locale may itself be the invalid segment that triggered this 404,
  // so the home link falls back to the default locale.
  const locale = raw && isValidLocale(raw) ? raw : DEFAULT_LOCALE;
  const { t } = useTranslation("common");
  return (
    <div
      className="flex min-h-[calc(100vh-58px)] flex-col items-center justify-center gap-5 px-6 py-10 text-center"
      style={{
        backgroundImage:
          "radial-gradient(700px 360px at 50% 20%, rgba(45,226,230,0.07), transparent 60%)",
      }}
    >
      {/* 罗盘失向 — a compass whose needle has lost north */}
      <svg
        width="88"
        height="88"
        viewBox="0 0 100 100"
        fill="none"
        className="opacity-70"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="37" stroke="#2A3445" strokeWidth="3" />
        <g stroke="#2A3445" strokeWidth="3" strokeLinecap="round">
          <line x1="50" y1="13" x2="50" y2="20" />
          <g transform="rotate(90 50 50)">
            <line x1="50" y1="13" x2="50" y2="20" />
          </g>
          <g transform="rotate(180 50 50)">
            <line x1="50" y1="13" x2="50" y2="20" />
          </g>
          <g transform="rotate(270 50 50)">
            <line x1="50" y1="13" x2="50" y2="20" />
          </g>
        </g>
        <polygon points="50,24 58,50 50,46 42,50" fill="#F0496E" />
        <polygon points="50,76 58,50 50,54 42,50" fill="#3A4760" />
        <circle cx="50" cy="50" r="4.5" fill="#0A0E14" stroke="#2A3445" strokeWidth="3" />
      </svg>
      <div className="font-mono text-6xl font-semibold tracking-widest text-helm-text">404</div>
      <div className="text-base text-helm-muted">
        {t("notFoundTitle")} —— {t("notFoundBody")}
      </div>
      <Link
        to={`/${locale}`}
        className="mt-1 rounded bg-helm-accent px-6 py-3 font-bold text-helm-base transition-colors hover:bg-helm-accentHover"
      >
        {t("backHome")}
      </Link>
      <div className="font-mono text-[11px] tracking-wide text-helm-faint">{BRAND.name}</div>
    </div>
  );
}
