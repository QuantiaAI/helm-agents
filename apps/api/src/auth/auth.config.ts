/** Auth configuration (DI token + env loader). */
export const AUTH_CONFIG = "AUTH_CONFIG";

export interface AuthConfig {
  jwtSecret: string;
  accessTtlSec: number;
  refreshTtlSec: number;
  cookieSecure: boolean;
  bootstrapEmail?: string;
  bootstrapPassword?: string;
}

export function authConfigFromEnv(): AuthConfig {
  const jwtSecret = process.env.AUTH_JWT_SECRET ?? "dev-insecure-secret-change-me";
  if (process.env.NODE_ENV === "production" && jwtSecret === "dev-insecure-secret-change-me") {
    // eslint-disable-next-line no-console
    console.warn("[auth] AUTH_JWT_SECRET is unset in production — set a strong secret!");
  }
  const posInt = (raw: string | undefined, fallback: number): number => {
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };
  return {
    jwtSecret,
    accessTtlSec: posInt(process.env.AUTH_ACCESS_TTL_SEC, 900),
    refreshTtlSec: posInt(process.env.AUTH_REFRESH_TTL_SEC, 60 * 60 * 24 * 30),
    cookieSecure: process.env.NODE_ENV === "production",
    bootstrapEmail: process.env.AUTH_BOOTSTRAP_EMAIL,
    bootstrapPassword: process.env.AUTH_BOOTSTRAP_PASSWORD,
  };
}
