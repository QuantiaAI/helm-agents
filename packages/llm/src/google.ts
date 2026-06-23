/**
 * Google (Gemini) native client (ports llm_clients/google_client.py). Structured
 * output via responseMimeType "application/json" + responseSchema. Injectable
 * transport for offline tests.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { zodToJsonSchema } from "zod-to-json-schema";
import { extractFirstJsonObject } from "@helm-agents/shared";
import type { InvokeInput, LlmClient, LlmResult } from "./types.js";

export interface GoogleGenerateArgs {
  model: string;
  system?: string;
  prompt: string;
  responseSchema?: unknown;
}

export interface GoogleGenerateResponse {
  text: string;
  usage: { in: number; out: number };
}

export interface GoogleTransport {
  generate(args: GoogleGenerateArgs): Promise<GoogleGenerateResponse>;
}

export function makeGoogleTransport(apiKey: string): GoogleTransport {
  const genAI = new GoogleGenerativeAI(apiKey || "missing");
  return {
    async generate(args) {
      const model = genAI.getGenerativeModel({
        model: args.model,
        systemInstruction: args.system,
        generationConfig: args.responseSchema
          ? {
              responseMimeType: "application/json",
              // ResponseSchema is a structured object; the JSON-schema form is
              // structurally compatible. Cast to satisfy the SDK's strict type.
              responseSchema: args.responseSchema as unknown as never,
            }
          : undefined,
      });
      const result = await model.generateContent(args.prompt);
      const response = result.response;
      const usage = response.usageMetadata;
      return {
        text: response.text(),
        usage: {
          in: usage?.promptTokenCount ?? 0,
          out: usage?.candidatesTokenCount ?? 0,
        },
      };
    },
  };
}

function tryParse(text: string, schema: unknown): unknown {
  // Lenient: recover the first JSON object even if the model wrapped it in prose
  // or duplicated it (strict JSON.parse of the whole string would throw).
  const json = extractFirstJsonObject(text);
  if (json === undefined) return undefined;
  const maybe = schema as { parse?: (v: unknown) => unknown };
  try {
    if (typeof maybe.parse === "function") return maybe.parse(json);
    return json;
  } catch {
    return undefined;
  }
}

export function createGoogleClient(opts: {
  model: string;
  apiKey?: string;
  transport?: GoogleTransport;
}): LlmClient {
  const transport = opts.transport ?? makeGoogleTransport(opts.apiKey ?? "");
  return {
    provider: "google",
    model: opts.model,
    async invoke(input: InvokeInput): Promise<LlmResult> {
      const prompt = input.messages
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n\n");
      const responseSchema = input.structured
        ? zodToJsonSchema(input.structured, { target: "openApi3" })
        : undefined;

      const res = await transport.generate({
        model: opts.model,
        system: input.system,
        prompt,
        responseSchema,
      });

      return {
        content: res.text,
        parsed: input.structured ? tryParse(res.text, input.structured) : undefined,
        usage: { input: res.usage.in, output: res.usage.out },
      };
    },
  };
}
