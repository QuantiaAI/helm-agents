/** SQLite runs repository, scoped by userId (replaces the JSON RunsRepo). */
import type { Db } from "./sqlite.js";

export interface RunRecord {
  id: string;
  userId: string;
  ticker: string;
  tradeDate: string;
  assetType: string;
  status: string;
  rating: string | null;
  selectedAnalysts: string | null;
  finalStateJson: string | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface RunUpsert {
  id: string;
  userId: string;
  ticker: string;
  tradeDate: string;
  assetType: string;
  status: string;
  rating?: string | null;
  selectedAnalysts?: string | null;
  finalStateJson?: string | null;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
}

const INTERRUPTED = "Run was interrupted (the server restarted before it finished). Please run it again.";

export class SqliteRunsRepo {
  constructor(private db: Db) {}

  upsert(r: RunUpsert): void {
    this.db
      .prepare(
        `INSERT INTO runs (id, userId, ticker, tradeDate, assetType, status, rating, selectedAnalysts, finalStateJson, error, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           status = excluded.status, rating = excluded.rating,
           selectedAnalysts = excluded.selectedAnalysts,
           finalStateJson = excluded.finalStateJson, error = excluded.error,
           updatedAt = excluded.updatedAt`,
      )
      .run(
        r.id, r.userId, r.ticker, r.tradeDate, r.assetType, r.status,
        r.rating ?? null, r.selectedAnalysts ?? null, r.finalStateJson ?? null,
        r.error ?? null, r.createdAt, r.updatedAt,
      );
  }

  /** Get by id (ownership is checked by the caller via .userId). */
  get(id: string): RunRecord | undefined {
    return this.db.prepare(`SELECT * FROM runs WHERE id = ?`).get(id) as RunRecord | undefined;
  }

  list(userId: string, limit = 50): RunRecord[] {
    return this.db
      .prepare(`SELECT * FROM runs WHERE userId = ? ORDER BY createdAt DESC LIMIT ?`)
      .all(userId, limit) as unknown as RunRecord[];
  }

  /** Mark all "running" rows interrupted on startup (global; no live runs exist). */
  reconcileInterrupted(): number {
    const rows = this.db.prepare(`SELECT id FROM runs WHERE status = 'running'`).all() as {
      id: string;
    }[];
    if (rows.length > 0) {
      this.db
        .prepare(`UPDATE runs SET status = 'error', error = ? WHERE status = 'running'`)
        .run(INTERRUPTED);
    }
    return rows.length;
  }
}
