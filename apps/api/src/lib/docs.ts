/**
 * Read-only access to the repo's `docs/` markdown, exposed at GET /api/docs/*.
 * The files live at the monorepo root (outside the api app), so they are read
 * via fs at request time — a local-dev/reference tool.
 */
import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";

/**
 * Monorepo `docs/` dir. Defaults to two levels up from the app cwd (apps/api),
 * overridable via DOCS_ROOT for deployments where docs live elsewhere.
 * Resolved per-call (not a module const) so tests can point it at a fixture.
 */
export function docsRoot(): string {
  return process.env.DOCS_ROOT
    ? resolve(process.env.DOCS_ROOT)
    : resolve(process.cwd(), "..", "..", "docs");
}

/**
 * Resolve a URL slug to an absolute path under the docs root, or null if the
 * slug is empty, not a `.md` file, or escapes the root (path-traversal guard).
 */
export function resolveDocPath(
  slug: string[],
  root: string = docsRoot(),
): string | null {
  if (!slug.length) return null;
  const rel = slug.join("/");
  if (!rel.endsWith(".md")) return null;
  const abs = resolve(root, rel);
  if (abs !== root && !abs.startsWith(root + sep)) return null;
  return abs;
}

/** Read a doc by slug, or null if the slug is invalid or the file is missing. */
export function readDoc(slug: string[]): string | null {
  const abs = resolveDocPath(slug);
  if (!abs) return null;
  try {
    return readFileSync(abs, "utf8");
  } catch {
    return null;
  }
}
