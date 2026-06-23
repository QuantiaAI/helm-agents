/**
 * Local JSON-file store. For a single-user local tool, a write-through JSON
 * file per table is simple, synchronous, and has zero native dependencies
 * (avoids better-sqlite3's native build and node:sqlite's bundler-resolution
 * quirks). The repo API mirrors what a SQL store would expose.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface JsonStore {
  read<T>(name: string): T[];
  write<T>(name: string, rows: T[]): void;
  close(): void;
}

export function openStore(dir: string): JsonStore {
  mkdirSync(dir, { recursive: true });
  const pathOf = (name: string) => join(dir, `${name}.json`);

  return {
    read<T>(name: string): T[] {
      const p = pathOf(name);
      if (!existsSync(p)) return [];
      try {
        return JSON.parse(readFileSync(p, "utf8")) as T[];
      } catch {
        return [];
      }
    },
    write<T>(name: string, rows: T[]): void {
      writeFileSync(pathOf(name), JSON.stringify(rows, null, 2));
    },
    close() {
      /* nothing to flush — writes are synchronous */
    },
  };
}
