import { Navigate, Outlet, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE } from "@/locale";
import { useAuth } from "./AuthContext";

/** Route guard: gates the protected routes behind an authenticated session. */
export function RequireAuth() {
  const { locale = DEFAULT_LOCALE } = useParams();
  const { status } = useAuth();
  const { t } = useTranslation("common");

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-6 py-12 text-zinc-500">
        {t("loading")}
      </div>
    );
  }

  if (status === "anon") {
    return <Navigate to={`/${locale}/login`} replace />;
  }

  return <Outlet />;
}
