import { useEffect } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { isValidLocale, DEFAULT_LOCALE } from "@/locale";
import { LocaleSwitcher } from "./LocaleSwitcher";
import HelmMark from "./HelmMark";
import { BRAND } from "@/lib/brand";
import { NotFound } from "@/pages/NotFound";
import { useAuth } from "@/auth/AuthContext";

export function Layout() {
  const { locale } = useParams();
  // An unknown locale segment (e.g. /xx/analyze) is a 404 — never silently
  // render English content under a bogus prefix.
  const valid = !locale || isValidLocale(locale);
  const lng = valid && locale ? locale : DEFAULT_LOCALE;

  // Keep i18next in sync with the URL locale on client-side navigation.
  useEffect(() => {
    if (i18n.language !== lng) void i18n.changeLanguage(lng);
  }, [lng]);

  const { t } = useTranslation("nav");
  const { t: tAuth } = useTranslation("auth");
  const { status, user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate(`/${lng}`);
  }

  const navItems = [
    { to: `/${lng}/analyze`, label: t("analyze") },
    { to: `/${lng}/history`, label: t("history") },
    { to: `/${lng}/settings`, label: t("settings") },
    { to: `/${lng}/health`, label: t("health") },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-helm-base/82 backdrop-blur-md">
        <nav className="mx-auto flex h-[58px] max-w-6xl items-center gap-4 px-5">
          <Link
            to={`/${lng}`}
            className="flex items-center gap-2.5 font-mono text-base font-semibold tracking-tight text-helm-text"
          >
            <HelmMark className="h-7 w-7 text-helm-accent" />
            <span className="tracking-wide">
              {BRAND.wordmark.primary.toUpperCase()}
              <span className="text-helm-accent">
                {BRAND.wordmark.accent.toUpperCase()}
              </span>
            </span>
          </Link>
          <div className="ml-2 flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded px-3 py-1.5 text-[13.5px] text-helm-muted transition-colors hover:bg-zinc-800/60 hover:text-helm-text"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            {status === "authed" ? (
              <span className="flex items-center gap-3">
                <span className="hidden font-mono text-xs text-helm-faint sm:inline">
                  {user?.email}
                </span>
                <button
                  onClick={onLogout}
                  className="rounded px-2 py-1 text-helm-muted transition-colors hover:text-helm-text"
                >
                  {tAuth("logout")}
                </button>
              </span>
            ) : status === "anon" ? (
              <Link
                to={`/${lng}/login`}
                className="rounded border border-zinc-700 px-3 py-1.5 text-[13px] text-helm-text transition-colors hover:border-helm-accent hover:text-helm-accent"
              >
                {tAuth("signIn")}
              </Link>
            ) : null}
            <LocaleSwitcher />
          </div>
        </nav>
      </header>
      <main className="flex-1">{valid ? <Outlet /> : <NotFound />}</main>
      <footer className="border-t border-zinc-800 px-6 py-5 text-center">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2">
          <div className="font-mono text-[11px] tracking-wide text-helm-faint">
            {BRAND.wordmark.primary.toUpperCase()}
            {BRAND.wordmark.accent.toUpperCase()} · {BRAND.footer}
          </div>
        </div>
      </footer>
    </div>
  );
}
