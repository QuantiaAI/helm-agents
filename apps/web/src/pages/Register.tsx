import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE } from "@/locale";
import { useAuth } from "@/auth/AuthContext";
import { authErrorMessage } from "@/lib/auth-error";
import { BrandHeader, LockHint } from "./Login";

export function Register() {
  const { t } = useTranslation("auth");
  const { locale = DEFAULT_LOCALE } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setBusy(true);
    try {
      await register(email, password);
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
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded border border-zinc-700 bg-helm-base px-3 py-2.5 text-helm-text outline-none transition-colors focus:border-helm-accent"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-helm-faint">
            {t("confirmPassword")}
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded border border-zinc-700 bg-helm-base px-3 py-2.5 text-helm-text outline-none transition-colors focus:border-helm-accent"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-helm-accent px-4 py-3 font-bold text-helm-base transition-colors hover:bg-helm-accentHover disabled:opacity-60"
        >
          {busy ? t("loggingIn") : t("signUp")}
        </button>
        <LockHint>{t("lockHint")}</LockHint>
      </form>

      <p className="mt-4 text-sm text-helm-muted">
        <Link to={`/${locale}/login`} className="text-helm-accent hover:underline">
          {t("haveAccount")}
        </Link>
      </p>
    </div>
  );
}
