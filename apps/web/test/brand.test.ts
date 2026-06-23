import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { BRAND } from "../src/lib/brand";
import tw from "../tailwind.config";

describe("brand source of truth", () => {
  it("exposes the HelmAgents wordmark", () => {
    expect(BRAND.name).toBe("HelmAgents");
    expect(BRAND.wordmark.primary).toBe("Helm");
    expect(BRAND.wordmark.accent).toBe("Agents");
  });
  it("carries keyword-rich SEO metadata", () => {
    expect(BRAND.metaTitle).toBe("HelmAgents · Multi-Agent LLM Trading Desk");
    expect(BRAND.metaDescription).toMatch(/multi-agent llm trading/i);
    expect(BRAND.builtOn).toBe("TradingAgents");
  });
});

describe("helm brand color token", () => {
  it("registers the cyan Helm brand accent + design-system rating palette", () => {
    const colors = (tw as any).theme.extend.colors;
    // Brand accent = cyan #2DE2E6 (design system §02). `primary`/`hover` are
    // back-comat aliases so existing bg-helm-primary usages recolor automatically.
    expect(colors.helm.primary).toBe("#2DE2E6");
    expect(colors.helm.hover).toBe("#5BECEF");
    // Rating palette = design system §03 5-tier scale (single source = theme-tokens).
    expect(colors.rating.Buy).toBe("#00D68F");
    expect(colors.rating.Sell).toBe("#F0496E");
  });
});

describe("favicon", () => {
  it("ships a swarm/collective-intelligence icon.svg in the brand accent color", () => {
    const svg = readFileSync(path.resolve(__dirname, "../public/icon.svg"), "utf8");
    expect(svg).toContain("<circle");
    expect(svg).toContain("#2DE2E6");
  });
});
