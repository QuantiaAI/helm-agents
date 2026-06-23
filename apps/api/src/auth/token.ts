/** Minimal HS256 JWT + opaque refresh tokens, all via node:crypto (zero deps). */
import { createHmac, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export interface AccessClaims {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

const b64 = (b: Buffer) => b.toString("base64url");
const sig = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest();
const nowSec = () => Math.floor(Date.now() / 1000);

export function signAccessToken(
  payload: { sub: string; email: string },
  secret: string,
  ttlSec: number,
  now = nowSec(),
): string {
  const header = b64(Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const claims = { sub: payload.sub, email: payload.email, iat: now, exp: now + ttlSec };
  const body = b64(Buffer.from(JSON.stringify(claims)));
  return `${header}.${body}.${b64(sig(`${header}.${body}`, secret))}`;
}

export function verifyAccessToken(
  token: string,
  secret: string,
  now = nowSec(),
): AccessClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, b, s] = parts as [string, string, string];
  const expected = b64(sig(`${h}.${b}`, secret));
  const got = Buffer.from(s);
  const exp = Buffer.from(expected);
  if (got.length !== exp.length || !timingSafeEqual(got, exp)) return null;
  let claims: AccessClaims;
  try {
    claims = JSON.parse(Buffer.from(b, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof claims.exp !== "number" || claims.exp < now || typeof claims.sub !== "string") {
    return null;
  }
  return claims;
}

/** Opaque refresh token; only its hash is persisted. */
export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
