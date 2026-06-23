import type { AnalyzeInput, RunEvent } from "@helm-agents/core";

/**
 * In-memory run manager for single-process local use. A run is created via
 * create(); callers subscribe() to an async iterator that drains buffered
 * events then streams live ones until the run terminates. The engine stream is
 * injected so tests can drive a fake event sequence offline.
 */

interface RunState {
  id: string;
  userId: string;
  input: AnalyzeInput;
  status: "running" | "done" | "error";
  events: RunEvent[];
  rating?: string;
  finalState?: unknown;
  error?: string;
  createdAt: number;
  updatedAt: number;
  controller: AbortController;
  waiters: Array<() => void>;
}

export type StreamFn = (
  userId: string,
  input: AnalyzeInput,
  signal: AbortSignal,
) => AsyncIterable<RunEvent>;

/** Cap on in-memory runs. Completed runs are persisted to the store, so
 *  terminating old in-memory entries (LRU by createdAt) bounds memory for a
 *  long-lived dev server. Running runs are never evicted. */
const MAX_KEPT_RUNS = 30;

export interface RunSnapshot {
  id: string;
  userId: string;
  ticker: string;
  tradeDate: string;
  assetType: "stock" | "crypto";
  selectedAnalysts: string | null;
  status: "running" | "done" | "error";
  rating: string | null;
  finalStateJson: string | null;
  error: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface RunManagerOptions {
  /** Invoked (fire-and-forget) when a run is created and when it terminates. */
  onUpdate?: (snapshot: RunSnapshot) => void;
}

export class RunManager {
  private runs = new Map<string, RunState>();

  constructor(private stream: StreamFn, private opts: RunManagerOptions = {}) {}

  create(userId: string, input: AnalyzeInput): string {
    const id = `run_${Math.random().toString(36).slice(2, 10)}`;
    const now = Date.now();
    const controller = new AbortController();
    const run: RunState = {
      id,
      userId,
      input,
      status: "running",
      events: [],
      createdAt: now,
      updatedAt: now,
      controller,
      waiters: [],
    };
    this.runs.set(id, run);
    this.evict();
    this.opts.onUpdate?.(this.snapshot(run));
    // Fire-and-forget consumption; errors flip status and wake waiters.
    this.consume(run).catch((e) => {
      // If the run was cancelled, cancel() already set status/error and woke
      // waiters — the aborted stream's rejection would otherwise overwrite the
      // friendlier "cancelled" message.
      if (run.controller.signal.aborted) return;
      run.status = "error";
      run.error = e instanceof Error ? e.message : String(e);
      run.updatedAt = Date.now();
      this.wake(run);
      this.opts.onUpdate?.(this.snapshot(run));
    });
    return id;
  }

  /** Drop oldest terminated runs once we exceed the cap. */
  private evict(): void {
    if (this.runs.size <= MAX_KEPT_RUNS) return;
    const terminated = [...this.runs.values()]
      .filter((r) => r.status !== "running")
      .sort((a, b) => a.createdAt - b.createdAt);
    while (this.runs.size > MAX_KEPT_RUNS && terminated.length > 0) {
      const oldest = terminated.shift()!;
      this.runs.delete(oldest.id);
    }
  }

  /** Abort a running run. No-op if it already terminated. */
  cancel(id: string): boolean {
    const run = this.runs.get(id);
    if (!run || run.status !== "running") return false;
    run.status = "error";
    run.error = "cancelled";
    run.updatedAt = Date.now();
    run.controller.abort();
    this.wake(run);
    this.opts.onUpdate?.(this.snapshot(run));
    return true;
  }

  snapshot(run: RunState): RunSnapshot {
    return {
      id: run.id,
      userId: run.userId,
      ticker: run.input.ticker,
      tradeDate: run.input.tradeDate,
      assetType: run.input.assetType ?? "stock",
      selectedAnalysts: run.input.selectedAnalysts
        ? run.input.selectedAnalysts.join(",")
        : null,
      status: run.status,
      rating: run.rating ?? null,
      finalStateJson: run.finalState ? JSON.stringify(run.finalState) : null,
      error: run.error ?? null,
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
    };
  }

  private async consume(run: RunState): Promise<void> {
    let terminal = false;
    for await (const ev of this.stream(run.userId, run.input, run.controller.signal)) {
      run.events.push(ev);
      if (ev.type === "done") {
        run.status = "done";
        run.rating = ev.rating;
        run.finalState = ev.finalState;
        terminal = true;
      } else if (ev.type === "error") {
        // An aborted stream surfaces as an "Abort" error event. If the run was
        // cancelled, cancel() already set the friendlier "cancelled" status —
        // don't let the abort event overwrite it.
        if (!run.controller.signal.aborted) {
          run.status = "error";
          run.error = ev.message;
        }
        terminal = true;
      }
      this.wake(run);
    }
    if (run.status === "running") {
      // Stream ended without an explicit terminal event — treat as done.
      run.status = "done";
      terminal = true;
      this.wake(run);
    }
    if (terminal) {
      run.updatedAt = Date.now();
      this.opts.onUpdate?.(this.snapshot(run));
    }
  }

  private wake(run: RunState): void {
    const waiters = run.waiters;
    run.waiters = [];
    for (const fn of waiters) fn();
  }

  get(id: string): RunState | undefined {
    return this.runs.get(id);
  }

  /** Drain buffered events, then stream live until the run terminates. */
  async *subscribe(id: string): AsyncGenerator<RunEvent> {
    const run = this.runs.get(id);
    if (!run) throw new Error(`run not found: ${id}`);
    let cursor = 0;
    for (;;) {
      while (cursor < run.events.length) {
        yield run.events[cursor]!;
        cursor++;
      }
      if (run.status === "done" || run.status === "error") return;
      // No await between checking length and registering the waiter — consume()
      // cannot interleave in that synchronous window (single event loop).
      await new Promise<void>((resolve) => run.waiters.push(resolve));
    }
  }
}
