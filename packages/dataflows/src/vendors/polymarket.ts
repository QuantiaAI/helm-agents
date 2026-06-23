/**
 * Polymarket prediction-markets vendor (ports dataflows/polymarket.py).
 * Keyless: uses the public Gamma API. Returns forward-looking event
 * probabilities ranked by traded volume.
 */
import type { VendorFn, VendorImpl } from "../router.js";

const GAMMA_BASE = "https://gamma-api.polymarket.com";

interface GammaMarket {
  question?: string;
  outcomes?: unknown;
  outcomePrices?: unknown;
  volume?: string | number;
  endDate?: string;
  active?: boolean;
  closed?: boolean;
}

function parseJsonList(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function createPolymarketVendor(
  fetchImpl: typeof fetch = globalThis.fetch,
): VendorImpl {
  const getPredictionMarkets: VendorFn = async (_topic?: string, limit = 8) => {
    const url = `${GAMMA_BASE}/markets?closed=false&active=true&order=volume&ascending=false&limit=${limit}`;
    const res = await fetchImpl(url, {
      headers: { "User-Agent": "tradingagents-web/0.1" },
    });
    if (!res.ok) {
      return `NO_DATA_AVAILABLE: polymarket HTTP ${res.status}`;
    }
    const markets = (await res.json()) as GammaMarket[];
    if (!Array.isArray(markets) || markets.length === 0) {
      return "No open Polymarket prediction markets found.";
    }
    const lines = markets.slice(0, limit).map((m) => {
      const outcomes = parseJsonList(m.outcomes);
      const prices = parseJsonList(m.outcomePrices).map((p) =>
        (Number(p) * 100).toFixed(0) + "%",
      );
      const pairs = outcomes
        .map((o, i) => `${o}: ${prices[i] ?? "?"}`)
        .join(" | ");
      return `- ${m.question ?? "(unnamed)"} — ${pairs}`;
    });
    return ["## Polymarket prediction markets", ...lines].join("\n");
  };

  return { name: "polymarket", methods: { getPredictionMarkets } };
}
