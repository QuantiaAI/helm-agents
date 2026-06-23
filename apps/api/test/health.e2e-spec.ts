import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp } from "./utils.js";

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/health returns ok", async () => {
    const res = await request(app.getHttpServer()).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.service).toBe("tradingagents-api");
  });
});
