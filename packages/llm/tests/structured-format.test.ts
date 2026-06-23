import { describe, it, expect } from "vitest";
import { z } from "zod";
import { chooseResponseFormat, isJsonSchemaUnsupported, structuredInstruction, DEFAULT_CAPABILITIES, type ModelCapabilities } from "../src/index.js";

const SCHEMA = z.object({ rating: z.string() });

const jsonSchemaCaps: ModelCapabilities = { ...DEFAULT_CAPABILITIES };
const jsonModeOnly: ModelCapabilities = { ...DEFAULT_CAPABILITIES, supportsJsonSchema: false, preferredStructuredMethod: "json_mode" };
const noFormat: ModelCapabilities = { ...DEFAULT_CAPABILITIES, supportsJsonSchema: false, supportsJsonMode: false, preferredStructuredMethod: "freetext" };

describe("chooseResponseFormat", () => {
  it("returns undefined when there is no structured schema", () => {
    expect(chooseResponseFormat(jsonSchemaCaps, undefined)).toBeUndefined();
  });

  it("chooses non-strict json_schema when the model supports it", () => {
    const fmt = chooseResponseFormat(jsonSchemaCaps, SCHEMA);
    expect(fmt?.type).toBe("json_schema");
    expect(fmt).toMatchObject({ type: "json_schema", json_schema: { name: "result", strict: false } });
    expect(typeof (fmt as any).json_schema.schema).toBe("object");
  });

  it("falls back to json_object when only json_mode is supported", () => {
    expect(chooseResponseFormat(jsonModeOnly, SCHEMA)).toEqual({ type: "json_object" });
  });

  it("returns undefined when neither format is supported", () => {
    expect(chooseResponseFormat(noFormat, SCHEMA)).toBeUndefined();
  });
});

describe("isJsonSchemaUnsupported", () => {
  it("is true only for a 400 status", () => {
    expect(isJsonSchemaUnsupported({ status: 400 })).toBe(true);
  });
  it("is false for 401 / 429 / 500", () => {
    expect(isJsonSchemaUnsupported({ status: 401 })).toBe(false);
    expect(isJsonSchemaUnsupported({ status: 429 })).toBe(false);
    expect(isJsonSchemaUnsupported({ status: 500 })).toBe(false);
  });
  it("is false for non-API errors", () => {
    expect(isJsonSchemaUnsupported(new Error("boom"))).toBe(false);
    expect(isJsonSchemaUnsupported("string")).toBe(false);
    expect(isJsonSchemaUnsupported(null)).toBe(false);
    expect(isJsonSchemaUnsupported(undefined)).toBe(false);
  });
});

describe("structuredInstruction", () => {
  const Decision = z.object({
    rating: z.enum(["Buy", "Hold", "Sell"]),
    executiveSummary: z.string(),
    priceTarget: z.number().optional(),
  });

  it("lists every field, the enum's English values, and an example", () => {
    const out = structuredInstruction(Decision);
    expect(out).toContain("rating");
    expect(out).toContain("executiveSummary");
    expect(out).toContain("priceTarget");
    // enum values enumerated verbatim
    expect(out).toContain('"Buy"');
    expect(out).toContain('"Sell"');
    // explicit English-enum constraint
    expect(out).toMatch(/English/);
    // a concrete JSON example using the first enum value
    expect(out).toContain('{"rating":"Buy"');
    // JSON-only directive
    expect(out).toMatch(/only a single json object/i);
  });

  it("marks optional fields and keeps required ones unmarked", () => {
    const out = structuredInstruction(Decision);
    expect(out).toMatch(/"priceTarget" \(optional\)/);
    expect(out).toMatch(/"rating"(?! \(optional\)):/); // required → no marker
  });

  it("derives array item type from the schema", () => {
    const Plan = z.object({
      recommendation: z.enum(["Buy", "Sell"]),
      strategicActions: z.array(z.string()),
    });
    const out = structuredInstruction(Plan);
    expect(out).toContain("array of strings");
    expect(out).toContain('"strategicActions":["…"]');
  });
});
