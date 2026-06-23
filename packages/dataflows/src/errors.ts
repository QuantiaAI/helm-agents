/**
 * Vendor error hierarchy (ports tradingagents/dataflows/errors.py). The router
 * reacts to these by *behavior* (try next vendor / return sentinel) rather than
 * by vendor identity.
 */
export class VendorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VendorError";
  }
}

/** No usable rows (empty result OR stale data). */
export class NoMarketDataError extends VendorError {
  constructor(
    public vendor: string,
    public symbol: string,
    detail?: string,
  ) {
    super(`[${vendor}] no market data for ${symbol}${detail ? `: ${detail}` : ""}`);
    this.name = "NoMarketDataError";
  }
}

/** Rate limited — router skips to the next vendor in the chain. */
export class VendorRateLimitError extends VendorError {
  constructor(public vendor: string) {
    super(`[${vendor}] rate limited`);
    this.name = "VendorRateLimitError";
  }
}

/** Missing API key / config (also a configuration error). */
export class VendorNotConfiguredError extends VendorError {
  constructor(public vendor: string) {
    super(`[${vendor}] not configured (missing API key)`);
    this.name = "VendorNotConfiguredError";
  }
}
