import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runHealthChecks, defaultStoreDir } from "./checks.js";

describe("runHealthChecks", () => {
  it("runs config/registry/store/cipher and all pass on a writable temp dir", () => {
    const dir = mkdtempSync(join(tmpdir(), "helm-health-"));
    const checks = runHealthChecks(dir);
    expect(checks.map((c) => c.key)).toEqual([
      "config",
      "registry",
      "store",
      "cipher",
    ]);
    for (const c of checks) {
      expect(c.ok).toBe(true);
      expect(c.label).toBeTruthy();
      expect(typeof c.latencyMs).toBe("number");
      expect(c.latencyMs).toBeGreaterThanOrEqual(0);
    }
  });

  it("marks store + cipher as failing (with detail) when the dir is not writable", () => {
    // /dev/null is a file, so creating anything beneath it fails with ENOTDIR.
    const checks = runHealthChecks(join("/dev/null", "cant"));
    const byKey = Object.fromEntries(checks.map((c) => [c.key, c]));
    expect(byKey.config?.ok).toBe(true);
    expect(byKey.registry?.ok).toBe(true);
    expect(byKey.store?.ok).toBe(false);
    expect(byKey.store?.detail).toBeTruthy();
    expect(byKey.cipher?.ok).toBe(false);
    expect(byKey.cipher?.detail).toBeTruthy();
  });

  it("defaultStoreDir resolves to .../store under the config results dir", () => {
    expect(defaultStoreDir().endsWith("store")).toBe(true);
  });
});
