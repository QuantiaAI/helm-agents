/**
 * FRED macro-indicators vendor (ports dataflows/fred.py). Free API key from
 * FRED_API_KEY. Friendly aliases map short names (e.g. "cpi") to FRED series IDs.
 */
import { VendorNotConfiguredError } from "../errors.js";
import type { VendorFn, VendorImpl } from "../router.js";

const FRED_BASE = "https://api.stlouisfed.org/fred";

const MACRO_SERIES: Record<string, string> = {
  policy_rate: "FEDFUNDS",
  fed_funds: "FEDFUNDS",
  "10y_yield": "DGS10",
  "2y_yield": "DGS2",
  cpi: "CPIAUCSL",
  core_cpi: "CPILFESL",
  pce: "PCEPI",
  core_pce: "PCEPILFE",
  gdp: "GDP",
  unemployment: "UNRATE",
  nonfarm_payrolls: "PAYEMS",
  m2: "WM2NS",
  vix: "VIXCLS",
  dollar_index: "DTWEXBGS",
  consumer_confidence: "UMCSENT",
  housing_starts: "HOUST",
  retail_sales: "RSAFS",
};

function resolveSeriesId(indicator: string): string {
  const key = indicator.toLowerCase().trim();
  if (key in MACRO_SERIES) return MACRO_SERIES[key]!;
  return indicator.trim().toUpperCase();
}

export function createFredVendor(
  apiKey: string | undefined,
  fetchImpl: typeof fetch = globalThis.fetch,
): VendorImpl {
  const getMacroIndicators: VendorFn = async (indicator = "policy_rate") => {
    if (!apiKey) throw new VendorNotConfiguredError("fred");
    const seriesId = resolveSeriesId(String(indicator));
    const url = `${FRED_BASE}/series/observations?series_id=${encodeURIComponent(seriesId)}&api_key=${encodeURIComponent(apiKey)}&file_type=json&sort_order=desc&limit=6`;
    const res = await fetchImpl(url);
    if (!res.ok) {
      return `NO_DATA_AVAILABLE: fred HTTP ${res.status}`;
    }
    const json = (await res.json()) as {
      observations?: Array<{ date?: string; value?: string }>;
    };
    const obs = json.observations ?? [];
    const rows = obs
      .filter((o) => o.value && o.value !== ".")
      .slice(0, 6)
      .map((o) => `${o.date}: ${o.value}`);
    if (rows.length === 0) {
      return `No FRED observations for ${seriesId}.`;
    }
    return [`## FRED macro: ${seriesId}`, ...rows].join("\n");
  };

  return { name: "fred", methods: { getMacroIndicators } };
}
