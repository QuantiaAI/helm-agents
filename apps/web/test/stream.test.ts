// @vitest-environment node
// Runs in node (not jsdom) so global fetch/Response/ReadableStream/AbortSignal
// are the platform implementations — avoids the jsdom↔undici AbortSignal seam
// that forces the Analyze component test to mock the client.
import { describe, it, expect, vi, afterEach } from "vitest";
import { streamRun } from "../src/api/client";

function streamResponse(chunks: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      const enc = new TextEncoder();
      for (const ch of chunks) c.enqueue(enc.encode(ch));
      c.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "content-type": "application/x-ndjson" },
  });
}

async function drain(): Promise<unknown[]> {
  const out: unknown[] = [];
  for await (const ev of streamRun("run_1", new AbortController().signal)) {
    out.push(ev);
  }
  return out;
}

afterEach(() => vi.restoreAllMocks());

describe("streamRun", () => {
  it("yields parsed RunEvents, one per NDJSON line", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      streamResponse([
        JSON.stringify({ type: "nodeEnd", node: "Market Analyst", patch: {} }) + "\n",
        JSON.stringify({ type: "done", rating: "Buy", finalState: {} }) + "\n",
      ]),
    );
    const evs = await drain();
    expect(evs).toHaveLength(2);
    expect(evs[0]).toMatchObject({ type: "nodeEnd", node: "Market Analyst" });
    expect(evs[1]).toMatchObject({ type: "done", rating: "Buy" });
  });

  it("buffers across chunk boundaries that split a line", async () => {
    const line = JSON.stringify({ type: "done", rating: "Hold", finalState: {} });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      // Split the single JSON line across two chunks; the newline arrives last.
      streamResponse([line.slice(0, 10), line.slice(10) + "\n"]),
    );
    const evs = await drain();
    expect(evs).toEqual([{ type: "done", rating: "Hold", finalState: {} }]);
  });

  it("throws when the stream response is not ok", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("nope", { status: 404 }),
    );
    await expect(drain()).rejects.toThrow(/stream failed: HTTP 404/);
  });
});
