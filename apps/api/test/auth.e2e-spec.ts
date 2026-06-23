import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { AppModule } from "../src/app.module.js";
import { STORE_DIR } from "../src/engine/tokens.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";

describe("Auth (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET = "test-secret";
    const dir = mkdtempSync(join(tmpdir(), "ta-auth-e2e-"));
    const ref = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(STORE_DIR)
      .useValue(dir)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix("api");
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const http = () => request(app.getHttpServer());
  const email = `user_${process.pid}@example.com`;

  it("registers a user and returns tokens", async () => {
    const res = await http().post("/api/auth/register").send({ email, password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(typeof res.body.accessToken).toBe("string");
    expect(typeof res.body.refreshToken).toBe("string");
  });

  it("rejects duplicate registration with 409", async () => {
    const res = await http().post("/api/auth/register").send({ email, password: "password123" });
    expect(res.status).toBe(409);
  });

  it("rejects a short password with 400", async () => {
    const res = await http().post("/api/auth/register").send({ email: "x@y.com", password: "short" });
    expect(res.status).toBe(400);
  });

  it("logs in and reaches /me with the token; rejects wrong password and no token", async () => {
    const bad = await http().post("/api/auth/login").send({ email, password: "nope" });
    expect(bad.status).toBe(401);

    const ok = await http().post("/api/auth/login").send({ email, password: "password123" });
    expect(ok.status).toBe(200);
    const token = ok.body.accessToken as string;

    const me = await http().get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.email).toBe(email);

    const noAuth = await http().get("/api/auth/me");
    expect(noAuth.status).toBe(401);
  });

  it("rotates refresh tokens (old one becomes invalid)", async () => {
    const login = await http().post("/api/auth/login").send({ email, password: "password123" });
    const rt = login.body.refreshToken as string;

    const r1 = await http().post("/api/auth/refresh").send({ refreshToken: rt });
    expect(r1.status).toBe(200);
    expect(typeof r1.body.accessToken).toBe("string");

    // old refresh token was rotated → revoked
    const reuse = await http().post("/api/auth/refresh").send({ refreshToken: rt });
    expect(reuse.status).toBe(401);
  });

  it("protects a domain endpoint: GET /api/runs is 401 without a token", async () => {
    const res = await http().get("/api/runs");
    expect(res.status).toBe(401);
  });
});
