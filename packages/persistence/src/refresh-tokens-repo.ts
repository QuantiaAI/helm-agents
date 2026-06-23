/** Repository for refresh tokens (only the hash is stored; supports rotation). */
import type { Db } from "./sqlite.js";

export interface RefreshTokenRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revoked: boolean;
  createdAt: number;
}

interface RawRow {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: number;
  revoked: number;
  createdAt: number;
}

const hydrate = (r: RawRow | undefined): RefreshTokenRow | undefined =>
  r ? { ...r, revoked: r.revoked === 1 } : undefined;

export class RefreshTokensRepo {
  constructor(private db: Db) {}

  create(t: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: number;
    createdAt: number;
  }): void {
    this.db
      .prepare(
        `INSERT INTO refresh_tokens (id, userId, tokenHash, expiresAt, revoked, createdAt)
         VALUES (?, ?, ?, ?, 0, ?)`,
      )
      .run(t.id, t.userId, t.tokenHash, t.expiresAt, t.createdAt);
  }

  findByHash(tokenHash: string): RefreshTokenRow | undefined {
    return hydrate(
      this.db.prepare(`SELECT * FROM refresh_tokens WHERE tokenHash = ?`).get(tokenHash) as
        | RawRow
        | undefined,
    );
  }

  revoke(tokenHash: string): void {
    this.db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE tokenHash = ?`).run(tokenHash);
  }

  /** Atomically revoke a token only if it is currently active. Returns true iff
   *  this call is the one that revoked it (the rotation "winner"); a false means
   *  it was already revoked/used — the caller should treat that as token reuse. */
  revokeIfActive(tokenHash: string): boolean {
    const info = this.db
      .prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE tokenHash = ? AND revoked = 0`)
      .run(tokenHash) as { changes: number | bigint };
    return Number(info.changes) === 1;
  }

  revokeAllForUser(userId: string): void {
    this.db.prepare(`UPDATE refresh_tokens SET revoked = 1 WHERE userId = ?`).run(userId);
  }

  /** Delete expired rows. Keeps revoked-but-unexpired rows so reuse detection
   *  can still see them. Call periodically (e.g. at startup). */
  pruneExpired(now: number): void {
    this.db.prepare(`DELETE FROM refresh_tokens WHERE expiresAt < ?`).run(now);
  }
}
