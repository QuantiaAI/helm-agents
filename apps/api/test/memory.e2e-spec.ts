import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp } from "./utils.js";
import { authHeader } from "./helpers/auth.js";
import { StoreService } from "../src/engine/store.service.js";

describe("Memory (e2e)", () => {
  let app: INestApplication;
  let store: StoreService;
  let auth: { Authorization: string; userId: string };

  beforeAll(async () => {
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    app = await createTestApp();
    store = app.get(StoreService);
    auth = await authHeader(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/memory returns recent + pending (empty initially)", async () => {
    const res = await request(app.getHttpServer()).get("/api/memory").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.recent).toEqual([]);
    expect(res.body.pending).toEqual([]);
  });

  it("GET /api/memory?ticker= surfaces a seeded pending entry", async () => {
    store.memory.append({
      userId: auth.userId,
      ticker: "NVDA",
      tradeDate: "2024-05-10",
      rating: "Buy",
      status: "pending",
      decision: "Buy",
      createdAt: Date.now(),
    });
    const res = await request(app.getHttpServer())
      .get("/api/memory?ticker=NVDA")
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.pending).toHaveLength(1);
    expect(res.body.pending[0].ticker).toBe("NVDA");
  });

  it("POST /api/memory rejects a missing ticker with 400", async () => {
    const res = await request(app.getHttpServer()).post("/api/memory").set(auth);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ticker query param required");
  });

  it("POST /api/memory with no pending entries resolves zero (no network)", async () => {
    const res = await request(app.getHttpServer())
      .post("/api/memory?ticker=ZZZZ")
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.resolved).toBe(0);
    expect(res.body.pending).toEqual([]);
  });
});
