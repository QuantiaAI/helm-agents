import { Test } from "@nestjs/testing";
import type { INestApplication } from "@nestjs/common";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AppModule } from "../src/app.module.js";
import { STORE_DIR } from "../src/engine/tokens.js";
import { AllExceptionsFilter } from "../src/common/all-exceptions.filter.js";

/**
 * Boot the full app for e2e tests against an isolated temp store dir, in DEMO
 * mode (deterministic stub LLM, no external keys). Mirrors production bootstrap
 * (global `/api` prefix).
 */
export async function createTestApp(): Promise<INestApplication> {
  process.env.DEMO_LLM = "1";
  const dir = mkdtempSync(join(tmpdir(), "ta-api-"));
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
