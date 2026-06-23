import { describe, it, expect } from "vitest";
import { classifyError, ERR_MSG_KEY, type ErrKind } from "../src/lib/classify-error";

describe("classifyError", () => {
  it("classifies auth errors (401 / invalid key)", () => {
    expect(classifyError("401 Incorrect API key provided: missing.")).toBe("auth");
    expect(classifyError("Unauthorized")).toBe("auth");
    expect(classifyError("403 Forbidden")).toBe("auth");
  });
  it("classifies network errors (libuv codes + generic)", () => {
    expect(classifyError("connect ETIMEDOUT 1.2.3.4:443")).toBe("network");
    expect(classifyError("getaddrinfo EAI_AGAIN api.example.com")).toBe("network");
    expect(classifyError("connect EHOSTUNREACH")).toBe("network");
    expect(classifyError("fetch failed")).toBe("network");
    expect(classifyError("Request timed out")).toBe("network");
    expect(classifyError("socket hang up")).toBe("network");
  });
  it("classifies rate-limit errors", () => {
    expect(classifyError("429 Too Many Requests")).toBe("ratelimit");
    expect(classifyError("Rate limit exceeded")).toBe("ratelimit");
  });
  it("falls back to generic", () => {
    expect(classifyError("something unexpected happened")).toBe("generic");
  });
  it("prefers auth when both auth and network tokens appear", () => {
    expect(classifyError("401 network unreachable")).toBe("auth");
  });
  it("word-boundaries avoid false positives on numbers", () => {
    expect(classifyError("error code 40123")).toBe("generic"); // not auth
    expect(classifyError("error code 4290")).toBe("generic"); // not ratelimit
  });
});

describe("ERR_MSG_KEY", () => {
  it("maps every kind to a distinct catalog key", () => {
    const kinds: ErrKind[] = ["auth", "network", "ratelimit", "generic"];
    const keys = kinds.map((k) => ERR_MSG_KEY[k]);
    expect(new Set(keys).size).toBe(kinds.length); // no collisions
    // CamelCase keys (the bug class that once crashed the rate-limit path).
    expect(ERR_MSG_KEY.ratelimit).toBe("errRateLimit");
    expect(ERR_MSG_KEY.auth).toBe("errAuth");
    expect(ERR_MSG_KEY.network).toBe("errNetwork");
    expect(ERR_MSG_KEY.generic).toBe("errGeneric");
  });
});
