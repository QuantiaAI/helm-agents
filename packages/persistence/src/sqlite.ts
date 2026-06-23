/**
 * SQLite-backed store for multi-tenant data. Uses the built-in `node:sqlite`
 * (Node ≥ 22) — zero native dependency, single-file DB, real indexes/queries
 * for per-user isolation. A minimal `Db` interface decouples repos from the
 * node:sqlite types (which may lag in @types/node).
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

// Load node:sqlite at runtime via createRequire so bundlers (Vite/vitest) don't
// try to statically resolve it — it's newer than their builtin lists.
const nodeRequire = createRequire(import.meta.url);
const { DatabaseSync } = nodeRequire("node:sqlite") as {
  DatabaseSync: new (path: string) => Db;
};

export interface Stmt {
  run(...params: unknown[]): unknown;
  get(...params: unknown[]): Record<string, unknown> | undefined;
  all(...params: unknown[]): Record<string, unknown>[];
}
export interface Db {
  exec(sql: string): void;
  prepare(sql: string): Stmt;
  close(): void;
}

const MIGRATIONS = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  tokenHash TEXT NOT NULL UNIQUE,
  expiresAt INTEGER NOT NULL,
  revoked INTEGER NOT NULL DEFAULT 0,
  createdAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens(userId);

CREATE TABLE IF NOT EXISTS user_keys (
  userId TEXT NOT NULL,
  env TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  PRIMARY KEY (userId, env)
);

CREATE TABLE IF NOT EXISTS user_settings (
  userId TEXT PRIMARY KEY,
  json TEXT NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  ticker TEXT NOT NULL,
  tradeDate TEXT NOT NULL,
  assetType TEXT NOT NULL,
  status TEXT NOT NULL,
  rating TEXT,
  selectedAnalysts TEXT,
  finalStateJson TEXT,
  error TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_runs_user ON runs(userId, createdAt);

CREATE TABLE IF NOT EXISTS memory_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId TEXT NOT NULL,
  ticker TEXT NOT NULL,
  tradeDate TEXT NOT NULL,
  rating TEXT NOT NULL,
  status TEXT NOT NULL,
  decision TEXT NOT NULL,
  reflection TEXT,
  returnPct REAL,
  alpha REAL,
  createdAt INTEGER NOT NULL,
  resolvedAt INTEGER
);
CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_log(userId, status);
`;

/** Open (and migrate) the SQLite database under `dir`. */
export function openDb(dir: string): Db {
  mkdirSync(dir, { recursive: true });
  const db = new DatabaseSync(join(dir, "app.db")) as Db;
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(MIGRATIONS);
  return db;
}
