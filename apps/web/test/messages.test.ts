import { describe, it, expect } from "vitest";
import en from "../messages/en.json";
import zh from "../messages/zh.json";
import ja from "../messages/ja.json";
import ko from "../messages/ko.json";
import fr from "../messages/fr.json";
import de from "../messages/de.json";
import es from "../messages/es.json";
import vi from "../messages/vi.json";

function keys(obj: unknown, prefix = ""): string[] {
  if (obj === null || typeof obj !== "object") return prefix ? [prefix] : [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    keys(v, prefix ? `${prefix}.${k}` : k),
  );
}

describe("message catalogs", () => {
  const refs = keys(en).sort();
  it("en has a non-trivial key set", () => {
    expect(refs.length).toBeGreaterThan(20);
  });

  for (const [loc, cat] of Object.entries({ zh, ja, ko, fr, de, es, vi })) {
    it(`${loc} has the same key set as en`, () => {
      expect(keys(cat).sort()).toEqual(refs);
    });
  }
});
