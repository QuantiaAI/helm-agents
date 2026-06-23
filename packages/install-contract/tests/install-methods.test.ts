/**
 * Install-method contract tests.
 *
 * The README promises two one-click install paths. These tests guard that
 * contract from drift: if someone renames the script, drops a Dockerfile,
 * changes the published port, or lets the docs disagree with the engine
 * range, one of these fails. They are static (no Docker/network needed), so
 * they run inside the normal `pnpm test` / CI on every change.
 *
 * Black-box: we assert observable artifacts (files, ports, documented
 * commands), never internal implementation detail.
 */
import { describe, it, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function findRepoRoot(start: string): string {
  let dir = start;
  while (dir !== dirname(dir)) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    dir = dirname(dir);
  }
  throw new Error("repo root (pnpm-workspace.yaml) not found");
}

const ROOT = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** Required Node major, derived from package.json#engines.node (single source of truth). */
const NODE_MAJOR = (() => {
  const pkg = JSON.parse(read("package.json"));
  const m = String(pkg.engines?.node ?? "").match(/(\d+)/);
  if (!m) throw new Error("package.json#engines.node has no major version");
  return m[1];
})();

const READMES = ["README.md", "README.en.md"]; // primary (zh) + English

describe("Option A — local one-click script (scripts/install.sh)", () => {
  const SCRIPT = "scripts/install.sh";
  const sh = read(SCRIPT);

  it("exists and is executable", () => {
    expect(existsSync(join(ROOT, SCRIPT))).toBe(true);
    // owner/group/other execute bit set — required for `./scripts/install.sh`
    expect(statSync(join(ROOT, SCRIPT)).mode & 0o111).not.toBe(0);
  });

  it("is a fail-fast bash script", () => {
    expect(sh).toMatch(/^#!.*\bbash\b/);
    expect(sh).toMatch(/set -[a-z]*e[a-z]*o pipefail/);
  });

  it("gates on the Node version declared in package.json", () => {
    expect(sh).toContain("package.json");
    expect(sh).toMatch(/engines\??\.?\.?node/); // reads engines.node
  });

  it("installs, builds, then starts the app", () => {
    expect(sh).toMatch(/pnpm install/);
    expect(sh).toMatch(/pnpm build/);
    expect(sh).toMatch(/pnpm dev/); // exec pnpm dev at the end
  });

  it("points the user at the documented web URL", () => {
    expect(sh).toContain("http://localhost:5170");
  });
});

describe("Option B — Docker one-click (docker-compose.yml)", () => {
  const compose = read("docker-compose.yml");

  it("compose file and both Dockerfiles exist", () => {
    expect(existsSync(join(ROOT, "docker-compose.yml"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/api/Dockerfile"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/web/Dockerfile"))).toBe(true);
  });

  it("defines the api and web services", () => {
    expect(compose).toMatch(/\n {2}api:/);
    expect(compose).toMatch(/\n {2}web:/);
  });

  it("builds each service from its Dockerfile", () => {
    expect(compose).toContain("apps/api/Dockerfile");
    expect(compose).toContain("apps/web/Dockerfile");
  });

  it("publishes the web SPA on the documented port 8080", () => {
    expect(compose).toMatch(/["']?8080:80["']?/);
  });

  it("persists data in a named volume", () => {
    expect(compose).toMatch(/helmagents-store/);
  });
});

describe("README documents both methods and stays consistent", () => {
  it.each(READMES)("%s documents Option A (install.sh)", (file) => {
    expect(read(file)).toContain("scripts/install.sh");
  });

  it.each(READMES)("%s documents Option B (docker compose + port 8080)", (file) => {
    const md = read(file);
    expect(md).toMatch(/docker compose up/);
    expect(md).toContain("localhost:8080");
  });

  it.each(READMES)("%s states the same Node major as package.json", (file) => {
    expect(read(file)).toMatch(new RegExp(`≥\\s*${NODE_MAJOR}`));
  });
});
