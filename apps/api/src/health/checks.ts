/**
 * Backend self-checks for `GET /api/health`. Each is cheap, synchronous, and
 * makes NO external/network calls — they prove the process itself is wired up
 * and its on-disk store + key cipher are usable. Per-service reachability
 * (LLM/data vendors) is intentionally NOT here: that needs per-user credentials
 * and live probes (cost / rate limits) and lives elsewhere if ever needed.
 */
import { resolveConfig } from "@helm-agents/config";
import { listProviders } from "@helm-agents/llm";
import type { HealthCheck } from "@helm-agents/contracts";
import { KeyCipher } from "../lib/key-cipher.js";
import { mkdirSync, writeFileSync, readFileSync, unlinkSync } from "node:fs";
import { join, dirname } from "node:path";

/** Resolved on-disk store dir (mirrors EngineModule's STORE_DIR factory). */
export function defaultStoreDir(): string {
  return join(dirname(resolveConfig().resultsDir), "store");
}

function run(key: string, label: string, fn: () => void): HealthCheck {
  const t0 = Date.now();
  try {
    fn();
    return { key, label, ok: true, latencyMs: Date.now() - t0 };
  } catch (e) {
    return {
      key,
      label,
      ok: false,
      latencyMs: Date.now() - t0,
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Run all self-checks against the given store directory. Pure + testable. */
export function runHealthChecks(storeDir: string): HealthCheck[] {
  // PID-suffixed so concurrent probes (e.g. repeated container healthchecks)
  // never collide on the same sentinel file.
  const probe = join(storeDir, `.health-probe-${process.pid}`);
  return [
    run("config", "Config", () => {
      resolveConfig();
    }),
    run("registry", "LLM registry", () => {
      if (listProviders().length === 0) throw new Error("no providers registered");
    }),
    run("store", "Store (read/write)", () => {
      mkdirSync(storeDir, { recursive: true });
      writeFileSync(probe, "1");
      if (readFileSync(probe, "utf8") !== "1") throw new Error("roundtrip mismatch");
      unlinkSync(probe);
    }),
    run("cipher", "Key cipher (AES-256-GCM)", () => {
      const c = new KeyCipher(storeDir);
      const sealed = c.encrypt("ping");
      if (c.decrypt(sealed) !== "ping") throw new Error("decrypt mismatch");
    }),
  ];
}
