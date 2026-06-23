import { Test } from "@nestjs/testing";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EngineModule } from "../src/engine/engine.module.js";
import { EngineService } from "../src/engine/engine.service.js";
import { RunsService } from "../src/engine/runs.service.js";
import { StoreService } from "../src/engine/store.service.js";
import { STORE_DIR } from "../src/engine/tokens.js";

describe("EngineModule (e2e)", () => {
  it("wires a working engine + run manager in DEMO mode", async () => {
    process.env.DEMO_LLM = "1";
    const dir = mkdtempSync(join(tmpdir(), "ta-engine-"));
    const ref = await Test.createTestingModule({ imports: [EngineModule] })
      .overrideProvider(STORE_DIR)
      .useValue(dir)
      .compile();

    expect(typeof ref.get(EngineService).getForUser("u_test").propagate).toBe(
      "function",
    );
    expect(typeof ref.get(RunsService).manager.create).toBe("function");
    expect(ref.get(StoreService).runs.list("u_test")).toEqual([]);

    await ref.close();
  });

  it("rebuilds the engine after invalidate()", async () => {
    process.env.DEMO_LLM = "1";
    const dir = mkdtempSync(join(tmpdir(), "ta-engine-"));
    const ref = await Test.createTestingModule({ imports: [EngineModule] })
      .overrideProvider(STORE_DIR)
      .useValue(dir)
      .compile();

    const svc = ref.get(EngineService);
    const first = svc.getForUser("u_test");
    expect(svc.getForUser("u_test")).toBe(first); // cached
    svc.invalidate("u_test");
    expect(svc.getForUser("u_test")).not.toBe(first); // rebuilt

    await ref.close();
  });
});
