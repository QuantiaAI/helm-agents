import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp } from "./utils.js";
import { authHeader } from "./helpers/auth.js";

describe("Config (e2e)", () => {
  let app: INestApplication;
  let auth: { Authorization: string };

  beforeAll(async () => {
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    app = await createTestApp();
    auth = await authHeader(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api/config returns settings, defaults, providers, and models", async () => {
    const res = await request(app.getHttpServer()).get("/api/config").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.settings).toBeTypeOf("object");
    expect(res.body.defaults.llmProvider).toBeTypeOf("string");
    expect(Array.isArray(res.body.providers)).toBe(true);
    expect(Array.isArray(res.body.deepModels)).toBe(true);
    expect(Array.isArray(res.body.quickModels)).toBe(true);
  });

  it("PUT /api/config persists settings and echoes them back", async () => {
    const res = await request(app.getHttpServer())
      .put("/api/config")
      .set(auth)
      .send({ outputLanguage: "Japanese", maxDebateRounds: 2 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.settings.outputLanguage).toBe("Japanese");
    expect(res.body.settings.maxDebateRounds).toBe(2);

    // Persisted: a subsequent GET reflects the update.
    const after = await request(app.getHttpServer()).get("/api/config").set(auth);
    expect(after.body.settings.outputLanguage).toBe("Japanese");
  });
});
