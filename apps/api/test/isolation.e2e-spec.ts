import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { AppModule } from "../src/app.module.js";
import { STORE_DIR } from "../src/engine/tokens.js";
import { StoreService } from "../src/engine/store.service.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";
import { authHeader } from "./helpers/auth.js";

async function buildApp(dir: string): Promise<INestApplication> {
  const ref = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(STORE_DIR)
    .useValue(dir)
    .compile();
  const app = ref.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();
  return app;
}

describe("Per-user isolation (e2e)", () => {
  let app: INestApplication;
  let store: StoreService;

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    app = await buildApp(mkdtempSync(join(tmpdir(), "ta-iso-")));
    store = app.get(StoreService);
  });
  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());

  it("a user cannot see or fetch another user's runs", async () => {
    const a = await authHeader(app);
    const b = await authHeader(app);
    store.runs.upsert({
      id: "run_A",
      userId: a.userId,
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      assetType: "stock",
      status: "done",
      rating: "Buy",
      selectedAnalysts: null,
      finalStateJson: "{}",
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const aList = await http().get("/api/runs").set(a);
    expect(aList.body.runs.map((r: { id: string }) => r.id)).toContain("run_A");
    expect((await http().get("/api/runs/run_A").set(a)).status).toBe(200);

    const bList = await http().get("/api/runs").set(b);
    expect(bList.body.runs.map((r: { id: string }) => r.id)).not.toContain("run_A");
    expect((await http().get("/api/runs/run_A").set(b)).status).toBe(404);
    expect((await http().get("/api/runs/run_A/report").set(b)).status).toBe(404);
  });

  it("keys are isolated per user", async () => {
    const a = await authHeader(app);
    const b = await authHeader(app);
    await http().put("/api/keys").set(a).send({ env: "OPENAI_API_KEY", value: "sk-a" });
    const bKeys = await http().get("/api/keys").set(b);
    expect(bKeys.body.keys.filter((k: { set: boolean }) => k.set)).toEqual([]);
  });
});

describe("Bootstrap account (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    process.env.AUTH_BOOTSTRAP_EMAIL = "boot@example.com";
    process.env.AUTH_BOOTSTRAP_PASSWORD = "password123";
    app = await buildApp(mkdtempSync(join(tmpdir(), "ta-boot-")));
  });
  afterAll(async () => {
    delete process.env.AUTH_BOOTSTRAP_EMAIL;
    delete process.env.AUTH_BOOTSTRAP_PASSWORD;
    await app.close();
  });

  it("seeds an account that can log in", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({ email: "boot@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("boot@example.com");
  });
});
