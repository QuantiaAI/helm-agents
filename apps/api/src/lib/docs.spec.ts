import { describe, it, expect } from "vitest";
import { resolveDocPath } from "./docs.js";

const ROOT = "/repo/docs";

describe("resolveDocPath", () => {
  it("resolves a normal nested .md path under the docs root", () => {
    expect(resolveDocPath(["superpowers", "specs", "a.md"], ROOT)).toBe(
      "/repo/docs/superpowers/specs/a.md",
    );
  });

  it("rejects path traversal that escapes the docs root", () => {
    expect(resolveDocPath(["..", "..", "etc", "passwd.md"], ROOT)).toBeNull();
    expect(resolveDocPath(["..", "secrets.md"], ROOT)).toBeNull();
  });

  it("rejects non-markdown files", () => {
    expect(resolveDocPath(["a.txt"], ROOT)).toBeNull();
    expect(resolveDocPath(["keys.json"], ROOT)).toBeNull();
  });

  it("rejects an empty slug", () => {
    expect(resolveDocPath([], ROOT)).toBeNull();
  });
});
