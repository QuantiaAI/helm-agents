/** SQLite memory_log repository, scoped by userId (cross-run reflection memory). */
import type { Db } from "./sqlite.js";

export interface MemoryRecord {
  id: number;
  userId: string;
  ticker: string;
  tradeDate: string;
  rating: string;
  status: string;
  decision: string;
  reflection: string | null;
  returnPct: number | null;
  alpha: number | null;
  createdAt: number;
  resolvedAt: number | null;
}

export class SqliteMemoryRepo {
  constructor(private db: Db) {}

  append(r: {
    userId: string;
    ticker: string;
    tradeDate: string;
    rating: string;
    status: string;
    decision: string;
    createdAt: number;
  }): MemoryRecord {
    const info = this.db
      .prepare(
        `INSERT INTO memory_log (userId, ticker, tradeDate, rating, status, decision, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(r.userId, r.ticker, r.tradeDate, r.rating, r.status, r.decision, r.createdAt) as {
      lastInsertRowid: number | bigint;
    };
    return this.get(Number(info.lastInsertRowid))!;
  }

  get(id: number): MemoryRecord | undefined {
    return this.db.prepare(`SELECT * FROM memory_log WHERE id = ?`).get(id) as
      | MemoryRecord
      | undefined;
  }

  recent(userId: string, ticker: string | undefined, limit: number): MemoryRecord[] {
    const sql = ticker
      ? `SELECT * FROM memory_log WHERE userId = ? AND status = 'resolved' AND ticker = ? ORDER BY createdAt DESC LIMIT ?`
      : `SELECT * FROM memory_log WHERE userId = ? AND status = 'resolved' ORDER BY createdAt DESC LIMIT ?`;
    const params = ticker ? [userId, ticker, limit] : [userId, limit];
    return this.db.prepare(sql).all(...params) as unknown as MemoryRecord[];
  }

  pending(userId: string, ticker?: string): MemoryRecord[] {
    const sql = ticker
      ? `SELECT * FROM memory_log WHERE userId = ? AND status = 'pending' AND ticker = ? ORDER BY createdAt DESC`
      : `SELECT * FROM memory_log WHERE userId = ? AND status = 'pending' ORDER BY createdAt DESC`;
    const params = ticker ? [userId, ticker] : [userId];
    return this.db.prepare(sql).all(...params) as unknown as MemoryRecord[];
  }

  resolve(
    id: number,
    fields: { reflection: string; returnPct: number; alpha: number },
    now: number,
  ): void {
    this.db
      .prepare(
        `UPDATE memory_log SET status = 'resolved', reflection = ?, returnPct = ?, alpha = ?, resolvedAt = ? WHERE id = ?`,
      )
      .run(fields.reflection, fields.returnPct, fields.alpha, now, id);
  }
}
