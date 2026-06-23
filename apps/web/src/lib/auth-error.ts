import type { TFunction } from "i18next";

/**
 * Map an auth-request error to a localized message in the `auth` namespace.
 * The API throws Error(message) where message is the server `error` string or
 * `HTTP <status>`; we match on the known cases and fall back to generic.
 */
export function authErrorMessage(err: unknown, t: TFunction): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();

  if (lower.includes("401") || lower.includes("invalid")) {
    return t("invalidCreds");
  }
  if (lower.includes("409") || lower.includes("exist") || lower.includes("taken")) {
    return t("emailTaken");
  }
  if (lower.includes("400") || lower.includes("password") || lower.includes("8")) {
    return t("passwordTooShort");
  }
  return t("genericError");
}
