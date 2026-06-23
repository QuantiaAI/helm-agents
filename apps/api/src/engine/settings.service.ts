import { Injectable } from "@nestjs/common";
import type { Settings } from "../lib/settings-store.js";
import { StoreService } from "./store.service.js";

/** Per-user settings (stored as a JSON blob in SQLite). */
@Injectable()
export class SettingsService {
  constructor(private readonly store: StoreService) {}

  get(userId: string): Settings {
    return this.store.userSettings.get(userId) as Settings;
  }

  update(userId: string, patch: Settings): Settings {
    const merged = { ...this.get(userId), ...patch };
    this.store.userSettings.set(userId, merged as Record<string, unknown>, Date.now());
    return merged;
  }
}
