import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createTestApp } from "./utils.js";
import { authHeader } from "./helpers/auth.js";

describe("Models (e2e)", () => {
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

  it("lists providers when no provider given", async () => {
    const res = await request(app.getHttpServer()).get("/api/models").set(auth);
    expect(res.status).toBe(200);
    expect(res.body.providers).toContain("openai");
    expect(res.body.providers).toContain("anthropic");
  });

  it("returns model options for a provider+mode", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/models?provider=openai&mode=deep")
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.provider).toBe("openai");
    expect(res.body.mode).toBe("deep");
    expect(
      res.body.models.some((m: { modelId: string }) => m.modelId === "gpt-5.5"),
    ).toBe(true);
    expect(res.body.customOnly).toBe(false);
  });

  it("flags custom-only providers", async () => {
    const res = await request(app.getHttpServer())
      .get("/api/models?provider=groq&mode=quick")
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body.customOnly).toBe(true);
    expect(res.body.models).toEqual([]);
  });
});
