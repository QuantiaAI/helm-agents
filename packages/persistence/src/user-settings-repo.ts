/** Per-user settings (stored as a JSON blob, one row per user). */
import type { Db } from "./sqlite.js";

export class UserSettingsRepo {
  constructor(private db: Db) {}

  get(userId: string): Record<string, unknown> {
    const r = this.db
      .prepare(`SELECT json FROM user_settings WHERE userId = ?`)
      .get(userId) as { json: string } | undefined;
    if (!r) return {};
    try {
      return JSON.parse(r.json) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  set(userId: string, settings: Record<string, unknown>, now: number): void {
    this.db
      .prepare(
        `INSERT INTO user_settings (userId, json, updatedAt) VALUES (?, ?, ?)
         ON CONFLICT(userId) DO UPDATE SET json = excluded.json, updatedAt = excluded.updatedAt`,
      )
      .run(userId, JSON.stringify(settings), now);
  }
}
