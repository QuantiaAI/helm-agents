import { describe, it, expect } from "vitest";
import { pickModelId } from "../src/lib/settings-ui";

const deepseek = [{ modelId: "deepseek-v4-pro" }, { modelId: "deepseek-v4-flash" }];

describe("pickModelId", () => {
  it("keeps the current model when it is a valid option", () => {
    expect(pickModelId("deepseek-v4-flash", deepseek)).toBe("deepseek-v4-flash");
  });

  it("falls back to the first option when current is not in the list (cross-provider default)", () => {
    // The exact bug: gpt-5.4-mini saved against deepseek -> must reconcile.
    expect(pickModelId("gpt-5.4-mini", deepseek)).toBe("deepseek-v4-pro");
  });

  it("picks the first option when current is undefined", () => {
    expect(pickModelId(undefined, deepseek)).toBe("deepseek-v4-pro");
  });

  it("leaves current untouched for custom providers (no options)", () => {
    expect(pickModelId("my-custom-model", [])).toBe("my-custom-model");
    expect(pickModelId(undefined, [])).toBeUndefined();
  });
});
