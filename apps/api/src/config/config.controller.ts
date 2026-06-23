import { Body, Controller, Get, Put } from "@nestjs/common";
import { resolveConfig } from "@helm-agents/config";
import { listSettingsProviders, getModelOptions } from "@helm-agents/llm";
import type {
  ConfigResponse,
  ConfigUpdateResponse,
  Settings,
} from "@helm-agents/contracts";
import { SettingsService } from "../engine/settings.service.js";
import { EngineService } from "../engine/engine.service.js";
import { CurrentUser, type AuthUser } from "../auth/current-user.decorator.js";

@Controller("config")
export class ConfigController {
  constructor(
    private readonly settings: SettingsService,
    private readonly engine: EngineService,
  ) {}

  /** Current stored settings + the resolved defaults + provider/model lists. */
  @Get()
  get(@CurrentUser() user: AuthUser): ConfigResponse {
    const defaults = resolveConfig();
    const settings = this.settings.get(user.id);
    const provider = settings.llmProvider ?? defaults.llmProvider;
    return {
      settings,
      defaults: {
        llmProvider: defaults.llmProvider,
        deepThinkLlm: defaults.deepThinkLlm,
        quickThinkLlm: defaults.quickThinkLlm,
        outputLanguage: defaults.outputLanguage,
        maxDebateRounds: defaults.maxDebateRounds,
        maxRiskDiscussRounds: defaults.maxRiskDiscussRounds,
        dataVendors: defaults.dataVendors,
      },
      providers: listSettingsProviders(),
      deepModels: getModelOptions(provider, "deep"),
      quickModels: getModelOptions(provider, "quick"),
    };
  }

  /** Update stored settings, then invalidate the engine so the next run sees them. */
  @Put()
  update(@CurrentUser() user: AuthUser, @Body() body: Settings): ConfigUpdateResponse {
    this.settings.update(user.id, body);
    this.engine.invalidate(user.id);
    return { ok: true, settings: this.settings.get(user.id) };
  }
}
