import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RunEvent } from "@helm-agents/contracts";
import { renderAt } from "./render";

// Controllable api-client mock (avoids the jsdom↔undici fetch/AbortSignal seam;
// real streaming is covered by apps/api e2e + the streamRun node test).
const apiPost = vi.fn();
const apiGet = vi.fn();
const streamRun = vi.fn();

vi.mock("@/api/client", () => ({
  apiUrl: (p: string) => p,
  apiPost: (...a: unknown[]) => apiPost(...a),
  apiGet: (...a: unknown[]) => apiGet(...a),
  streamRun: (...a: unknown[]) => streamRun(...a),
}));

import { Analyze } from "../src/pages/Analyze";

/** Async generator that yields events, optionally throwing after N of them. */
function gen(events: RunEvent[], throwAfter?: number): AsyncGenerator<RunEvent> {
  return (async function* () {
    let i = 0;
    if (throwAfter === 0) throw new Error("network error");
    for (const e of events) {
      yield e;
      if (++i === throwAfter) throw new Error("network error");
    }
  })();
}

beforeEach(() => {
  apiPost.mockReset();
  apiGet.mockReset();
  streamRun.mockReset();
  apiPost.mockResolvedValue({ runId: "run_1" });
});

describe("Analyze", () => {
  it("creates a run and renders the streamed terminal rating", async () => {
    streamRun.mockReturnValue(
      gen([
        { type: "nodeEnd", node: "Market Analyst", patch: { marketReport: "x" } },
        { type: "done", rating: "Buy", finalState: {} as never },
      ]),
    );
    renderAt("/en/analyze", "/:locale/analyze", <Analyze />);
    await userEvent.click(screen.getByRole("button", { name: /Run analysis/i }));
    expect(await screen.findByText("Buy")).toBeInTheDocument();
    expect(screen.getAllByText("✓", { exact: false }).length).toBeGreaterThan(0);
  });

  it("recovers from a dropped stream: renders the result, not a network error", async () => {
    // Stream drops after one node; the run actually completed server-side.
    streamRun.mockReturnValue(gen([{ type: "nodeEnd", node: "Market Analyst", patch: {} }], 1));
    apiGet.mockResolvedValue({
      id: "run_1",
      status: "done",
      rating: "Sell",
      finalState: { finalTradeDecision: "Rating: Sell" },
    });
    renderAt("/en/analyze", "/:locale/analyze", <Analyze />);
    await userEvent.click(screen.getByRole("button", { name: /Run analysis/i }));

    expect(await screen.findByText("Sell")).toBeInTheDocument();
    // No misleading "can't reach provider / open settings" error surfaced.
    expect(apiGet).toHaveBeenCalledWith("/runs/run_1");
    expect(screen.queryByText(/Open settings/i)).not.toBeInTheDocument();
  });

  it("surfaces the REAL engine error when a dropped run actually failed", async () => {
    streamRun.mockReturnValue(gen([], 0)); // stream fails immediately
    apiGet.mockResolvedValue({
      id: "run_1",
      status: "error",
      error: "401 incorrect api key",
    });
    renderAt("/en/analyze", "/:locale/analyze", <Analyze />);
    await userEvent.click(screen.getByRole("button", { name: /Run analysis/i }));

    // Auth error → the specific errAuth message (not a generic network error).
    expect(
      await screen.findByText(/API key is invalid or missing/i),
    ).toBeInTheDocument();
  });
});
