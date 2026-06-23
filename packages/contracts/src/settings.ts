import type { ModelOption, SettingsProvider } from "./models.js";

/** Persisted runtime settings (settings.json), merged over DEFAULT_CONFIG → env. */
export interface Settings {
  llmProvider?: string;
  deepThinkLlm?: string;
  quickThinkLlm?: string;
  backendUrl?: string;
  outputLanguage?: string;
  maxDebateRounds?: number;
  maxRiskDiscussRounds?: number;
  selectedAnalystsDefault?: string[];
  dataVendors?: Record<string, string>;
}

/** The resolved engine defaults surfaced alongside stored settings. */
export interface ConfigDefaults {
  llmProvider: string;
  deepThinkLlm: string;
  quickThinkLlm: string;
  outputLanguage: string;
  maxDebateRounds: number;
  maxRiskDiscussRounds: number;
  dataVendors: Record<string, string>;
}

/** Response of `GET /api/config`. */
export interface ConfigResponse {
  settings: Settings;
  defaults: ConfigDefaults;
  providers: SettingsProvider[];
  deepModels: ModelOption[];
  quickModels: ModelOption[];
}

/** Response of `PUT /api/config`. */
export interface ConfigUpdateResponse {
  ok: true;
  settings: Settings;
}
