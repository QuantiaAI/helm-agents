import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "./token.js";

const SECRET = "test-secret";

describe("access JWT", () => {
  it("round-trips claims", () => {
    const t = signAccessToken({ sub: "usr_1", email: "a@b.com" }, SECRET, 900, 1000);
    const c = verifyAccessToken(t, SECRET, 1000);
    expect(c).toMatchObject({ sub: "usr_1", email: "a@b.com", iat: 1000, exp: 1900 });
  });

  it("rejects a tampered token, wrong secret, and expiry", () => {
    const t = signAccessToken({ sub: "usr_1", email: "a@b.com" }, SECRET, 900, 1000);
    expect(verifyAccessToken(t + "x", SECRET, 1000)).toBeNull();
    expect(verifyAccessToken(t, "other-secret", 1000)).toBeNull();
    expect(verifyAccessToken(t, SECRET, 5000)).toBeNull(); // now > exp
  });
});

describe("refresh tokens", () => {
  it("generates an opaque token with a deterministic hash", () => {
    const { token, tokenHash } = generateRefreshToken();
    expect(token.length).toBeGreaterThan(20);
    expect(tokenHash).toBe(hashRefreshToken(token));
    expect(tokenHash).not.toBe(token);
  });
});
