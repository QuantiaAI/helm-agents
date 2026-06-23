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
import { RunManager } from "../src/lib/run-manager.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";
import { authHeader } from "./helpers/auth.js";

// A run whose only event (done) arrives after a delay longer than the heartbeat
// interval — so the stream must emit keep-alive newlines while idle.
function slowManager(): RunManager {
  return new RunManager(() => {
    async function* gen(): AsyncGenerator<RunEvent> {
      await new Promise((r) => setTimeout(r, 150));
      yield { type: "done", rating: "Buy", finalState: {} as never };
    }
    return gen();
  });
}

describe("Run stream heartbeat (e2e)", () => {
  let app: INestApplication;
  const manager = slowManager();
  let auth: { Authorization: string };

  beforeAll(async () => {
    process.env.DEMO_LLM = "1";
    process.env.AUTH_JWT_SECRET ??= "test-secret";
    process.env.STREAM_HEARTBEAT_MS = "25"; // fire several times during the 150ms gap
    const dir = mkdtempSync(join(tmpdir(), "ta-hb-"));
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
    auth = await authHeader(app);
  });

  afterAll(async () => {
    delete process.env.STREAM_HEARTBEAT_MS;
    await app.close();
  });

  it("emits keep-alive newlines while idle, then the terminal event", async () => {
    const create = await request(app.getHttpServer())
      .post("/api/runs")
      .set(auth)
      .send({ ticker: "NVDA", tradeDate: "2024-05-10" });
    const runId = create.body.runId;

    const res = await request(app.getHttpServer())
      .get(`/api/runs/${runId}/stream`)
      .set(auth);
    expect(res.status).toBe(200);

    // Blank-line heartbeats appear before the single JSON event (≥1 empty line).
    const emptyLines = res.text.split("\n").filter((l) => l === "").length;
    expect(emptyLines).toBeGreaterThan(0);

    // The real event still arrives and parses.
    const events = res.text
      .split("\n")
      .filter((l) => l.trim())
      .map((l) => JSON.parse(l));
    expect(events.at(-1)).toMatchObject({ type: "done", rating: "Buy" });
  });
});
