import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { openStore, RunsRepo, MemoryRepo } from "../src/index.js";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const STORE_DIR = join(tmpdir(), `taw-test-${process.pid}`);

function fresh() {
  rmSync(STORE_DIR, { recursive: true, force: true });
  return openStore(STORE_DIR);
}

describe("RunsRepo", () => {
  let store: ReturnType<typeof fresh>;
  beforeEach(() => {
    store = fresh();
  });
  afterEach(() => store.close());

  it("upserts and retrieves a run", () => {
    const repo = new RunsRepo(store);
    const now = Date.now();
    repo.upsert({
      id: "run_1",
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
      status: "running",
      createdAt: now,
      updatedAt: now,
    });
    repo.upsert({
      id: "run_1",
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
      status: "done",
      rating: "Buy",
      finalStateJson: "{}",
      createdAt: now,
      updatedAt: now + 1,
    });
    const got = repo.get("run_1");
    expect(got?.status).toBe("done");
    expect(got?.rating).toBe("Buy");
  });

  it("lists runs newest-first", () => {
    const repo = new RunsRepo(store);
    const base = Date.now();
    repo.upsert({ id: "a", ticker: "A", tradeDate: "2024-01-01", assetType: "stock", status: "done", createdAt: base, updatedAt: base });
    repo.upsert({ id: "b", ticker: "B", tradeDate: "2024-01-02", assetType: "stock", status: "done", createdAt: base + 1000, updatedAt: base + 1000 });
    const list = repo.list();
    expect(list.map((r) => r.id)).toEqual(["b", "a"]);
  });
});

describe("MemoryRepo", () => {
  let store: ReturnType<typeof fresh>;
  beforeEach(() => {
    store = fresh();
  });
  afterEach(() => store.close());

  it("tracks pending decisions and resolves them", () => {
    const repo = new MemoryRepo(store);
    repo.append({
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      rating: "Buy",
      status: "pending",
      decision: "Buy NVDA",
      createdAt: Date.now(),
    });
    expect(repo.pending().length).toBe(1);
    expect(repo.pending("AAPL").length).toBe(0);

    const [row] = repo.pending("NVDA");
    repo.resolve(row!.id, { reflection: "correct call", returnPct: 5.2, alpha: 1.1 });
    expect(repo.pending().length).toBe(0);
    expect(repo.recent("NVDA", 5).length).toBe(1);
    expect(repo.recent("NVDA", 5)[0]?.reflection).toBe("correct call");
  });
});

describe("RunsRepo.reconcileInterrupted", () => {
  it("marks orphaned 'running' rows as error and leaves terminal rows untouched", () => {
    const store = fresh();
    const repo = new RunsRepo(store);
    const now = Date.now();
    repo.upsert({ id: "r_run", ticker: "NVDA", tradeDate: "2024-05-10", assetType: "stock", status: "running", createdAt: now, updatedAt: now });
    repo.upsert({ id: "r_done", ticker: "AAPL", tradeDate: "2024-05-10", assetType: "stock", status: "done", rating: "Hold", createdAt: now, updatedAt: now });

    const n = repo.reconcileInterrupted();
    expect(n).toBe(1);

    const run = repo.get("r_run");
    expect(run?.status).toBe("error");
    expect(run?.error).toMatch(/interrupted/i);
    // terminal row untouched
    expect(repo.get("r_done")?.status).toBe("done");

    // idempotent: a second pass reconciles nothing
    expect(repo.reconcileInterrupted()).toBe(0);
    store.close();
  });
});
