import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing", () => {
  it("verifies a correct password and rejects a wrong one", () => {
    const stored = hashPassword("s3cret!");
    expect(verifyPassword("s3cret!", stored)).toBe(true);
    expect(verifyPassword("wrong", stored)).toBe(false);
  });

  it("salts: same password yields different hashes", () => {
    expect(hashPassword("x")).not.toBe(hashPassword("x"));
  });

  it("rejects malformed stored values", () => {
    expect(verifyPassword("x", "garbage")).toBe(false);
    expect(verifyPassword("x", "scrypt$deadbeef$")).toBe(false);
  });
});
