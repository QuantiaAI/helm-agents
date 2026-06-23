/**
 * Provider-agnostic classification of a raw run/engine error into a UI bucket.
 * The bucket selects a localized, vendor-neutral message key (ERR_MSG_KEY) so
 * the main error line never leaks a specific provider (e.g. OpenAI); the raw
 * text is shown only in the collapsible "technical details".
 */
export type ErrKind = "auth" | "network" | "ratelimit" | "generic";

/** Explicit kind → catalog key map (avoids fragile string-casing transforms). */
export const ERR_MSG_KEY: Record<ErrKind, "errAuth" | "errNetwork" | "errRateLimit" | "errGeneric"> = {
  auth: "errAuth",
  network: "errNetwork",
  ratelimit: "errRateLimit",
  generic: "errGeneric",
};

export function classifyError(raw: string): ErrKind {
  const s = raw.toLowerCase();
  // Auth first — a 401 with "network" in the text should still be auth.
  if (/\b401\b|api[_ -]?key|unauthorized|incorrect api key|forbidden/.test(s)) return "auth";
  // libuv connect family + generic network/timeout wording.
  if (/fetch failed|econn|enotfound|etimedout|eai_again|ehostunreach|timed out|timeout|network|socket hang up|aborted/.test(s)) {
    return "network";
  }
  if (/\b429\b|\brate[ _-]?limit\b|too many requests/.test(s)) return "ratelimit";
  return "generic";
}
