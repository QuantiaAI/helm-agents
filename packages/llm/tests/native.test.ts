import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  anthropicClientOptions,
  createAnthropicClient,
  createGoogleClient,
  createLlmClient,
  getCapabilities,
  DEFAULT_CAPABILITIES,
  type AnthropicTransport,
  type GoogleTransport,
} from "../src/index.js";

const PlanSchema = z.object({
  recommendation: z.enum(["Buy", "Overweight", "Hold", "Underweight", "Sell"]),
  rationale: z.string(),
  strategicActions: z.array(z.string()),
});

describe("anthropic client", () => {
  it("returns structured output parsed from the tool_use block", async () => {
    const transport: AnthropicTransport = {
      async createMessage(args) {
        expect(args.tools).toBeDefined();
        expect(args.tool_choice).toEqual({ type: "tool", name: "extract" });
        return {
          content: [
            {
              type: "tool_use",
              input: {
                recommendation: "Buy",
                rationale: "AI demand",
                strategicActions: ["add"],
              },
            },
          ],
          usage: { input_tokens: 10, output_tokens: 20 },
        };
      },
    };
    const c = createAnthropicClient({ model: "claude-3-5", transport });
    const res = await c.invoke({
      system: "s",
      messages: [{ role: "user", content: "plan" }],
      structured: PlanSchema,
    });
    expect(res.parsed).toMatchObject({ recommendation: "Buy" });
    expect(res.usage).toEqual({ input: 10, output: 20 });
  });

  it("returns plain text when no schema is requested", async () => {
    const transport: AnthropicTransport = {
      async createMessage() {
        return { content: [{ type: "text", text: "hello" }] };
      },
    };
    const c = createAnthropicClient({ model: "claude", transport });
    const res = await c.invoke({ messages: [{ role: "user", content: "hi" }] });
    expect(res.content).toBe("hello");
    expect(res.parsed).toBeUndefined();
  });
});

describe("anthropic baseUrl wiring", () => {
  it("builds client options with baseURL only when provided", () => {
    const withUrl = anthropicClientOptions("sk-x", "https://gw/v1");
    expect(withUrl).toMatchObject({
      apiKey: "sk-x",
      baseURL: "https://gw/v1",
    });
    expect(typeof withUrl.fetch).toBe("function"); // native fetch (no node-fetch)
    const noUrl = anthropicClientOptions("sk-x");
    expect(noUrl.baseURL).toBeUndefined();
    expect(noUrl.apiKey).toBe("sk-x");
    expect(typeof noUrl.fetch).toBe("function"); // native fetch (no node-fetch)
  });

  it("falls back to a placeholder apiKey when empty (offline-safe)", () => {
    expect(anthropicClientOptions("").apiKey).toBe("missing");
  });

  it("createLlmClient(anthropic_compatible) requires a base url", () => {
    expect(() =>
      createLlmClient({ provider: "anthropic_compatible", model: "claude-x", apiKey: "k" }),
    ).toThrow(/base URL/i);
  });

  it("createLlmClient(anthropic_compatible) with base url returns an anthropic client", () => {
    const client = createLlmClient({
      provider: "anthropic_compatible",
      model: "claude-x",
      apiKey: "k",
      baseUrl: "https://gw/v1",
    });
    expect(client.provider).toBe("anthropic");
    expect(client.model).toBe("claude-x");
  });
});

describe("google client", () => {
  it("parses JSON structured output", async () => {
    const transport: GoogleTransport = {
      async generate(args) {
        expect(args.responseSchema).toBeDefined();
        return {
          text: JSON.stringify({
            recommendation: "Hold",
            rationale: "balanced",
            strategicActions: [],
          }),
          usage: { in: 3, out: 4 },
        };
      },
    };
    const c = createGoogleClient({ model: "gemini-1.5-pro", transport });
    const res = await c.invoke({
      system: "s",
      messages: [{ role: "user", content: "plan" }],
      structured: PlanSchema,
    });
    expect(res.parsed).toMatchObject({ recommendation: "Hold" });
  });

  it("recovers structured output when the model duplicates the JSON object", async () => {
    // Real-world failure: the model emitted the same object twice (\n\n joined).
    // Strict JSON.parse of the whole string throws; lenient extraction recovers it.
    const one = JSON.stringify({ recommendation: "Sell", rationale: "weak", strategicActions: [] });
    const transport: GoogleTransport = {
      async generate() {
        return { text: `${one}\n\n${one}`, usage: { in: 1, out: 1 } };
      },
    };
    const c = createGoogleClient({ model: "gemini-1.5-pro", transport });
    const res = await c.invoke({
      messages: [{ role: "user", content: "plan" }],
      structured: PlanSchema,
    });
    expect(res.parsed).toMatchObject({ recommendation: "Sell" });
  });
});

describe("registry routes native clients", () => {
  it("builds an anthropic client via createLlmClient", () => {
    const c = createLlmClient({
      provider: "anthropic",
      model: "claude-3-5-sonnet",
      apiKey: "sk-ant",
    });
    expect(c.provider).toBe("anthropic");
  });
  it("builds a google client via createLlmClient", () => {
    const c = createLlmClient({
      provider: "google",
      model: "gemini-1.5-pro",
      apiKey: "g",
    });
    expect(c.provider).toBe("google");
  });
});

describe("capabilities", () => {
  it("returns defaults for a generic model", () => {
    const caps = getCapabilities("gpt-4o-mini");
    expect(caps).toEqual(DEFAULT_CAPABILITIES);
  });
  it("downgrades deepseek-reasoning models", () => {
    const caps = getCapabilities("deepseek-r1");
    expect(caps.supportsToolChoice).toBe(false);
    expect(caps.preferredStructuredMethod).toBe("json_mode");
  });
});
