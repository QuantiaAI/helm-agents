import { describe, it, expect } from "vitest";
import {
  createLlmClient,
  listProviders,
  listSettingsProviders,
  getInterfaceType,
  resolveProviderDeps,
  isOpenAiCompatible,
  getProviderSpec,
  ProviderNotImplementedError,
} from "../src/index.js";

describe("provider registry", () => {
  it("lists all known providers (16 OpenAI-compatible + 5 native = 21)", () => {
    const providers = listProviders();
    expect(providers).toContain("openai");
    expect(providers).toContain("anthropic");
    expect(providers).toContain("anthropic_compatible");
    expect(providers).toContain("google");
    expect(providers).toContain("ollama");
    expect(providers).toContain("openrouter");
    expect(providers).toContain("openai_compatible");
    expect(providers).toHaveLength(21); // 16 OpenAI-compatible + 5 native
  });

  it("anthropic_compatible is an anthropic-native, base-url-required custom provider", () => {
    const s = getProviderSpec("anthropic_compatible");
    expect(s?.native).toBe("anthropic");
    expect(s?.requireBaseUrl).toBe(true);
    expect(s?.keyEnv).toBe("ANTHROPIC_COMPATIBLE_API_KEY");
  });

  it("derives interface type from native flag", () => {
    expect(getInterfaceType("openai")).toBe("openai");
    expect(getInterfaceType("deepseek")).toBe("openai");
    expect(getInterfaceType("openai_compatible")).toBe("openai");
    expect(getInterfaceType("anthropic")).toBe("anthropic");
    expect(getInterfaceType("anthropic_compatible")).toBe("anthropic");
  });

  it("listSettingsProviders excludes unsupported natives and tags interface", () => {
    const list = listSettingsProviders();
    const names = list.map((p) => p.name);
    expect(names).not.toContain("google");
    expect(names).not.toContain("azure");
    expect(names).not.toContain("bedrock");
    expect(list.find((p) => p.name === "openai")?.interface).toBe("openai");
    expect(list.find((p) => p.name === "anthropic")?.interface).toBe("anthropic");
    expect(list.find((p) => p.name === "anthropic_compatible")?.interface).toBe("anthropic");
  });

  it("carries faithful base URLs for compatible providers", () => {
    expect(getProviderSpec("deepseek")?.baseUrl).toBe(
      "https://api.deepseek.com",
    );
    expect(getProviderSpec("openrouter")?.baseUrl).toBe(
      "https://openrouter.ai/api/v1",
    );
    expect(getProviderSpec("ollama")?.baseUrl).toBe(
      "http://localhost:11434/v1",
    );
  });

  it("maps dual-region providers to separate endpoints", () => {
    expect(getProviderSpec("qwen")?.baseUrl).toMatch(/dashscope-intl/);
    expect(getProviderSpec("qwen-cn")?.baseUrl).toMatch(/^https:\/\/dashscope\./);
  });
});

describe("isOpenAiCompatible", () => {
  it("true for the compatible family", () => {
    expect(isOpenAiCompatible("openai")).toBe(true);
    expect(isOpenAiCompatible("ollama")).toBe(true);
  });
  it("false for native clients", () => {
    expect(isOpenAiCompatible("anthropic")).toBe(false);
    expect(isOpenAiCompatible("bedrock")).toBe(false);
  });
});

describe("resolveProviderDeps", () => {
  it("resolves the env var API key", () => {
    const d = resolveProviderDeps({
      provider: "openai",
      model: "gpt-4o-mini",
      env: { OPENAI_API_KEY: "sk-from-env" },
    });
    expect(d.apiKey).toBe("sk-from-env");
  });

  it("explicit apiKey wins over env", () => {
    const d = resolveProviderDeps({
      provider: "openai",
      model: "m",
      apiKey: "sk-explicit",
      env: { OPENAI_API_KEY: "sk-env" },
    });
    expect(d.apiKey).toBe("sk-explicit");
  });

  it("ollama is keyless (placeholder when no key)", () => {
    const d = resolveProviderDeps({ provider: "ollama", model: "qwen:latest" });
    expect(d.apiKey).toBe("ollama");
    expect(d.baseUrl).toBe("http://localhost:11434/v1");
  });

  it("ollama honors OLLAMA_BASE_URL env override", () => {
    const d = resolveProviderDeps({
      provider: "ollama",
      model: "m",
      env: { OLLAMA_BASE_URL: "http://host:1234/v1" },
    });
    expect(d.baseUrl).toBe("http://host:1234/v1");
  });

  it("openai_compatible requires an explicit base URL", () => {
    expect(() =>
      resolveProviderDeps({ provider: "openai_compatible", model: "m" }),
    ).toThrow(/requires an explicit base URL/);
  });

  it("throws ProviderNotImplementedError for azure/bedrock", () => {
    expect(() => resolveProviderDeps({ provider: "bedrock", model: "m" })).toThrow(
      ProviderNotImplementedError,
    );
    expect(() => resolveProviderDeps({ provider: "azure", model: "m" })).toThrow(
      ProviderNotImplementedError,
    );
  });

  it("resolves the native anthropic + google clients", () => {
    const a = resolveProviderDeps({
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      env: { ANTHROPIC_API_KEY: "sk-ant" },
    });
    expect(a.apiKey).toBe("sk-ant");
    const g = resolveProviderDeps({
      provider: "google",
      model: "gemini-1.5-pro",
      env: { GOOGLE_API_KEY: "g-key" },
    });
    expect(g.apiKey).toBe("g-key");
  });
});

describe("createLlmClient", () => {
  it("builds an OpenAI-compatible client", () => {
    const c = createLlmClient({
      provider: "openai",
      model: "gpt-4o-mini",
      apiKey: "sk-test",
    });
    expect(typeof c.invoke).toBe("function");
    expect(c.provider).toBe("openai");
    expect(c.model).toBe("gpt-4o-mini");
  });

  it("throws on unknown provider", () => {
    expect(() =>
      createLlmClient({ provider: "nope", model: "m" }),
    ).toThrow(/Unknown provider/);
  });
});
