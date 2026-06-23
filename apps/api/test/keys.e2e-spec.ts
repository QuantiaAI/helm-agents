import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp } from "./utils.js";
import { authHeader } from "./helpers/auth.js";

describe("Keys (e2e)", () => {
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

  it("GET /api/keys lists masked key status", async () => {
    const res = await request(app.getHttpServer()).get("/api/keys").set(auth);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.keys)).toBe(true);
    const openai = res.body.keys.find(
      (k: { env: string }) => k.env === "OPENAI_API_KEY",
    );
    expect(openai).toBeDefined();
    expect(openai.set).toBe(false);
  });

  it("PUT /api/keys sets a key and never leaks the secret", async () => {
    const res = await request(app.getHttpServer())
      .put("/api/keys")
      .set(auth)
      .send({ env: "OPENAI_API_KEY", value: "sk-secret-123" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain("sk-secret-123");
    const openai = res.body.keys.find(
      (k: { env: string }) => k.env === "OPENAI_API_KEY",
    );
    expect(openai.set).toBe(true);

    // Persisted across requests.
    const after = await request(app.getHttpServer()).get("/api/keys").set(auth);
    const openaiAfter = after.body.keys.find(
      (k: { env: string }) => k.env === "OPENAI_API_KEY",
    );
    expect(openaiAfter.set).toBe(true);
  });

  it("PUT /api/keys rejects missing fields with 400", async () => {
    const res = await request(app.getHttpServer())
      .put("/api/keys")
      .set(auth)
      .send({ env: "OPENAI_API_KEY" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("env and value are required");
  });
});
