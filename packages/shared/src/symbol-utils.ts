/**
 * Symbol normalization to a Yahoo-finance symbol (ports
 * tradingagents/dataflows/symbol_utils.normalize_symbol). Pure, no network.
 */

const ALIASES: Record<string, string> = {
  XAUUSD: "GC=F",
  XAGUSD: "SI=F",
  WTICOUSD: "CL=F",
  UKOUSD: "BZ=F",
  SPX500: "^GSPC",
  US500: "^GSPC",
  NAS100: "^NDX",
  US30: "^DJI",
  DJI: "^DJI",
  DOWJ: "^DJI",
};

const CRYPTO_TICKER_RE = /^(BTC|ETH|SOL|XRP|DOGE|ADA|AVAX|LINK)(USD|USDT)$/i;

export function normalizeSymbol(input: string): string {
  const trimmed = input.trim();
  const s = trimmed.toUpperCase();
  if (!s) return trimmed;

  if (ALIASES[s]) return ALIASES[s]!;

  // crypto: BTCUSD / BTC-USD / ETHUSD -> <BASE>-USD
  const cryptoShort = s.match(CRYPTO_TICKER_RE);
  if (cryptoShort) {
    const base = cryptoShort[1]!.toUpperCase();
    return `${base}-USD`;
  }
  if (/^[A-Z]+-USD$/.test(s)) return s;

  // 6-letter forex pair of two ISO currencies -> PAIR=X
  if (/^[A-Z]{6}$/.test(s)) return `${s}=X`;

  return trimmed;
}
