import { describe, it, expect } from "vitest";
import { parseDebate } from "../src/lib/debate";

// The engine emits each debate turn as `${side} Analyst: ${content}` and joins
// them with "\n" (packages/agents researchers/risk-mgmt). parseDebate recovers
// the per-turn speaker + body so the UI can render bull/bear chat bubbles.
describe("parseDebate", () => {
  it("splits an investment bull/bear history into alternating turns", () => {
    const turns = parseDebate(
      "Bull Analyst: Demand is strong.\nBear Analyst: Valuation is rich.\nBull Analyst: Moat holds.",
    );
    expect(turns).toHaveLength(3);
    expect(turns[0]).toBeDefined();
    expect(turns[1]).toBeDefined();
    expect(turns[2]).toBeDefined();
    expect(turns[0]!).toMatchObject({ speaker: "Bull", side: "left", text: "Demand is strong." });
    expect(turns[1]!).toMatchObject({ speaker: "Bear", side: "right", text: "Valuation is rich." });
    expect(turns[2]!).toMatchObject({ speaker: "Bull", side: "left", text: "Moat holds." });
    // glyphs/colors are populated from the speaker map.
    expect(turns[0]!.glyph).toBe("多");
    expect(turns[0]!.color).toBe("#00D68F");
    expect(turns[1]!.glyph).toBe("空");
    expect(turns[1]!.color).toBe("#F0496E");
  });

  it("keeps multi-line argument bodies attached to their speaker", () => {
    const turns = parseDebate(
      "Bull Analyst: First line.\nSecond line of bull.\nBear Analyst: Counter.",
    );
    expect(turns).toHaveLength(2);
    expect(turns[0]!.text).toBe("First line.\nSecond line of bull.");
    expect(turns[1]!.text).toBe("Counter.");
  });

  it("parses the three-way risk debate (aggressive/conservative/neutral)", () => {
    const turns = parseDebate(
      "Aggressive Analyst: Push size to 8%.\nConservative Analyst: Cut to 4%.\nNeutral Analyst: Keep 6%.",
    );
    expect(turns.map((t) => t.speaker)).toEqual([
      "Aggressive",
      "Conservative",
      "Neutral",
    ]);
    expect(turns[0]!).toMatchObject({ glyph: "激", color: "#F08A4B" });
    expect(turns[1]!).toMatchObject({ glyph: "保", color: "#2DE2E6" });
    expect(turns[2]!).toMatchObject({ glyph: "中", color: "#E0B43C" });
  });

  it("returns [] for prose with no recognizable speaker markers", () => {
    expect(parseDebate("Just some prose without speakers.")).toEqual([]);
    expect(parseDebate("")).toEqual([]);
  });
});
