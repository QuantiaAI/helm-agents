/**
 * Pure helpers that decide the Chat Completions `response_format` for a
 * structured request, based on the model's capability table. Kept separate
 * from openai.ts (mirroring capabilities.ts) so they are trivially unit-testable
 * with no network and no SDK client.
 */
import { zodToJsonSchema } from "zod-to-json-schema";
import type { z } from "zod";
import type { ModelCapabilities } from "./capabilities.js";

export type ResponseFormat =
  | { type: "json_schema"; json_schema: { name: string; strict: false; schema: Record<string, unknown> } }
  | { type: "json_object" };

/**
 * Pick the response_format for a structured request, or undefined to send none.
 * Pure: no network, no client.
 */
export function chooseResponseFormat(
  caps: ModelCapabilities,
  structured?: z.ZodType,
): ResponseFormat | undefined {
  if (!structured) return undefined;
  if (caps.supportsJsonSchema && caps.preferredStructuredMethod === "json_schema") {
    return {
      type: "json_schema",
      json_schema: {
        name: "result",
        strict: false,
        schema: zodToJsonSchema(structured, { target: "openApi3" }) as Record<string, unknown>,
      },
    };
  }
  if (caps.supportsJsonMode) return { type: "json_object" };
  return undefined;
}

/**
 * Build a prompt instruction that teaches the model the EXACT JSON shape for a
 * structured request — field list, enum options, and a concrete example — derived
 * from the Zod schema. Needed because non-strict `json_schema` and `json_object`
 * only ask for "some JSON"; without this the model invents its own keys (and, under
 * a non-English output language, localizes enum values, breaking schema parsing).
 * Pure: no network, no client.
 */
export function structuredInstruction(structured: z.ZodType): string {
  type Prop = {
    type?: string;
    enum?: unknown[];
    items?: { type?: string };
    properties?: Record<string, unknown>;
    $ref?: string;
    allOf?: unknown[];
  };
  const js = zodToJsonSchema(structured, { target: "openApi3" }) as {
    properties?: Record<string, Prop>;
    required?: string[];
  };
  const props = js.properties ?? {};
  const required = new Set(js.required ?? []);
  const lines: string[] = [];
  const example: Record<string, unknown> = {};

  const exampleFor = (t?: string): unknown =>
    t === "number" || t === "integer" ? 0 : t === "boolean" ? false : "…";

  for (const [key, p] of Object.entries(props)) {
    const opt = required.has(key) ? "" : " (optional)";
    if (Array.isArray(p.enum) && p.enum.length > 0) {
      lines.push(
        `- "${key}"${opt}: one of ${p.enum.map((e) => JSON.stringify(e)).join(" | ")} — use the value verbatim, in English`,
      );
      example[key] = p.enum[0];
    } else if (p.type === "number" || p.type === "integer") {
      lines.push(`- "${key}"${opt}: number`);
      example[key] = 0;
    } else if (p.type === "boolean") {
      lines.push(`- "${key}"${opt}: boolean`);
      example[key] = false;
    } else if (p.type === "array") {
      const itemType = p.items?.type ?? "string";
      lines.push(`- "${key}"${opt}: array of ${itemType}s`);
      example[key] = [exampleFor(itemType)];
    } else if (p.type === "object" || p.properties || p.$ref || p.allOf) {
      // Nested object (rare; schemas are currently flat). Don't mislabel as string.
      lines.push(`- "${key}"${opt}: object`);
      example[key] = {};
    } else {
      lines.push(`- "${key}"${opt}: string`);
      example[key] = "…";
    }
  }

  return [
    "Respond with ONLY a single JSON object — no markdown code fences, no text before or after it.",
    "Use exactly these fields:",
    ...lines,
    "Enum/category values (e.g. rating, recommendation, action) must be one of the listed options, kept verbatim in English — do NOT translate or localize them. Free-text string fields may be written in the requested output language.",
    "Example of the exact shape (replace the illustrative values):",
    JSON.stringify(example),
    "",
  ].join("\n");
}

/**
 * True only when an error looks like an HTTP 400 — i.e. the provider rejected the
 * (json_schema) request format. Used to retry once as plain json_object. Auth,
 * rate-limit, server, and non-API errors return false.
 */
export function isJsonSchemaUnsupported(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  return (err as { status?: unknown }).status === 400;
}
