/** Repository for the memory_log table (cross-run reflection memory, Phase 4). */
import type { JsonStore } from "./db.js";
import type { MemoryInsert, MemoryRow } from "./schema.js";

const TABLE = "memory_log";

export interface ResolveFields {
  reflection: string;
  returnPct: number;
  alpha: number;
}

export class MemoryRepo {
  constructor(private store: JsonStore) {}

  private all(): MemoryRow[] {
    return this.store.read<MemoryRow>(TABLE);
  }

  append(row: MemoryInsert): MemoryRow {
    const rows = this.all();
    const nextId = rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const full: MemoryRow = {
      id: nextId,
      reflection: null,
      returnPct: null,
      alpha: null,
      resolvedAt: null,
      ...row,
    };
    rows.push(full);
    this.store.write(TABLE, rows);
    return full;
  }

  recent(ticker: string | undefined, limit: number): MemoryRow[] {
    return this.all()
      .filter((r) => r.status === "resolved" && (!ticker || r.ticker === ticker))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  pending(ticker?: string): MemoryRow[] {
    return this.all()
      .filter((r) => r.status === "pending" && (!ticker || r.ticker === ticker))
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  resolve(id: number, fields: ResolveFields): void {
    const rows = this.all();
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    row.status = "resolved";
    row.reflection = fields.reflection;
    row.returnPct = fields.returnPct;
    row.alpha = fields.alpha;
    row.resolvedAt = Date.now();
    this.store.write(TABLE, rows);
  }
}
