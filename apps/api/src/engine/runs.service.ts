import { Injectable } from "@nestjs/common";
import { RunManager } from "../lib/run-manager.js";
import { recordDecision } from "../lib/reflection.js";
import { EngineService } from "./engine.service.js";
import { StoreService } from "./store.service.js";

/**
 * Singleton run manager backed by the engine's event stream + history store.
 * Persistence is best-effort and never blocks a run.
 */
@Injectable()
export class RunsService {
  readonly manager: RunManager;

  constructor(
    private readonly engine: EngineService,
    private readonly store: StoreService,
  ) {
    this.manager = new RunManager(
      (userId, input, signal) =>
        this.engine.getForUser(userId).streamEvents(input, signal),
      {
        onUpdate: (snap) => {
          try {
            this.store.runs.upsert(snap);
            recordDecision(snap, this.store.memory);
          } catch {
            /* persistence is best-effort; never block a run on it */
          }
        },
      },
    );
  }
}
