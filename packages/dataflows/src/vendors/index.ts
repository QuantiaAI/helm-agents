/**
 * Vendor registry builder. Registers all vendors and resolves keyed vendors'
 * API keys from the environment (FRED, Alpha Vantage).
 */
import type { VendorRegistry } from "../router.js";
import { createYfinanceVendor } from "./yfinance.js";
import { createPolymarketVendor } from "./polymarket.js";
import { createFredVendor } from "./fred.js";
import { createAlphaVantageVendor } from "./alpha_vantage.js";
import { createSocialVendor } from "./social.js";

export interface VendorRegistryOptions {
  fetchImpl?: typeof fetch;
  fredApiKey?: string;
  alphaVantageApiKey?: string;
  env?: NodeJS.ProcessEnv;
}

export function buildVendorRegistry(
  optsOrFetch: VendorRegistryOptions | typeof fetch = {},
): VendorRegistry {
  const opts: VendorRegistryOptions =
    typeof optsOrFetch === "function" ? { fetchImpl: optsOrFetch } : optsOrFetch;
  const env = opts.env ?? process.env;
  const fetchImpl = opts.fetchImpl ?? globalThis.fetch;

  return {
    yfinance: createYfinanceVendor(fetchImpl),
    polymarket: createPolymarketVendor(fetchImpl),
    fred: createFredVendor(opts.fredApiKey ?? env.FRED_API_KEY, fetchImpl),
    alpha_vantage: createAlphaVantageVendor(
      opts.alphaVantageApiKey ?? env.ALPHA_VANTAGE_API_KEY,
      fetchImpl,
    ),
    social: createSocialVendor(fetchImpl),
  };
}

export { createYfinanceVendor } from "./yfinance.js";
export { createPolymarketVendor } from "./polymarket.js";
export { createFredVendor } from "./fred.js";
export { createAlphaVantageVendor } from "./alpha_vantage.js";
export { createSocialVendor } from "./social.js";
