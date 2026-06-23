/**
 * Vendor routing (ports tradingagents/dataflows/interface.route_to_vendor).
 *
 * The configured value IS the exact vendor chain (comma-separated, e.g.
 * "yfinance,alpha_vantage"). The router does NOT silently fall back to a vendor
 * that is not in the configured chain. When every vendor in the chain yields no
 * data, it returns a NO_DATA_AVAILABLE sentinel so the agent can report
 * "unavailable" instead of fabricating numbers.
 */
import type { ResolvedConfig } from "@helm-agents/config";
import {
  NoMarketDataError,
  VendorError,
  VendorNotConfiguredError,
  VendorRateLimitError,
} from "./errors.js";
import { METHOD_CATEGORY, type DataMethod } from "./catalog.js";

export type VendorFn = (...args: any[]) => Promise<unknown>;

export interface VendorImpl {
  readonly name: string;
  readonly methods: Partial<Record<DataMethod, VendorFn>>;
}

export type VendorRegistry = Record<string, VendorImpl>;

export const NO_DATA_PREFIX = "NO_DATA_AVAILABLE";

export type RouteFn = (method: DataMethod, ...args: any[]) => Promise<unknown>;

export interface RouteContext {
  args: unknown[];
}

function splitChain(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Resolve the configured vendor chain for a method (tool-level > category). */
export function configuredChain(
  method: DataMethod,
  config: ResolvedConfig,
): string[] {
  const tool = config.toolVendors[method];
  if (tool) return splitChain(tool);
  const category = METHOD_CATEGORY[method];
  const chain = config.dataVendors[category];
  if (chain) return splitChain(chain);
  return [];
}

export async function routeToVendor(
  method: DataMethod,
  ctx: RouteContext,
  config: ResolvedConfig,
  registry: VendorRegistry,
): Promise<unknown> {
  const chain = configuredChain(method, config);
  const tried: string[] = [];

  for (const name of chain) {
    const vendor = registry[name];
    if (!vendor) continue;
    const fn = vendor.methods[method];
    if (typeof fn !== "function") continue;
    tried.push(name);

    try {
      const out = await fn(...ctx.args);
      if (typeof out === "string" && out.startsWith(NO_DATA_PREFIX)) continue;
      return out;
    } catch (e) {
      // Behavior-based handling: skip to next vendor on these recoverable errors.
      if (
        e instanceof VendorRateLimitError ||
        e instanceof VendorNotConfiguredError ||
        e instanceof NoMarketDataError
      ) {
        continue;
      }
      // Unexpected errors propagate (includes raw VendorError subclasses).
      if (e instanceof VendorError) throw e;
      throw e;
    }
  }

  return `${NO_DATA_PREFIX}: ${method} (tried: ${tried.join(",") || "none"})`;
}

/** Bind config + registry into a simple route(method, ...args) function. */
export function createRouter(
  config: ResolvedConfig,
  registry: VendorRegistry,
): RouteFn {
  return (method: DataMethod, ...args: unknown[]) =>
    routeToVendor(method, { args }, config, registry);
}
