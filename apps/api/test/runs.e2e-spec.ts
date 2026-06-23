import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import type { RunEvent } from "@helm-agents/core";
import { AppModule } from "../src/app.module.js";
import { STORE_DIR } from "../src/engine/tokens.js";
import { RunsService } from "../src/engine/runs.service.js";
import { StoreService } from "../src/engine/store.service.js";
import { RunManager } from "../src/lib/run-manager.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";
import { authHeader } from "./helpers/auth.js";

// A deterministic fake stream so the HTTP layer is tested without touching the
// network or the real multi-agent pipeline.
function fakeManager(): RunManager {
  const events: RunEvent[] = [
    { type: "nodeEnd", node: "Market Analyst", patch: { marketReport: "x" } },
    {
      type: "done",
      rating: "Buy",
      finalState: { companyOfInterest: "NVDA" } as never,
    },
  ];
  return new RunManager(() => {
    async function* gen(): AsyncGenerator<RunEvent> {
      for (const e of events) {
        await Promise.resolve();
        yield e;
      }
    }
    return gen();
  });
}

describe("Runs (e2e)", () => {
  let app: INestApplication;
  let store: StoreService;
  let auth: { Authorization: string; userId: string };
  const manager = fakeManager();

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    const dir = mkdtempSync(join(tmpdir(), "ta-runs-"));
    const ref = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(STORE_DIR)
      .useValue(dir)
      .overrideProvider(RunsService)
      .useValue({ manager })
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
    store = app.get(StoreService);
    auth = await authHeader(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/runs rejects a missing ticker", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/runs")
      .set(auth)
      .send({ tradeDate: "2024-05-10" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ticker/);
  });

  it("POST /api/analyze rejects a malformed date", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/analyze")
      .set(auth)
      .send({ ticker: "NVDA", tradeDate: "05/10/2024" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTypeOf("string");
  });

  it("malformed JSON body returns 400 with the { error } shape", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/runs")
      .set(auth)
      .set("content-type", "application/json")
      .send("{ not json");
    expect(res.status).toBe(400);
    // Normalized by AllExceptionsFilter — never Nest's { statusCode, message }.
    expect(res.body.error).toBeTypeOf("string");
    expect(res.body.statusCode).toBeUndefined();
  });

  it("POST /api/runs creates a run and streams NDJSON to completion", async () => {
    const create = await request(app.getHttpServer())
      .post("/api/runs")
      .set(auth)
      .send({ ticker: "NVDA", tradeDate: "2024-05-10" });
    expect(create.status).toBe(200);
    const runId = create.body.runId;
    expect(runId).toBeTypeOf("string");

    const stream = await request(app.getHttpServer())
      .get(`/api/runs/${runId}/stream`)
      .set(auth);
    expect(stream.status).toBe(200);
    expect(stream.headers["content-type"]).toContain("application/x-ndjson");
    const lines = stream.text
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(lines[0]).toMatchObject({ type: "nodeEnd", node: "Market Analyst" });
    expect(lines.at(-1)).toMatchObject({ type: "done", rating: "Buy" });
  });

  it("GET /api/runs/:id/stream 404s for an unknown run", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/runs/nope/stream")
      .set(auth);
    expect(res.status).toBe(404);
  });

  it("GET /api/runs lists persisted history and report renders markdown", async () => {
    const now = Date.now();
    store.runs.upsert({
      id: "run_persisted",
      userId: auth.userId,
      ticker: "AAPL",
      tradeDate: "2024-06-01",
      assetType: "stock",
      status: "done",
      rating: "Hold",
      selectedAnalysts: null,
      finalStateJson: JSON.stringify({ marketReport: "all good" }),
      error: null,
      createdAt: now,
      updatedAt: now,
    });

    const list = await request(app.getHttpServer()).get("/api/runs").set(auth);
    expect(list.status).toBe(200);
    expect(list.body.runs.some((r: { id: string }) => r.id === "run_persisted")).toBe(
      true,
    );

    const report = await request(app.getHttpServer())
      .get("/api/runs/run_persisted/report")
      .set(auth);
    expect(report.status).toBe(200);
    expect(report.headers["content-type"]).toContain("text/markdown");
    expect(report.headers["content-disposition"]).toContain("AAPL_2024-06-01.md");
    expect(report.text).toContain("AAPL");
  });

  it("GET /api/runs/:id 404s for an unknown run", async () => {
    const res = await request(app.getHttpServer()).get("/api/runs/ghost").set(auth);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("run not found");
  });
});
