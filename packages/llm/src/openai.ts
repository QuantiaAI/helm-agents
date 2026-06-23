/**
 * OpenAI-compatible client (ports tradingagents/llm_clients/openai_client).
 *
 * One client backs the entire OpenAI-compatible family: OpenAI, xAI, DeepSeek,
 * Qwen, GLM, MiniMax, OpenRouter, Mistral, Kimi, Groq, NVIDIA, Ollama, and the
 * generic endpoint. They all speak the Chat Completions API and differ only by
 * base URL / auth, which the registry supplies.
 */
import OpenAI from "openai";
import { extractFirstJsonObject } from "@helm-agents/shared";
import type { InvokeInput, LlmClient, LlmResult } from "./types.js";
import { getCapabilities } from "./capabilities.js";
import {
  chooseResponseFormat,
  isJsonSchemaUnsupported,
  structuredInstruction,
} from "./structured-format.js";

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam;

export function createOpenAiCompatibleClient(opts: {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}): LlmClient {
  // Pass the platform's native fetch (Node 18+ undici / Next's patched fetch)
  // so the SDK doesn't fall back to its bundled node-fetch@2 — which calls the
  // deprecated url.parse() (Node DEP0169 warning) on every request.
  const client = new OpenAI({
    apiKey: opts.apiKey || "missing",
    baseURL: opts.baseUrl,
    fetch: globalThis.fetch,
  });

  return {
    provider: opts.provider,
    model: opts.model,

    async invoke(input: InvokeInput): Promise<LlmResult> {
      const caps = getCapabilities(opts.model);
      const fmt = chooseResponseFormat(caps, input.structured);
      const hasStruct = !!input.structured;
      const system =
        (hasStruct ? structuredInstruction(input.structured!) + "\n" : "") +
        (input.system ?? "");

      const messages: ChatMessage[] = [];
      if (system) messages.push({ role: "system", content: system });
      for (const m of input.messages) {
        messages.push({ role: m.role, content: m.content } as ChatMessage);
      }

      const base = { model: opts.model, messages };
      let res;
      try {
        res = await client.chat.completions.create({
          ...base,
          ...(fmt ? { response_format: fmt } : {}),
        });
      } catch (err) {
        // A provider may advertise json_schema but reject it at runtime (HTTP 400).
        // Retry once with plain json_object before surfacing the error.
        if (fmt?.type === "json_schema" && isJsonSchemaUnsupported(err)) {
          res = await client.chat.completions.create({
            ...base,
            response_format: { type: "json_object" },
          });
        } else {
          throw err;
        }
      }

      const content = res.choices[0]?.message?.content ?? "";
      const parsed = input.structured ? tryParseStructured(content, input.structured) : undefined;

      return {
        content,
        parsed,
        usage: {
          input: res.usage?.prompt_tokens ?? 0,
          output: res.usage?.completion_tokens ?? 0,
        },
      };
    },
  };
}

function tryParseStructured(content: string, schema: unknown): unknown {
  // Lenient: recover the first JSON object even if the model wrapped it in prose
  // or duplicated it (strict JSON.parse of the whole string would throw).
  const json = extractFirstJsonObject(content);
  if (json === undefined) return undefined;
  try {
    // Zod schemas expose a .parse method.
    const maybeSchema = schema as { parse?: (v: unknown) => unknown };
    if (typeof maybeSchema.parse === "function") {
      return maybeSchema.parse(json);
    }
    return json;
  } catch {
    // Caller falls back to free-text handling (ports invoke_structured_or_freetext).
    return undefined;
  }
}
