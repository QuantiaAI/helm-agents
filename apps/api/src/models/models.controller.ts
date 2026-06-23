import { Controller, Get, Query } from "@nestjs/common";
import { getModelOptions, isCustomOnly, listProviders } from "@helm-agents/llm";
import type { ModelsResponse } from "@helm-agents/contracts";

@Controller("models")
export class ModelsController {
  /**
   * GET /api/models?provider=openai&mode=quick
   * Returns the model options for a provider/mode, or the full provider list
   * when no provider is given.
   */
  @Get()
  models(
    @Query("provider") provider?: string,
    @Query("mode") mode?: string,
  ): ModelsResponse {
    if (!provider) {
      return { providers: listProviders() };
    }
    const m = mode === "deep" ? "deep" : "quick";
    return {
      provider,
      mode: m,
      models: getModelOptions(provider, m),
      customOnly: isCustomOnly(provider),
    };
  }
}
