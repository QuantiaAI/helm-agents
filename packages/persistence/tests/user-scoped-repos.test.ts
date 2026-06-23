import { describe, it, expect } from "vitest";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  openDb, UserKeysRepo, UserSettingsRepo, SqliteRunsRepo, SqliteMemoryRepo,
} from "../src/index.js";

const DIR = join(tmpdir(), `taw-scoped-${process.pid}`);
function fresh() { rmSync(DIR, { recursive: true, force: true }); return openDb(DIR); }

describe("UserKeysRepo / UserSettingsRepo", () => {
  it("scopes keys and settings per user", () => {
    const db = fresh();
    const keys = new UserKeysRepo(db), settings = new UserSettingsRepo(db);
    keys.set("u1", "OPENAI_API_KEY", "ct1", 1);
    keys.set("u2", "OPENAI_API_KEY", "ct2", 1);
    expect(keys.get("u1", "OPENAI_API_KEY")).toBe("ct1");
    expect(keys.get("u2", "OPENAI_API_KEY")).toBe("ct2");
    expect(keys.list("u1").map((k) => k.env)).toEqual(["OPENAI_API_KEY"]);
    settings.set("u1", { outputLanguage: "中文" }, 1);
    expect(settings.get("u1")).toEqual({ outputLanguage: "中文" });
    expect(settings.get("u2")).toEqual({});
  });
});

describe("SqliteRunsRepo isolation", () => {
  it("lists only the owner's runs and reconciles running rows", () => {
    const db = fresh();
    const runs = new SqliteRunsRepo(db);
    const base = { ticker: "NVDA", tradeDate: "2024-05-10", assetType: "stock", createdAt: 1, updatedAt: 1 };
    runs.upsert({ id: "r1", userId: "u1", status: "done", rating: "Buy", ...base });
    runs.upsert({ id: "r2", userId: "u2", status: "running", ...base });
    expect(runs.list("u1").map((r) => r.id)).toEqual(["r1"]);
    expect(runs.list("u2").map((r) => r.id)).toEqual(["r2"]);
    expect(runs.get("r2")?.userId).toBe("u2");
    expect(runs.reconcileInterrupted()).toBe(1);
    expect(runs.get("r2")?.status).toBe("error");
  });
});

describe("SqliteMemoryRepo isolation", () => {
  it("scopes recent/pending per user", () => {
    const db = fresh();
    const mem = new SqliteMemoryRepo(db);
    const m = mem.append({ userId: "u1", ticker: "NVDA", tradeDate: "2024-05-10", rating: "Buy", status: "pending", decision: "d", createdAt: 1 });
    mem.append({ userId: "u2", ticker: "AAPL", tradeDate: "2024-05-10", rating: "Sell", status: "pending", decision: "d", createdAt: 1 });
    expect(mem.pending("u1").length).toBe(1);
    expect(mem.pending("u2").length).toBe(1);
    mem.resolve(m.id, { reflection: "r", returnPct: 1, alpha: 0.5 }, 2);
    expect(mem.recent("u1", undefined, 10).length).toBe(1);
    expect(mem.recent("u2", undefined, 10).length).toBe(0);
  });
});
