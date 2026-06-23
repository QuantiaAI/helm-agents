export type ModelMode = "quick" | "deep";

export interface ModelOption {
  label: string;
  modelId: string;
}

export interface SettingsProvider {
  name: string;
  interface: "openai" | "anthropic";
}

/** `GET /api/models` with no provider — the full provider list. */
export interface ModelsProvidersResponse {
  providers: string[];
}

/** `GET /api/models?provider=&mode=` — models for one provider/mode. */
export interface ModelsForProviderResponse {
  provider: string;
  mode: ModelMode;
  models: ModelOption[];
  customOnly: boolean;
}

export type ModelsResponse = ModelsProvidersResponse | ModelsForProviderResponse;
