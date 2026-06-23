import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, SqliteRunsRepo } from "@helm-agents/persistence";
import { AppModule } from "../src/app.module.js";
import { STORE_DIR } from "../src/engine/tokens.js";
import { StoreService } from "../src/engine/store.service.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";

// A run orphaned by a prior restart (persisted "running", no in-memory run) must
// be reconciled to a terminal state at startup so it doesn't appear stuck.
describe("Orphaned-run reconciliation (e2e)", () => {
  let app: INestApplication;
  const dir = mkdtempSync(join(tmpdir(), "ta-orphan-"));

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    // Seed a stuck "running" row into the sqlite store before the app boots.
    const now = Date.now();
    const seedDb = openDb(dir);
    new SqliteRunsRepo(seedDb).upsert({
      id: "run_orphan",
      userId: "u_seed",
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
      status: "running",
      createdAt: now,
      updatedAt: now,
    });
    seedDb.close?.();

    const ref = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(STORE_DIR)
      .useValue(dir)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init(); // StoreService reconciles on construction
  });

  afterAll(async () => {
    await app.close();
  });

  it("marks a pre-existing 'running' run as interrupted on startup", async () => {
    // Assert via the live store (not HTTP) to bypass ownership gating.
    const store = app.get(StoreService);
    const row = store.runs.get("run_orphan");
    expect(row?.status).toBe("error");
    expect(row?.error).toMatch(/interrupted/i);
  });
});
