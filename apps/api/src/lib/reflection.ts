/**
 * Cross-run reflection (ports tradingagents/graph/reflection.py +
 * trading_graph._resolve_pending_entries). When a run completes, its decision
 * is recorded as `pending`. Later, resolvePending fetches the hold-period
 * return + benchmark alpha, asks the deep LLM to reflect, and marks the entry
 * resolved — so future runs of the same ticker can learn from it.
 */
import { computeReturns, resolveBenchmark } from "@helm-agents/dataflows";
import { resolveConfig, type ResolvedConfig } from "@helm-agents/config";
import type { Engine } from "@helm-agents/core";
import type { SqliteMemoryRepo } from "@helm-agents/persistence";
import type { RunSnapshot } from "./run-manager.js";

/** Record a completed run's decision as a pending memory entry. */
export function recordDecision(snap: RunSnapshot, repo: SqliteMemoryRepo): void {
  if (snap.status !== "done" || !snap.rating) return;
  let decision = "";
  try {
    const fs = snap.finalStateJson ? (JSON.parse(snap.finalStateJson) as Record<string, unknown>) : {};
    decision = (fs.finalTradeDecision as string) ?? "";
  } catch {
    /* leave decision empty */
  }
  if (!decision) return;
  // Idempotent: a run's onUpdate fires on create (running) and at terminal
  // (done); guard against any future double-terminal by deduping on
  // (ticker, createdAt) so a single decision never yields duplicate entries.
  if (repo.pending(snap.userId, snap.ticker).some((e) => e.createdAt === snap.createdAt)) {
    return;
  }
  repo.append({
    userId: snap.userId,
    ticker: snap.ticker,
    tradeDate: snap.tradeDate,
    rating: snap.rating,
    status: "pending",
    decision,
    createdAt: snap.createdAt,
  });
}

export interface ResolveOptions {
  userId: string;
  ticker: string;
  engine: Engine;
  repo: SqliteMemoryRepo;
  config?: ResolvedConfig;
  holdDays?: number;
  fetchImpl?: typeof fetch;
}

/** Resolve all pending decisions for a ticker via returns + LLM reflection. */
export async function resolvePending(opts: ResolveOptions): Promise<number> {
  const config = opts.config ?? resolveConfig();
  const holdDays = opts.holdDays ?? 5;
  const benchmark =
    config.benchmarkTicker ?? resolveBenchmark(opts.ticker, config.benchmarkMap);
  const pending = opts.repo.pending(opts.userId, opts.ticker);
  let resolved = 0;

  for (const entry of pending) {
    try {
      const ret = await computeReturns(
        opts.ticker,
        entry.tradeDate,
        holdDays,
        benchmark,
        opts.fetchImpl,
      );
      const retPct = ret.symbolReturn ?? 0;
      const alpha = ret.alpha ?? 0;
      const prompt = [
        `On ${entry.tradeDate} a Portfolio Manager rated ${opts.ticker} as ${entry.rating}.`,
        "",
        entry.decision,
        "",
        `Over the following ~${holdDays} trading days the instrument returned ${retPct.toFixed(1)}% vs benchmark ${benchmark} at ${(ret.benchmarkReturn ?? 0).toFixed(1)}% (alpha ${alpha.toFixed(1)}%).`,
        "In 2-3 sentences: did the call hold up, which part of the thesis held or failed, and one reusable lesson.",
      ].join("\n");
      const reflection = await opts.engine.reflect(prompt);
      opts.repo.resolve(entry.id, { reflection, returnPct: retPct, alpha }, Date.now());
      resolved++;
    } catch {
      // Skip entries we can't resolve yet (e.g. market data unavailable).
    }
  }
  return resolved;
}
