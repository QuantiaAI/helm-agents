import { describe, it, expect } from "vitest";
import { extractFirstJsonObject } from "../src/json.js";

describe("extractFirstJsonObject", () => {
  it("parses a clean object", () => {
    expect(extractFirstJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(extractFirstJsonObject('  {"a":1}  ')).toEqual({ a: 1 });
  });

  it("returns the FIRST object when a duplicate is appended (the trader bug)", () => {
    const doubled = '{"action":"Sell","stopLoss":150}\n\n{"action":"Sell","stopLoss":150}';
    expect(extractFirstJsonObject(doubled)).toEqual({ action: "Sell", stopLoss: 150 });
  });

  it("ignores trailing prose after the object", () => {
    expect(extractFirstJsonObject('{"a":1}\nThanks!')).toEqual({ a: 1 });
  });

  it("ignores leading prose before the object", () => {
    expect(extractFirstJsonObject('Here you go: {"a":1}')).toEqual({ a: 1 });
  });

  it("respects braces inside string values", () => {
    expect(extractFirstJsonObject('{"a":"}{","b":2} trailing')).toEqual({ a: "}{", b: 2 });
  });

  it("handles escaped quotes inside strings", () => {
    expect(extractFirstJsonObject('{"a":"say \\"hi\\""}x')).toEqual({ a: 'say "hi"' });
  });

  it("handles nested objects", () => {
    expect(extractFirstJsonObject('{"a":{"b":1},"c":2} trailing')).toEqual({ a: { b: 1 }, c: 2 });
  });

  it("handles a value ending in an escaped backslash before the closing quote", () => {
    // JSON value is a single backslash; the escaped "\\" must not be mistaken
    // for the start of an escape on the closing quote.
    expect(extractFirstJsonObject('{"a":"\\\\"}')).toEqual({ a: "\\" });
  });

  it("returns undefined when there is no object", () => {
    expect(extractFirstJsonObject("just a sentence")).toBeUndefined();
    expect(extractFirstJsonObject("[1,2]")).toBeUndefined();
    expect(extractFirstJsonObject("42")).toBeUndefined();
    expect(extractFirstJsonObject("")).toBeUndefined();
  });

  it("returns undefined for an unbalanced/invalid object", () => {
    expect(extractFirstJsonObject('{"a":')).toBeUndefined();
    expect(extractFirstJsonObject("{not json}")).toBeUndefined();
  });
});
