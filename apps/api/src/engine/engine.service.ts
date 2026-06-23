import { Injectable } from "@nestjs/common";
import { resolveConfig } from "@helm-agents/config";
import { createEngine, type Engine } from "@helm-agents/core";
import { createLlmClient, type LlmClient } from "@helm-agents/llm";
import { createDemoLlm } from "../lib/demo-llm.js";
import type { Settings } from "../lib/settings-store.js";
import { SettingsService } from "./settings.service.js";
import { KeysService } from "./keys.service.js";

/** When DEMO_LLM=1, run the full pipeline against a deterministic stub LLM
 *  (no external key) so the UI can be exercised end-to-end offline. */
function demoOverrides(): { quick: LlmClient; deep: LlmClient } | undefined {
  if (process.env.DEMO_LLM !== "1") return undefined;
  const demo = createDemoLlm();
  return { quick: demo, deep: demo };
}

/** Project stored settings onto engine runtime overrides (only set fields). */
export function settingsToRuntime(settings: Settings): Record<string, unknown> {
  const runtime: Record<string, unknown> = {};
  if (settings.llmProvider) runtime.llmProvider = settings.llmProvider;
  if (settings.deepThinkLlm) runtime.deepThinkLlm = settings.deepThinkLlm;
  if (settings.quickThinkLlm) runtime.quickThinkLlm = settings.quickThinkLlm;
  if (settings.backendUrl) runtime.backendUrl = settings.backendUrl;
  if (settings.outputLanguage) runtime.outputLanguage = settings.outputLanguage;
  if (settings.maxDebateRounds) runtime.maxDebateRounds = settings.maxDebateRounds;
  if (settings.maxRiskDiscussRounds)
    runtime.maxRiskDiscussRounds = settings.maxRiskDiscussRounds;
  if (settings.dataVendors) runtime.dataVendors = settings.dataVendors;
  return runtime;
}

/**
 * Builds (and caches) a per-user engine. Config is DEFAULT_CONFIG → env → the
 * user's stored settings; the user's API keys are injected as explicit LLM
 * clients (never process.env) so concurrent users stay isolated.
 */
@Injectable()
export class EngineService {
  private cache = new Map<string, Engine>();

  constructor(
    private readonly settings: SettingsService,
    private readonly keys: KeysService,
  ) {}

  getForUser(userId: string): Engine {
    let engine = this.cache.get(userId);
    if (!engine) {
      const runtime = settingsToRuntime(this.settings.get(userId));
      const config = resolveConfig({ runtime: runtime as never });
      let overrides = demoOverrides();
      if (!overrides) {
        const env = this.keys.envMap(userId);
        const base = {
          provider: config.llmProvider,
          baseUrl: config.backendUrl ?? undefined,
          env,
        };
        overrides = {
          quick: createLlmClient({ ...base, model: config.quickThinkLlm }),
          deep: createLlmClient({ ...base, model: config.deepThinkLlm }),
        };
      }
      engine = createEngine(config, overrides);
      this.cache.set(userId, engine);
    }
    return engine;
  }

  /** Drop a user's cached engine so their next run picks up new settings/keys. */
  invalidate(userId: string): void {
    this.cache.delete(userId);
  }
}
