import { Module } from "@nestjs/common";
import { dirname, join } from "node:path";
import { resolveConfig } from "@helm-agents/config";
import { STORE_DIR } from "./tokens.js";
import { StoreService } from "./store.service.js";
import { SettingsService } from "./settings.service.js";
import { KeysService } from "./keys.service.js";
import { EngineService } from "./engine.service.js";
import { RunsService } from "./runs.service.js";

/**
 * Core wiring shared by every feature module: store/repos, settings, keys,
 * the lazily-built engine, and the run manager. All singletons.
 */
@Module({
  providers: [
    {
      provide: STORE_DIR,
      useFactory: () => join(dirname(resolveConfig().resultsDir), "store"),
    },
    StoreService,
    SettingsService,
    KeysService,
    EngineService,
    RunsService,
  ],
  exports: [
    StoreService,
    SettingsService,
    KeysService,
    EngineService,
    RunsService,
  ],
})
export class EngineModule {}
