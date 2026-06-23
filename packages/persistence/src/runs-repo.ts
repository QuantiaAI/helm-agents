/** Repository for the runs table (history source for the Web UI). */
import type { JsonStore } from "./db.js";
import type { RunInsert, RunRow } from "./schema.js";

const TABLE = "runs";

export class RunsRepo {
  constructor(private store: JsonStore) {}

  private all(): RunRow[] {
    return this.store.read<RunRow>(TABLE);
  }

  upsert(row: RunInsert): void {
    const rows = this.all();
    const idx = rows.findIndex((r) => r.id === row.id);
    const normalized: RunRow = {
      rating: null,
      selectedAnalysts: null,
      finalStateJson: null,
      error: null,
      ...row,
    };
    if (idx >= 0) rows[idx] = normalized;
    else rows.push(normalized);
    this.store.write(TABLE, rows);
  }

  get(id: string): RunRow | undefined {
    return this.all().find((r) => r.id === id);
  }

  list(limit = 50): RunRow[] {
    return this.all()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  /**
   * Mark every persisted "running" row as interrupted. Runs execute only in the
   * in-memory RunManager (which persists the terminal status); a freshly started
   * process has no in-memory runs, so any row still "running" was orphaned by a
   * restart/crash and would otherwise appear "running" forever (the UI hangs
   * waiting for it). Call once at startup. Returns the number reconciled.
   */
  reconcileInterrupted(): number {
    const rows = this.all();
    let n = 0;
    for (const r of rows) {
      if (r.status === "running") {
        r.status = "error";
        r.error =
          "Run was interrupted (the server restarted before it finished). Please run it again.";
        n++;
      }
    }
    if (n > 0) this.store.write(TABLE, rows);
    return n;
  }
}
