/**
 * Anthropic native client (ports llm_clients/anthropic_client.py). Structured
 * output is delivered via forced tool_use with a JSON-schema input. Uses an
 * injectable transport so tests run offline.
 */
import Anthropic from "@anthropic-ai/sdk";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { InvokeInput, LlmClient, LlmResult } from "./types.js";

export interface AnthropicContentBlock {
  type: "text" | "tool_use";
  text?: string;
  input?: unknown;
  name?: string;
}

export interface AnthropicMessageResponse {
  content: AnthropicContentBlock[];
  usage?: { input_tokens?: number; output_tokens?: number };
}

export interface AnthropicCreateArgs {
  model: string;
  max_tokens: number;
  system?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  tools?: unknown[];
  tool_choice?: unknown;
}

export interface AnthropicTransport {
  createMessage(args: AnthropicCreateArgs): Promise<AnthropicMessageResponse>;
}

/** 构造传给 Anthropic SDK 的选项：仅在给定时带 baseURL，空 key 回退占位符（离线安全）。 */
export function anthropicClientOptions(
  apiKey?: string,
  baseUrl?: string,
): { apiKey: string; baseURL?: string; fetch: typeof globalThis.fetch } {
  const opts: { apiKey: string; baseURL?: string; fetch: typeof globalThis.fetch } = {
    apiKey: apiKey || "missing",
    // Native fetch — avoid the bundled node-fetch@2 fallback (url.parse / DEP0169).
    fetch: globalThis.fetch,
  };
  if (baseUrl) opts.baseURL = baseUrl;
  return opts;
}

export function makeAnthropicTransport(
  apiKey: string,
  baseUrl?: string,
): AnthropicTransport {
  const client = new Anthropic(anthropicClientOptions(apiKey, baseUrl));
  return {
    async createMessage(args) {
      return (await client.messages.create(args as never)) as unknown as AnthropicMessageResponse;
    },
  };
}

function tryParse(input: unknown, schema: unknown): unknown {
  const maybe = schema as { parse?: (v: unknown) => unknown };
  if (typeof maybe.parse === "function") {
    try {
      return maybe.parse(input);
    } catch {
      return undefined;
    }
  }
  return input;
}

export function createAnthropicClient(opts: {
  model: string;
  apiKey?: string;
  baseUrl?: string;
  transport?: AnthropicTransport;
}): LlmClient {
  const transport =
    opts.transport ?? makeAnthropicTransport(opts.apiKey ?? "", opts.baseUrl);
  return {
    provider: "anthropic",
    model: opts.model,
    async invoke(input: InvokeInput): Promise<LlmResult> {
      const messages = input.messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      let tools: unknown[] | undefined;
      let toolChoice: unknown;
      if (input.structured) {
        const schema = zodToJsonSchema(input.structured, { target: "openApi3" });
        tools = [
          {
            name: "extract",
            description: "Return the structured result.",
            input_schema: schema,
          },
        ];
        toolChoice = { type: "tool", name: "extract" };
      }

      const res = await transport.createMessage({
        model: opts.model,
        max_tokens: 4096,
        system: input.system,
        messages,
        tools,
        tool_choice: toolChoice,
      });

      let content = "";
      let parsed: unknown;
      for (const block of res.content) {
        if (block.type === "text") {
          content += block.text ?? "";
        } else if (block.type === "tool_use" && input.structured) {
          parsed = tryParse(block.input, input.structured);
          content = JSON.stringify(block.input ?? {});
        }
      }

      return {
        content,
        parsed,
        usage: {
          input: res.usage?.input_tokens ?? 0,
          output: res.usage?.output_tokens ?? 0,
        },
      };
    },
  };
}
