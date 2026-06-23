import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE } from "@/locale";
import { useAuth } from "@/auth/AuthContext";
import { authErrorMessage } from "@/lib/auth-error";
import { BRAND } from "@/lib/brand";
import HelmMark from "@/components/HelmMark";

export function Login() {
  const { t } = useTranslation("auth");
  const { locale = DEFAULT_LOCALE } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate(`/${locale}`);
    } catch (err) {
      setError(authErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16">
      <BrandHeader tagline={t("tagline")} />

      <form
        onSubmit={onSubmit}
        className="mt-6 w-full space-y-4 rounded-md border border-zinc-800 bg-helm-panel p-6"
      >
        {error && (
          <p className="rounded border border-helm-danger/40 bg-helm-danger/10 p-3 text-sm text-helm-danger">
            {error}
          </p>
        )}
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
            {t("email")}
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded border border-zinc-700 bg-helm-base px-3 py-2.5 text-helm-text outline-none transition-colors focus:border-helm-accent"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
            {t("password")}
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded border border-zinc-700 bg-helm-base px-3 py-2.5 text-helm-text outline-none transition-colors focus:border-helm-accent"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-helm-accent px-4 py-3 font-bold text-helm-base transition-colors hover:bg-helm-accentHover disabled:opacity-60"
        >
          {busy ? t("loggingIn") : t("signIn")}
        </button>
        <LockHint>{t("lockHint")}</LockHint>
      </form>

      <p className="mt-4 text-sm text-helm-muted">
        <Link to={`/${locale}/register`} className="text-helm-accent hover:underline">
          {t("noAccount")}
        </Link>
      </p>
    </div>
  );
}

export function BrandHeader({ tagline }: { tagline: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <HelmMark className="h-11 w-11 text-helm-accent" />
      <div className="font-mono text-lg font-semibold tracking-wide text-helm-text">
        {BRAND.wordmark.primary.toUpperCase()}
        <span className="text-helm-accent">{BRAND.wordmark.accent.toUpperCase()}</span>
      </div>
      <div className="text-[13px] text-helm-faint">{tagline}</div>
    </div>
  );
}

export function LockHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[11.5px] leading-relaxed text-helm-faint">
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      {children}
    </div>
  );
}
