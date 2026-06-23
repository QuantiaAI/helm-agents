import { describe, it, expect } from "vitest";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, UsersRepo, RefreshTokensRepo } from "../src/index.js";

const DIR = join(tmpdir(), `taw-auth-${process.pid}`);
function fresh() {
  rmSync(DIR, { recursive: true, force: true });
  return openDb(DIR);
}

describe("UsersRepo", () => {
  it("creates and finds by email (case-insensitive) and id", () => {
    const repo = new UsersRepo(fresh());
    repo.create({ id: "usr_1", email: "a@b.com", passwordHash: "h", createdAt: 1 });
    expect(repo.findByEmail("A@B.com")?.id).toBe("usr_1");
    expect(repo.findById("usr_1")?.email).toBe("a@b.com");
    expect(repo.findByEmail("none@x.com")).toBeUndefined();
  });

  it("rejects a duplicate email", () => {
    const repo = new UsersRepo(fresh());
    repo.create({ id: "usr_1", email: "a@b.com", passwordHash: "h", createdAt: 1 });
    expect(() =>
      repo.create({ id: "usr_2", email: "A@B.com", passwordHash: "h", createdAt: 2 }),
    ).toThrow();
  });
});

describe("RefreshTokensRepo", () => {
  it("creates, finds by hash, and revokes", () => {
    const repo = new RefreshTokensRepo(fresh());
    repo.create({ id: "rt_1", userId: "usr_1", tokenHash: "hash1", expiresAt: 9999, createdAt: 1 });
    const row = repo.findByHash("hash1");
    expect(row?.userId).toBe("usr_1");
    expect(row?.revoked).toBe(false);
    repo.revoke("hash1");
    expect(repo.findByHash("hash1")?.revoked).toBe(true);
  });

  it("revokes all tokens for a user", () => {
    const repo = new RefreshTokensRepo(fresh());
    repo.create({ id: "rt_1", userId: "u", tokenHash: "h1", expiresAt: 9, createdAt: 1 });
    repo.create({ id: "rt_2", userId: "u", tokenHash: "h2", expiresAt: 9, createdAt: 1 });
    repo.revokeAllForUser("u");
    expect(repo.findByHash("h1")?.revoked).toBe(true);
    expect(repo.findByHash("h2")?.revoked).toBe(true);
  });
});

describe("RefreshTokensRepo rotation + prune", () => {
  it("revokeIfActive claims a token exactly once (atomic rotation)", () => {
    const repo = new RefreshTokensRepo(fresh());
    repo.create({ id: "rt_1", userId: "u", tokenHash: "h", expiresAt: 9e15, createdAt: 1 });
    expect(repo.revokeIfActive("h")).toBe(true); // winner
    expect(repo.revokeIfActive("h")).toBe(false); // already used → reuse
    expect(repo.revokeIfActive("missing")).toBe(false);
  });

  it("pruneExpired deletes expired but keeps revoked-unexpired (for reuse detection)", () => {
    const repo = new RefreshTokensRepo(fresh());
    repo.create({ id: "rt_old", userId: "u", tokenHash: "old", expiresAt: 100, createdAt: 1 });
    repo.create({ id: "rt_live", userId: "u", tokenHash: "live", expiresAt: 9e15, createdAt: 1 });
    repo.revoke("live"); // revoked but not expired
    repo.pruneExpired(1000);
    expect(repo.findByHash("old")).toBeUndefined();
    expect(repo.findByHash("live")?.revoked).toBe(true);
  });
});
