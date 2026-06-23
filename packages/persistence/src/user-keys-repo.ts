/** Per-user encrypted API keys (one row per user+env-var). */
import type { Db } from "./sqlite.js";

export interface UserKeyRow {
  env: string;
  ciphertext: string;
  createdAt: number;
}

export class UserKeysRepo {
  constructor(private db: Db) {}

  /** Upsert the ciphertext for a user's env var. */
  set(userId: string, env: string, ciphertext: string, now: number): void {
    this.db
      .prepare(
        `INSERT INTO user_keys (userId, env, ciphertext, createdAt) VALUES (?, ?, ?, ?)
         ON CONFLICT(userId, env) DO UPDATE SET ciphertext = excluded.ciphertext, createdAt = excluded.createdAt`,
      )
      .run(userId, env, ciphertext, now);
  }

  get(userId: string, env: string): string | undefined {
    const r = this.db
      .prepare(`SELECT ciphertext FROM user_keys WHERE userId = ? AND env = ?`)
      .get(userId, env) as { ciphertext: string } | undefined;
    return r?.ciphertext;
  }

  delete(userId: string, env: string): void {
    this.db.prepare(`DELETE FROM user_keys WHERE userId = ? AND env = ?`).run(userId, env);
  }

  list(userId: string): UserKeyRow[] {
    return this.db
      .prepare(`SELECT env, ciphertext, createdAt FROM user_keys WHERE userId = ?`)
      .all(userId) as unknown as UserKeyRow[];
  }
}
