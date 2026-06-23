import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { DocsModule } from "../src/docs/docs.module.js";

describe("Docs (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const root = mkdtempSync(join(tmpdir(), "ta-docs-"));
    mkdirSync(join(root, "guide"), { recursive: true });
    writeFileSync(join(root, "guide", "intro.md"), "# Intro\nhello");
    process.env.DOCS_ROOT = root;

    const ref = await Test.createTestingModule({
      imports: [DocsModule],
    }).compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix("api");
    await app.init();
  });

  afterAll(async () => {
    delete process.env.DOCS_ROOT;
    await app.close();
  });

  it("serves a markdown doc by path", async () => {
    const res = await request(app.getHttpServer()).get(
      "/api/docs/guide/intro.md",
    );
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/markdown");
    expect(res.text).toContain("# Intro");
  });

  it("404s a missing doc", async () => {
    const res = await request(app.getHttpServer()).get(
      "/api/docs/guide/missing.md",
    );
    expect(res.status).toBe(404);
  });

  it("rejects path traversal (percent-encoded dots reach the server guard)", async () => {
    // Literal `..` segments are normalized away by the HTTP client before the
    // request is sent, so the server guard would never see them. Percent-encode
    // the dots so the controller actually receives a traversal payload.
    const res = await request(app.getHttpServer()).get(
      "/api/docs/%2e%2e/%2e%2e/etc/passwd.md",
    );
    expect(res.status).toBe(404);
  });
});
