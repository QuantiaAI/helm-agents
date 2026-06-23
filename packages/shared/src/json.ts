/**
 * Lenient JSON extraction for real-world LLM output, which is not always clean:
 * it may wrap the object in prose, a ```json fence, emit trailing data, or
 * (observed in production) repeat the same object twice. Strict `JSON.parse` of
 * the whole string throws on any of these, dropping otherwise-valid structured
 * output. This recovers the first complete object instead.
 */

/**
 * Extract and parse the FIRST complete JSON object embedded in `text`. Scans
 * from the first `{` through its matching `}` with string/escape awareness (so
 * braces inside string values don't miscount), then `JSON.parse`s that slice.
 * Returns the parsed value, or `undefined` if no balanced object is found or the
 * slice doesn't parse. Pure. "First object wins": a primitive or an object-less
 * array yields `undefined`, but an array wrapping an object (e.g. `[{…}]`) yields
 * that inner object.
 */
export function extractFirstJsonObject(text: string): unknown {
  const start = text.indexOf("{");
  if (start === -1) return undefined;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return undefined;
        }
      }
    }
  }
  return undefined;
}
