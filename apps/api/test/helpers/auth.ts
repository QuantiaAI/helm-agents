import type { INestApplication } from "@nestjs/common";
import request from "supertest";

let n = 0;

/**
 * Register a fresh user and return an Authorization header for protected
 * endpoints. Each call uses a unique email so tests stay independent.
 */
export async function authHeader(
  app: INestApplication,
): Promise<{ Authorization: string; userId: string }> {
  const email = `t${process.pid}_${n++}@example.com`;
  const res = await request(app.getHttpServer())
    .post("/api/auth/register")
    .send({ email, password: "password123" });
  if (res.status !== 200) {
    throw new Error(`register failed in test setup: ${res.status} ${JSON.stringify(res.body)}`);
  }
  // userId is harmless as an extra header on `.set(auth)`, and lets a test seed
  // rows owned by the authenticated user.
  return { Authorization: `Bearer ${res.body.accessToken}`, userId: res.body.user.id };
}
