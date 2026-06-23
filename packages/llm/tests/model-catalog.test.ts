import { describe, it, expect } from "vitest";
import { getModelOptions, isCustomOnly, MODEL_OPTIONS } from "../src/index.js";

describe("model catalog", () => {
  it("returns quick + deep models for openai", () => {
    const quick = getModelOptions("openai", "quick");
    const deep = getModelOptions("openai", "deep");
    expect(quick.length).toBeGreaterThan(0);
    expect(deep.length).toBeGreaterThan(0);
    expect(quick.some((m) => m.modelId === "gpt-5.4-mini")).toBe(true);
    expect(deep.some((m) => m.modelId === "gpt-5.5")).toBe(true);
  });

  it("returns [] for an unknown provider", () => {
    expect(getModelOptions("nope", "quick")).toEqual([]);
  });

  it("marks fast-changing providers as custom-only", () => {
    expect(isCustomOnly("groq")).toBe(true);
    expect(isCustomOnly("openrouter")).toBe(true);
    expect(isCustomOnly("openai")).toBe(false);
  });

  it("shares the GLM list across both regions", () => {
    expect(MODEL_OPTIONS["glm"]?.deep).toEqual(MODEL_OPTIONS["glm-cn"]?.deep);
  });
});
