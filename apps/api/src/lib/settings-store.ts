/**
 * Runtime settings store (settings.json). Holds engine-relevant overrides
 * (provider, models, debate rounds, language, data vendors) plus UI defaults.
 * Merged on top of DEFAULT_CONFIG → env when the engine is built.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FILE = "settings.json";

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

export class SettingsStore {
  private file: string;
  private cached: Settings | null = null;

  constructor(storeDir: string) {
    mkdirSync(storeDir, { recursive: true });
    this.file = join(storeDir, FILE);
  }

  get(): Settings {
    if (!this.cached) {
      try {
        this.cached = JSON.parse(readFileSync(this.file, "utf8")) as Settings;
      } catch {
        this.cached = {};
      }
    }
    return this.cached!;
  }

  update(patch: Settings): Settings {
    this.cached = { ...this.get(), ...patch };
    writeFileSync(this.file, JSON.stringify(this.cached, null, 2));
    return this.cached;
  }
}
