/**
 * Row schemas for the local JSON-file store (zero native deps). Two logical
 * tables:
 *  - runs: completed/ongoing analysis runs (the Web UI history source)
 *  - memory_log: cross-run decision memory for the reflection feature (Phase 4)
 *
 * Zod describes the row shape; the JSON store persists plain objects.
 *
 * Deviation note: the design spec called for SQLite + Drizzle. The sandbox
 * could not build better-sqlite3 (no native toolchain) and node:sqlite hit
 * bundler-resolution issues under Vite, so a write-through JSON store is used
 * instead. The repo API is unchanged; see README for rationale.
 */
import { z } from "zod";

export const RunRowSchema = z.object({
  id: z.string(),
  ticker: z.string(),
  tradeDate: z.string(),
  assetType: z.string(),
  status: z.string(),
  rating: z.string().nullable(),
  selectedAnalysts: z.string().nullable(),
  finalStateJson: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type RunRow = z.infer<typeof RunRowSchema>;

export interface RunInsert {
  id: string;
  ticker: string;
  tradeDate: string;
  assetType: string;
  status: string;
  rating?: string | null;
  selectedAnalysts?: string | null;
  finalStateJson?: string | null;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
}

export const MemoryRowSchema = z.object({
  id: z.number(),
  ticker: z.string(),
  tradeDate: z.string(),
  rating: z.string(),
  status: z.string(),
  decision: z.string(),
  reflection: z.string().nullable(),
  returnPct: z.number().nullable(),
  alpha: z.number().nullable(),
  createdAt: z.number(),
  resolvedAt: z.number().nullable(),
});
export type MemoryRow = z.infer<typeof MemoryRowSchema>;

export interface MemoryInsert {
  ticker: string;
  tradeDate: string;
  rating: string;
  status: string;
  decision: string;
  createdAt: number;
}
